import pika
import json

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

channel.queue_declare(queue='scraper', durable=True)

response = {
    "pattern": "summarised.articles",
    "data": {
        "source": "Hamro Patro",
        "data": [
            {
                "title": "New Tech Revolution in Nepal",
                "content": "Nepal is experiencing a massive surge in tech startups, with funding and innovation on the rise.",
                "publishedAt": "2025-08-01T10:30:00Z",
                "url": "https://example.com/news/nepal-tech-revolution",
                "tags": ["technology", "startups", "Nepal"],
                "imageUrl": "https://example.com/images/tech.jpg"
            },
            {
                "title": "Tourism Rebounds After Pandemic",
                "content": "Tourism in Nepal has seen a significant rebound post-pandemic, especially in trekking zones.",
                "publishedAt": "2025-08-03T08:15:00Z",
                "url": "https://example.com/news/nepal-tourism-rebound",
                "tags": ["tourism", "Nepal", "recovery"],
                "imageUrl": "https://example.com/images/tourism.jpg"
            }
        ]
    }
}

channel.basic_publish(
	exchange="",
	routing_key="scraped_data_queue",  # MUST MATCH your NestJS handler pattern!
	body=json.dumps(response),
	properties=pika.BasicProperties(delivery_mode=2)
)

print("Sent message with routing key 'scraper.results'")
connection.close()
