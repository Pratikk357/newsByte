# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class NewsScrapperItem(scrapy.Item):
    title = scrapy.Field()
    link = scrapy.Field()
    tag = scrapy.Field()
    contents = scrapy.Field()
    date = scrapy.Field()
    author = scrapy.Field()
    image = scrapy.Field()

    
    