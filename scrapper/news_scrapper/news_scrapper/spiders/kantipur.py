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

class KantipurSpider(scrapy.Spider):
    name = "kantipur"
    allowed_domains = ["ekantipur.com"]
    start_urls = ["https://ekantipur.com"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.collected_articles = [] 

    def closed(self, reason):
        """Send all articles to RabbitMQ once spider finishes."""
        publish_bulk("ekantipur", self.collected_articles)

    def parse(self, response):
        print(f"Processing: {response.url}")
        # Category links from the main menu; the menu repeats some links, so de-duplicate
        links = list(dict.fromkeys(response.css('div.menu-wrapper a::attr(href)').getall()))
        print(f"Extracted links: {links}")

        file_paths = [urlparse(link).path.lstrip('/') for link in links]
        print(f"Extracted file paths: {file_paths}")
        yield {
            'file_paths': file_paths,
            'links': links
        }

        for index, link in enumerate(links):
            if urlparse(link).scheme == '':
                full_url = response.urljoin(link)
            else:
                full_url = link

            yield scrapy.Request(url=full_url, callback=self.parse_detail, meta={
                'file_path': file_paths[index],
                'link': link
            })

    def parse_detail(self, response):
        print(f"Processing: {response.url}")

        titles_link = response.css('div.category-description h2 a::attr(href)').getall()
        print(f"Extracted titles: {titles_link}")

        file_path = response.meta['file_path']
        link = response.meta['link']
        
        for title_link in titles_link:
            full_url = response.urljoin(title_link)
            dates = re.findall(r'\d{4}/\d{2}/\d{2}', title_link)
            if not dates:
                continue
            if(datetime.strptime(dates[0], '%Y/%m/%d').date() != datetime.now().date()):
                continue
            
            yield scrapy.Request(url=full_url, callback=self.parse_title, meta={
                'file_path': file_path,
                'link': link,
                'title_link': title_link
            })

    def parse_title(self, response):
        print(f"Processing: {response.url}")

        file_path = response.meta['file_path']
        # Article pages have no <h1>; the headline is in og:title (and an <h2>)
        title_text = (response.css('meta[property="og:title"]::attr(content)').get()
                      or response.css('section.news-section-wrap-story h2 ::text').get(default="")).strip()
        link = response.meta['link']
        title_link = response.meta['title_link']

        # Extract the content from <p> tags, including text nested in <span>/<a>/etc.
        contents = response.css('section.news-section-wrap-story .news-inner-wrapper p ::text').getall()
        content_text = ' '.join([c.strip() for c in contents if c.strip()])
        summary_text = summarizer.summarize_from_scratch(content_text, "nepali")
        image_url = response.css('meta[property="og:image"]::attr(content)').get()
        print(f"Extracted contents: {contents}")
        
        article_obj = {
            "title": title_text,
            "content": content_text,
            "publishedAt": datetime.now().isoformat() + "Z",
            "summarized": summary_text,
            "url": response.url,
            "tags": [file_path],
            "imageUrl": image_url
        }
        
        self.collected_articles.append(article_obj)

        # yield {
        #     'link': link,
        #     'tag': file_path,
        #     'title': title_link,
        #     'content' : ' '.join(contents),
        #     'summary' : summarizer.summarize_from_scratch(' '.join(contents),"nepali")
        # }
