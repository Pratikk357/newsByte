import pika
import json
from os import environ
from dotenv import load_dotenv

# Reads scrapper/news_scrapper/.env (see .env.template) into the environment
load_dotenv()

RABBITMQ_HOST = environ.get("RABBITMQ_HOST", "localhost")
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

    # Must match MQ_SECRET_KEY in backend/.env, otherwise the backend drops the message
    auth_key = environ.get("MQ_SECRET_KEY")
    if not auth_key:
        raise RuntimeError("MQ_SECRET_KEY is not set. Add it to scrapper/news_scrapper/.env")
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
