# 📰 NewsByte — Automated Nepali/English News Summarizer

<!-- ![NewsByte Banner](https://project-banner) -->

**NewsByte** is an automated Nepali news aggregation and summarization platform that streamlines information consumption from multiple online news portals.  
It collects articles from **Ekantipur** and **The Kathmandu Post**, summarizes them using a **hybrid TF-IDF + TextRank** algorithm, and presents concise, contextually accurate summaries via an intuitive, responsive web interface.

---

## 🚀 Features

- **Automated Web Scraping** — Uses **Scrapy** and **Playwright** for scalable, policy-compliant scraping of Nepali news portals.
- **Hybrid NLP Summarization** — Summarizes articles to ~30% of their original size using a **TF-IDF-enhanced TextRank** algorithm.
- **Asynchronous Processing** — **RabbitMQ** handles scraping, summarization, and storage pipelines in parallel for high throughput.
- **Scalable Backend** — **NestJS** APIs with **Prisma ORM** provide efficient, secure data access.
- **Search & Filter Support** — Full-text search with **PostgreSQL tsvector** and topic-based filtering (Politics, Business, Sports, etc.).
- **Responsive Frontend** — Built using **React 18** with TypeScript, optimized for both mobile and desktop.
- **Bilingual Support** — Summarization pipeline optimized for **English** and **Nepali** news content.
- **Secure & Reliable** — JWT-authenticated API endpoints, HTTPS communication, and WCAG 2.1 accessibility compliance.

---

## 🏗️ Architecture Overview

```
           ┌─────────────┐
           │   Scrapy    │  <-- Web Crawling (Ekantipur, Kathmandu Post)
           └──────┬──────┘
                  │
           ┌──────▼──────┐
           │ RabbitMQ    │  <-- Asynchronous Message Broker
           └──────┬──────┘
                  │
           ┌──────▼──────┐
           │ Summarizer  │  <-- TF-IDF + TextRank Engine
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
- **React 18** + **TypeScript**
- **Material-UI** for responsive layouts
- **React Query** for data synchronization
- **Axios** for API integration

### **Backend**
- **NestJS 9** (TypeScript-based framework)
- **Prisma ORM** for type-safe database interactions
- **JWT Authentication** for secure endpoints
- **Swagger (OpenAPI 3.0)** for API documentation

### **Data Pipeline**
- **Scrapy** + **Playwright** for dynamic web scraping
- **RabbitMQ** for distributed task management
- **TF-IDF + TextRank** for extractive summarization

### **Database**
- **PostgreSQL 14** (GIN-indexed full-text search)

### **Infrastructure**
- **Docker** for containerized deployment
- **GitHub Actions** for CI/CD
- **Prometheus** for monitoring
- **Sentry** for error tracking

---

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/fuunshi/newsbyte.git
cd newsbyte
````

### 2️⃣ Set up environment variables

Create a `.env` file in the root directory:

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/newsbyte
JWT_SECRET=your_jwt_secret
RABBITMQ_URL=amqp://localhost

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3️⃣ Install dependencies

#### Backend:

```bash
cd backend
npm install
npx prisma migrate dev
```

#### Frontend:

```bash
cd frontend
npm install
```

### 4️⃣ Start services

```bash
docker-compose up -d
```

---

## 🧪 Testing

### Unit Tests

```bash
cd backend
npm run test
```

### System Tests

* **Scraping validation** — Ensures that news articles are collected and summarized correctly.
* **API tests** — Validates RESTful endpoints and JWT-based authentication.
* **Frontend tests** — Covers filters, search, and accessibility compliance.

---

## 📊 Performance Benchmarks

| Feature                    | Metric                 |
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

---

## 📝 License

This project is licensed under the **Apache License**.

---

<!-- ## 🌐 Live Demo

* **Frontend:** [https://newsbyte.app](https://newsbyte.app)
* **API Docs:** [https://api.newsbyte.app/docs](https://api.newsbyte.app/docs) -->

