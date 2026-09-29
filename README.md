# 📰 NewsByte — Automated Nepali/English News Summarizer

<!-- ![NewsByte Banner](https://project-banner) -->

**NewsByte** is an automated Nepali news aggregation and summarization platform that streamlines information consumption from multiple online news portals.  
It collects articles from **Ekantipur** and **The Kathmandu Post**, summarizes them using a **hybrid TF-IDF + TextRank** algorithm, and presents concise, contextually accurate summaries via an intuitive, responsive web interface.

---

## 🚀 Features

- **Automated Web Scraping** — **Scrapy** spiders collect the day's articles from Ekantipur and The Kathmandu Post.
- **Hybrid NLP Summarization** — Summarizes articles to ~30% of their sentences using a **TF-IDF-weighted TextRank** algorithm (PageRank computed by power iteration).
- **Asynchronous Processing** — **RabbitMQ** decouples the scraper from the backend; messages are durable and persistent.
- **Scalable Backend** — **NestJS** (Fastify) APIs with **Prisma ORM** provide efficient, type-safe data access.
- **Search & Filter Support** — Ranked full-text search with a GIN-indexed **PostgreSQL tsvector**, plus date filtering and pagination.
- **Responsive Frontend** — Built using **React 18** with TypeScript, optimized for both mobile and desktop.
- **Bilingual Support** — Summarization pipeline handles **English** and **Nepali** news content.
- **Secure** — bcrypt-hashed passwords, JWT access/refresh tokens, role-based access control, and a shared secret on queue messages.

---

## 🏗️ Architecture Overview

```
           ┌─────────────┐
           │   Scrapy    │  <-- Web Crawling (Ekantipur, Kathmandu Post)
           └──────┬──────┘
                  │
           ┌──────▼──────┐
           │ Summarizer  │  <-- TF-IDF + TextRank Engine (runs inside the scraper)
           └──────┬──────┘
                  │
           ┌──────▼──────┐
           │ RabbitMQ    │  <-- Asynchronous Message Broker (scraped_data_queue)
           └──────┬──────┘
                  │
           ┌──────▼──────┐
           │ NestJS      │  <-- RabbitMQ consumer (src/rabbit-mq.ts) saves articles
           │ consumer    │
           └──────┬──────┘
                  │
         ┌────────▼────────┐
         │ PostgreSQL DB   │  <-- Stores Summarized Articles
         └────────┬────────┘
                  │
    ┌─────────────▼─────────────┐
    │       NestJS API          │  <-- JWT Auth + RESTful Endpoints
    └─────────────┬─────────────┘
                  │
         ┌────────▼────────┐
         │   React Frontend │  <-- User Interface
         └──────────────────┘
```


---

## 🛠️ Tech Stack

### **Frontend**
- **React 18** + **TypeScript** (Vite)
- **Tailwind CSS** + **shadcn/ui** (Radix UI) components
- **React Query** for data synchronization
- **Axios** for API integration

### **Backend**
- **NestJS 11** on **Fastify** (TypeScript)
- **Prisma ORM** for type-safe database interactions
- **JWT Authentication** with role-based access control
- **Swagger (OpenAPI)** for API documentation at `/swagger`

### **Data Pipeline**
- **Scrapy** for web scraping
- **NLTK** + **NumPy** for the TF-IDF + TextRank summarizer
- **RabbitMQ** for asynchronous message passing

### **Database**
- **PostgreSQL 15** (GIN-indexed `tsvector` full-text search)

### **Infrastructure**
- **Docker Compose** for PostgreSQL and RabbitMQ

---

## 📦 Installation

### 🐳 Quick start: run everything with Docker

The root `docker-compose.yml` runs the whole stack: PostgreSQL, RabbitMQ, database migrations, the REST API, the RabbitMQ consumer, the scraper + summarizer and the frontend.

```bash
cp .env.template .env        # then set JWT_SECRET and MQ_SECRET_KEY to long random strings
docker compose up -d --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| REST API / Swagger | http://localhost:3000 / http://localhost:3000/swagger |
| RabbitMQ UI | http://localhost:15672 (guest / guest) |

The scraper runs all spiders on startup and then every `SCRAPE_INTERVAL` seconds (default 6 hours). Useful commands:

```bash
docker compose logs -f scrapper consumer   # watch articles being scraped and saved
docker compose restart scrapper            # scrape again now
docker compose down                        # stop (add -v to also delete the database)
```

To run each part by hand instead, follow the steps below.

### Prerequisites
- **Docker** (for PostgreSQL and RabbitMQ)
- **Node.js 20+** and npm (or pnpm)
- **Python 3.11+**

### 1️⃣ Clone the repository
```bash
git clone https://github.com/fuunshi/newsbyte.git
cd newsbyte
```

### 2️⃣ Start PostgreSQL and RabbitMQ
```bash
cd backend
docker compose up -d postgres rabbitmq
```
RabbitMQ's management UI is at http://localhost:15672 (guest / guest).

### 3️⃣ Backend
Copy `backend/.env.template` to `backend/.env` and set `JWT_SECRET` and `MQ_SECRET_KEY` to long random strings.

```bash
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npm run start:dev            # REST API on http://localhost:3000 (Swagger at /swagger)
```

In a **second terminal**, start the RabbitMQ consumer that saves scraped articles:
```bash
cd backend
npm run start:consumer
```

### 4️⃣ Frontend
```bash
cd frontend
npm install
npm run dev
```
The API URL is set in `frontend/src/App.tsx` (`http://localhost:3000/`).

### 5️⃣ Scraper
Copy `scrapper/news_scrapper/.env.template` to `scrapper/news_scrapper/.env` and set `MQ_SECRET_KEY` to **the same value** as in `backend/.env`.

```bash
cd scrapper/news_scrapper
python -m venv .venv
.venv\Scripts\activate          # Windows  (Linux/macOS: source .venv/bin/activate)
pip install -r requirements.txt
python -c "import nltk; [nltk.download(p) for p in ('punkt', 'punkt_tab', 'stopwords')]"

scrapy crawl kantipur
scrapy crawl kathmandu_post
```
Each spider summarizes today's articles and publishes them to RabbitMQ when it finishes; the consumer then stores them in PostgreSQL.

### ▶️ Start order (summary)

| # | What | Command | Where |
|---|------|---------|-------|
| 1 | PostgreSQL + RabbitMQ | `docker compose up -d postgres rabbitmq` | `backend/` |
| 2 | REST API | `npm run start:dev` | `backend/` |
| 3 | RabbitMQ consumer | `npm run start:consumer` | `backend/` |
| 4 | Frontend | `npm run dev` | `frontend/` |
| 5 | Scraper (whenever you want fresh news) | `scrapy crawl kantipur` / `scrapy crawl kathmandu_post` | `scrapper/news_scrapper/` |

For production builds use `npm run build`, then `npm run start:prod` and `npm run start:consumer:prod`.

For a detailed explanation of how the system and its algorithms work, see [proj_details.md](proj_details.md).

---

## 🧪 Testing

### Unit Tests

```bash
cd backend
npm run test
```

---

## 📊 Performance Targets

These are design targets; they are not measured by anything in this repository.

| Feature                    | Target                 |
| -------------------------- | ---------------------- |
| Avg. Article Summarization | **< 15s per article**  |
| API Response Time          | **< 500ms**            |
| Daily Capacity             | **1000+ articles/day** |
| Summarization Accuracy     | **ROUGE-1 F1 ≈ 0.72**  |
| Uptime                     | **99% SLA**            |

---

## 📌 Future Enhancements

* 🔹 **Transformer-based Summarization**
  Integrate **DistilBERT** and **Sentence-BERT** for abstractive summaries.
* 🔹 **Real-time News Updates**
  Switch to **RSS monitoring** and **Kafka-based streaming** for instant updates.
* 🔹 **Personalized Recommendations**
  Build user profiles for customized news feeds.
* 🔹 **Extended Multilingual Support**
  Add Maithili and other regional languages.

---

## 📚 References

* [TextRank Algorithm](https://web.eecs.umich.edu/~mihalcea/papers/mihalcea.emnlp04.pdf)
* [TF-IDF Model for Text Summarization](https://www.ijert.org/research/tfidf-model-based-text-summerization-IJERTCONV10IS12021.pdf)

---

## 👨‍💻 Contributors

| Name                | Contributions                                                |
| ------------------- | ------------------------------------------------------------ |
| **Pranil Shrestha** | Backend & Scrapper; collaborated on frontend and NLP modules |
| **Sumit Shrestha**  | Frontend & NLP modules; collaborated on backend and Scrapper |
| **Pratik Sharma**   | Full-text search, auth & message-queue security, scrapper and summarizer updates |

---

## 📝 License

This project is licensed under the **Apache License**.

---

<!-- ## 🌐 Live Demo

* **Frontend:** [https://newsbyte.app](https://newsbyte.app)
* **API Docs:** [https://api.newsbyte.app/docs](https://api.newsbyte.app/docs) -->

