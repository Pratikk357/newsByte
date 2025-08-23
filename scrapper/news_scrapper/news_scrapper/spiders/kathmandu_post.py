import scrapy
from urllib.parse import urlparse
from datetime import datetime
import re
import sys
import os
from ..utils.rabbitmq_publisher import publish_bulk

parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, parent_dir)

import summarizer


class KathmanduPostSpider(scrapy.Spider):
    name = "kathmandu_post"
    allowed_domains = ["kathmandupost.com"]
    start_urls = ["https://kathmandupost.com/"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.collected_articles = []

    def closed(self, reason):
        # print(self.collected_articles, "THIS IS COLLECTED ARTICLES")
        """Send all articles to RabbitMQ once spider finishes."""
        publish_bulk("kathmandupost", self.collected_articles)

    def parse(self, response):
        file_paths = response.css('div.menu-top__list.text-center.hidden-xs.hidden-sm ul li a::attr(href)').getall()

        yield {
            'file_paths': file_paths,
            'links': [response.urljoin(file_path) for file_path in file_paths]
        }

        for index, file_path in enumerate(file_paths):
            full_url = response.urljoin(file_path)
            yield scrapy.Request(url=full_url, callback=self.parse_detail, meta={
                'file_path': file_paths[index],
                'link': full_url
            })

    def parse_detail(self, response):
        print(f"Processing: {response.url}")

        titles_link = response.css('div.block--morenews article div a::attr(href)').getall()
        print(f"Extracted titles: {titles_link}")

        file_path = response.meta['file_path']
        link = response.meta['link']

        for title_link in titles_link:
            full_url = response.urljoin(title_link)
            article_published_date_str = re.findall(r'\d{4}/\d{2}/\d{2}', title_link)[0]
            if(datetime.strptime(article_published_date_str, '%Y/%m/%d').date() != datetime.now().date()):
                continue

            yield scrapy.Request(url=full_url, callback=self.parse_title, meta={
                'file_path': file_path,
                'link': link,
                'title_link': title_link
            })

    def parse_title(self, response):
        print(f"Processing: {response.url}")

        file_path = response.meta['file_path']
        link = response.meta['link']
        title_link = response.meta['title_link']
        title_text = response.css('h1::text').get(default="").strip()
        image_url = response.css('meta[property="og:image"]::attr(content)').get()

        # Extract the content from <p> tags
        contents = response.css('section.story-section p::text').getall()
        content_text = ' '.join([c.strip() for c in contents if c.strip()])
        summary_text = summarizer.summarize_from_scratch(content_text)
        print(f"Extracted contents: {contents}")
        self.collected_articles.append({
            "title": title_text,
            "content": content_text,
            "summerized": summary_text,
            "publishedAt": datetime.now().isoformat() + "Z",
            "url": response.url,
            "tags": [file_path],
            "imageUrl": image_url
        })

        # yield {
        #     'link': link,
        #     'tag': file_path,
        #     'title': title_link,
        #     'content' : ' '.join(contents),
        #     'summary' : summarizer.summarize_from_scratch(' '.join(contents))
        # }
