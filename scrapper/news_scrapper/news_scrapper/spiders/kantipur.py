import scrapy
from urllib.parse import urlparse

from datetime import datetime
from ..utils.rabbitmq_publisher import publish_bulk
import re
import sys
import os

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, parent_dir)

import summarizer

# Category paths worth crawling from the top nav
CATEGORY_SLUGS = {
    "news",
    "politics",
    "business",
    "opinion",
    "sports",
    "entertainment",
    "exclusive",
    "breaking",
    "world",
    "national",
    "feature",
    "photo_feature",
    "blog",
    "diaspora",
}


class KantipurSpider(scrapy.Spider):
    name = "kantipur"
    allowed_domains = ["ekantipur.com"]
    start_urls = ["https://ekantipur.com"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.collected_articles = []
        self.seen_urls = set()

    def closed(self, reason):
        """Send all articles to RabbitMQ once spider finishes."""
        publish_bulk("ekantipur", self.collected_articles)

    def parse(self, response):
        print(f"Processing: {response.url}")
        links = response.css("nav a::attr(href)").getall()
        category_links = []
        for link in links:
            path = urlparse(response.urljoin(link)).path.strip("/")
            slug = path.split("/")[0] if path else ""
            if slug in CATEGORY_SLUGS:
                category_links.append(response.urljoin(link))

        # Always include /news even if nav markup changes
        category_links.append("https://ekantipur.com/news")
        category_links = list(dict.fromkeys(category_links))

        file_paths = [urlparse(link).path.lstrip("/") for link in category_links]
        print(f"Extracted links: {category_links}")
        print(f"Extracted file paths: {file_paths}")
        yield {
            "file_paths": file_paths,
            "links": category_links,
        }

        for index, link in enumerate(category_links):
            yield scrapy.Request(
                url=link,
                callback=self.parse_detail,
                meta={
                    "file_path": file_paths[index],
                    "link": link,
                },
            )

    def parse_detail(self, response):
        print(f"Processing: {response.url}")

        titles_link = response.css("h2 a::attr(href)").getall()
        if not titles_link:
            titles_link = response.css('a[href*="/20"]::attr(href)').getall()
        titles_link = list(dict.fromkeys(titles_link))
        print(f"Extracted titles: {titles_link[:10]}")

        file_path = response.meta["file_path"]
        link = response.meta["link"]
        today = datetime.now().date()

        for title_link in titles_link:
            date_matches = re.findall(r"\d{4}/\d{2}/\d{2}", title_link)
            if not date_matches:
                continue
            if datetime.strptime(date_matches[0], "%Y/%m/%d").date() != today:
                continue

            full_url = response.urljoin(title_link)
            if full_url in self.seen_urls:
                continue
            self.seen_urls.add(full_url)

            yield scrapy.Request(
                url=full_url,
                callback=self.parse_title,
                meta={
                    "file_path": file_path,
                    "link": link,
                    "title_link": title_link,
                },
            )

    def parse_title(self, response):
        print(f"Processing: {response.url}")

        file_path = response.meta["file_path"]
        title_text = (
            response.css("h2::text").get(default="")
            or response.css('meta[property="og:title"]::attr(content)').get(default="")
            or ""
        ).strip()

        contents = response.css(".news-section-wrap-story p::text").getall()
        if not contents:
            contents = response.css(".news-inner-wrapper p::text").getall()
        content_text = " ".join([c.strip() for c in contents if c.strip()])
        if not content_text:
            content_text = (
                response.css('meta[name="description"]::attr(content)').get(default="")
                or title_text
            )

        summary_text = (
            summarizer.summarize_from_scratch(content_text, "nepali") or content_text
        )
        image_url = response.css(
            'meta[property="og:image"]::attr(content)'
        ).get()
        print(f"Extracted contents paragraphs: {len(contents)}")

        category = file_path.split("/")[0] if file_path else "news"
        article_obj = {
            "title": title_text,
            "content": content_text,
            "publishedAt": datetime.now().isoformat() + "Z",
            "summarized": summary_text,
            "url": response.url,
            "tags": [category],
            "imageUrl": image_url,
        }

        self.collected_articles.append(article_obj)
