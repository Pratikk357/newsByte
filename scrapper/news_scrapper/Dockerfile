# Scrapy spiders + the TF-IDF/TextRank summarizer (NLP) that runs inside them
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    NLTK_DATA=/usr/share/nltk_data

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Tokenizer and stopword data the summarizer needs
RUN python -c "import nltk; [nltk.download(p, download_dir='/usr/share/nltk_data') for p in ('punkt', 'punkt_tab', 'stopwords')]"

COPY . .

RUN chmod +x run_scrapers.sh

CMD ["./run_scrapers.sh"]
