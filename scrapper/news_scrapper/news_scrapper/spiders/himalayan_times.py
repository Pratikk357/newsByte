import scrapy
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
import sys
import os
from ..utils.rabbitmq_publisher import publish_bulk

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, parent_dir)

import summarizer


class HimalayanTimesSpider(scrapy.Spider):
    """The Himalayan Times (English). Article links come from the site's per-section
    RSS feeds (listed at /rss); the feeds only carry excerpts, so each article page
    is fetched for the text."""
    name = "himalayan_times"
    allowed_domains = ["thehimalayantimes.com"]

    # The site's firewall returns 403 for generic tool user agents (Scrapy/..., python-requests)
    # but accepts one that identifies this project
    custom_settings = {
        "USER_AGENT": "NewsByte/1.0 (college news summarizer project)",
    }

    # Section feed id -> tag. An article listed in several feeds keeps the tag of
    # the first one (Scrapy drops the repeated request).
    feeds = {
        15: "nepal",
        14: "kathmandu",
        11: "business",
        3: "sports",
        27: "world",
        13: "opinion",
        16: "entertainment",
        17: "science-and-tech",
        33: "health",
        31: "environment",
        19: "education",
    }

    # Only articles published within this window are scraped
    max_age = timedelta(hours=24)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.collected_articles = []

    def closed(self, reason):
        """Send all articles to RabbitMQ once spider finishes."""
        publish_bulk("thehimalayantimes", self.collected_articles)

    def start_requests(self):
        for feed_id, tag in self.feeds.items():
            yield scrapy.Request(
                url=f"https://thehimalayantimes.com/rssFeed/{feed_id}",
                callback=self.parse_feed,
                meta={'tag': tag},
            )

    def parse_feed(self, response):
        response.selector.remove_namespaces()
        cutoff = datetime.now(timezone.utc) - self.max_age

        for item in response.xpath('//item'):
            link = item.xpath('link/text()').get(default="").strip()
            pub_date = item.xpath('pubDate/text()').get()
            if not link or not pub_date:
                continue
            published_at = parsedate_to_datetime(pub_date)
            if published_at < cutoff:
                continue

            yield scrapy.Request(url=link, callback=self.parse_article, meta={
                'tag': response.meta['tag'],
                'published_at': published_at,
            })

    def parse_article(self, response):
        print(f"Processing: {response.url}")

        title_text = (response.css('meta[property="og:title"]::attr(content)').get()
                      or response.css('h1::text').get(default="")).strip()
        image_url = response.css('meta[property="og:image"]::attr(content)').get()

        # One string per paragraph, including text nested in <span>/<a>/etc.
        paragraphs = [
            ' '.join(t.strip() for t in p.css('::text').getall() if t.strip())
            for p in response.css('article.articleDetails div.post-content p')
        ]
        # Drop empty paragraphs and the "Key Takeaways:" box heading
        content_text = ' '.join(p for p in paragraphs if p and p != "Key Takeaways:")
        if not content_text:
            print(f"No content found, skipping: {response.url}")
            return

        summary_text = summarizer.summarize_from_scratch(content_text)
        self.collected_articles.append({
            "title": title_text,
            "content": content_text,
            "summarized": summary_text,
            "publishedAt": response.meta['published_at'].astimezone(timezone.utc).isoformat(),
            "url": response.url,
            "tags": [response.meta['tag']],
            "imageUrl": image_url
        })
