import pika
import json
from os import environ

RABBITMQ_HOST = "localhost"
QUEUE_NAME = "scraped_data_queue"

def publish_bulk(source: str, articles: list):
    """
    Send a bulk of summarised articles to RabbitMQ in the required format.

    :param source: Source name (e.g., 'Hamro Patro', 'Kantipur')
    :param articles: List of article dicts
    """
    if not articles:
        print(f"⚠ No articles to send for {source}")
        return

    # auth_key = environ.get("SECRET_MQ_KEY")   
    auth_key="alskdnkasjoiqkmeksamd09j12k90-asdk/dasv/d.3v"
    message = {
        "pattern": "summarised.articles",
        "data": {
            "authKey": auth_key,
            "source": source,
            "data": articles
        }
    }

    connection = pika.BlockingConnection(pika.ConnectionParameters(RABBITMQ_HOST))
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    channel.basic_publish(
        exchange="",
        routing_key=QUEUE_NAME,
        body=json.dumps(message),
        properties=pika.BasicProperties(delivery_mode=2)
    )

    print(f"✅ Sent {len(articles)} articles from {source} to RabbitMQ")
    connection.close()
