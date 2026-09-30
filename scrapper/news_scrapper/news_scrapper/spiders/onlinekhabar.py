import scrapy
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
import sys
import os
from ..utils.rabbitmq_publisher import publish_bulk

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, parent_dir)

import summarizer


class OnlinekhabarSpider(scrapy.Spider):
    """Onlinekhabar (Nepali). Article links come from the site's WordPress category
    RSS feeds; the feeds only carry excerpts, so each article page is fetched for the text."""
    name = "onlinekhabar"
    allowed_domains = ["onlinekhabar.com"]

    # Category feed path -> tag. More specific feeds come first: an article listed in
    # several feeds keeps the tag of the first one.
    feeds = {
        "content/international": "international",
        "content/business/technology": "technology",
        "content/business": "business",
        "content/entertainment": "entertainment",
        "content/opinion": "opinion",
        "content/desh-samachar": "province",
        "content/news": "national",
    }

    # Only articles published within this window are scraped
    max_age = timedelta(hours=24)

    # Onlinekhabar publishes far more than the other sources (~100 articles a day), so
    # each run keeps only this many. Runs every 6 hours mostly see the same recent
    # articles again, so new ones per day stay well below 4 x this number.
    # Override per run: scrapy crawl onlinekhabar -a max_articles=10
    default_max_articles = 20

    def __init__(self, max_articles=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.collected_articles = []
        self.max_articles = int(max_articles) if max_articles else self.default_max_articles
        # Feed items within max_age, by link: {'link', 'tag', 'published_at'}
        self.candidates = {}

    def closed(self, reason):
        """Send all articles to RabbitMQ once spider finishes."""
        publish_bulk("onlinekhabar", self.collected_articles)

    # The feeds are read one after another, so that all candidates are known before
    # choosing which articles to scrape.
    def start_requests(self):
        yield self.feed_request(0)

    def feed_request(self, index):
        path = list(self.feeds)[index]
        return scrapy.Request(
            url=f"https://www.onlinekhabar.com/{path}/feed",
            callback=self.parse_feed,
            errback=self.feed_failed,
            meta={'index': index, 'tag': self.feeds[path]},
            dont_filter=True,
        )

    def parse_feed(self, response):
        response.selector.remove_namespaces()
        cutoff = datetime.now(timezone.utc) - self.max_age

        for item in response.xpath('//item'):
            link = item.xpath('link/text()').get(default="").strip()
            pub_date = item.xpath('pubDate/text()').get()
            if not link or not pub_date or link in self.candidates:
                continue
            published_at = parsedate_to_datetime(pub_date)
            if published_at < cutoff:
                continue
            self.candidates[link] = {
                'link': link,
                'tag': response.meta['tag'],
                'published_at': published_at,
            }

        yield from self.next_step(response.meta['index'])

    def feed_failed(self, failure):
        # Skip a feed that could not be fetched instead of stopping the chain
        self.logger.warning(f"Feed failed: {failure.request.url} ({failure.value})")
        yield from self.next_step(failure.request.meta['index'])

    def next_step(self, index):
        """Read the next feed, or after the last one scrape the chosen articles."""
        if index + 1 < len(self.feeds):
            yield self.feed_request(index + 1)
            return
        chosen = self.choose_articles()
        print(f"Chose {len(chosen)} of {len(self.candidates)} recent articles")
        for article in chosen:
            yield scrapy.Request(url=article['link'], callback=self.parse_article, meta={
                'tag': article['tag'],
                'published_at': article['published_at'],
            })

    def choose_articles(self):
        """
        The newest max_articles candidates, taken round-robin across categories
        (newest of each category in turn) so one busy category cannot fill every slot.
        """
        by_tag = {tag: [] for tag in self.feeds.values()}
        for article in sorted(self.candidates.values(), key=lambda a: a['published_at'], reverse=True):
            by_tag[article['tag']].append(article)

        chosen = []
        while len(chosen) < self.max_articles and any(by_tag.values()):
            for articles in by_tag.values():
                if articles and len(chosen) < self.max_articles:
                    chosen.append(articles.pop(0))
        return chosen

    def parse_article(self, response):
        print(f"Processing: {response.url}")

        title_text = (response.css('meta[property="og:title"]::attr(content)').get()
                      or response.css('h1::text').get(default="")).strip()
        image_url = response.css('meta[property="og:image"]::attr(content)').get()

        # Extract the content from <p> tags, including text nested in <span>/<a>/etc.
        contents = response.css('div.ok18-single-post-content-wrap p ::text').getall()
        content_text = ' '.join([c.strip() for c in contents if c.strip()])
        if not content_text:
            print(f"No content found, skipping: {response.url}")
            return

        summary_text = summarizer.summarize_from_scratch(content_text, "nepali")
        self.collected_articles.append({
            "title": title_text,
            "content": content_text,
            "summarized": summary_text,
            "publishedAt": response.meta['published_at'].astimezone(timezone.utc).isoformat(),
            "url": response.url,
            "tags": [response.meta['tag']],
            "imageUrl": image_url
        })
