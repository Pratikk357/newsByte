#!/bin/sh
# Runs every spider, then waits SCRAPE_INTERVAL seconds and runs them again.
# Each spider summarizes the day's articles and publishes them to RabbitMQ when it finishes.

INTERVAL="${SCRAPE_INTERVAL:-21600}"

while true; do
  for spider in kantipur kathmandu_post; do
    echo "=== Running spider: $spider ==="
    scrapy crawl "$spider" || echo "Spider $spider failed"
  done
  echo "=== Done. Next run in ${INTERVAL}s ==="
  sleep "$INTERVAL"
done
