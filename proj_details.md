# NewsByte — Project Details

This document explains how NewsByte works, which algorithms it uses and why the main design decisions were made. For setup instructions, see [README.md](README.md).

---

## 1. What the project does

NewsByte collects the day's news from two Nepali news portals, **Ekantipur** (Nepali) and **The Kathmandu Post** (English). It shortens each article to about 30% of its sentences and shows the summaries on a website, with search and filtering.

```
Scrapy spiders ──► summarizer.py ──► RabbitMQ queue ──► NestJS consumer ──► PostgreSQL ◄── NestJS REST API ◄── React frontend
  (collect)        (TF-IDF+TextRank)  (scraped_data_queue)   (save)                           (serve)
```

The system consists of three independent programs:

| Part | Technology | Folder |
|------|------------|--------|
| Scraper + summarizer | Python, Scrapy, NLTK, NumPy | `scrapper/news_scrapper/` |
| Backend (REST API + queue consumer) | NestJS 11 (Fastify), Prisma, PostgreSQL | `backend/` |
| Frontend | React 18, TypeScript, Vite, Tailwind, shadcn/ui | `frontend/` |

The scraper talks to the backend **only through RabbitMQ**, and the frontend talks to the backend **only through HTTP**. Neither calls the other directly.

---

## 2. Scraper (Python + Scrapy)

Files: `scrapper/news_scrapper/news_scrapper/spiders/kantipur.py` and `kathmandu_post.py`.

Each spider crawls in three levels:

| Step | Method | What it does |
|------|--------|--------------|
| 1 | `parse` | Opens the homepage and reads the menu links (categories such as politics or sports) |
| 2 | `parse_detail` | Opens each category page and collects article links. Keeps **only today's articles** by reading the date from the URL with the regex `\d{4}/\d{2}/\d{2}` |
| 3 | `parse_title` | Opens each article, extracts the title (`h1`), paragraphs (`p::text`) and image (`og:image` meta tag), then calls the summarizer |

Details:
- **CSS selectors** (e.g. `div.row div.description p::text`) locate elements on each page. If a news site changes its HTML, the selectors must be updated.
- **Category** = the menu path, e.g. `/news` becomes the tag `news`.
- Articles are collected in `self.collected_articles` and published to RabbitMQ **once**, in `closed()`, when the spider finishes.
- **Scrapy is asynchronous.** It runs on the Twisted event loop and downloads many pages at the same time.
- **Language:** Ekantipur is summarized as `"nepali"`, and Kathmandu Post as English.
- Each article is sent with its full text (`content`) and its summary (`summarized`).

---

## 3. The algorithm: TF-IDF + TextRank summarization

File: `scrapper/news_scrapper/news_scrapper/summarizer.py`, function `summarize_from_scratch`.

The summarizer is **extractive**: it chooses the most important existing sentences. It does not write new ones.

### Step 1: Split into sentences
- English: NLTK's `sent_tokenize`.
- Nepali: a regex that splits after `।` (purna viram, the Nepali full stop), `.`, `!` or `?` and keeps the punctuation with its sentence.

### Step 2: Preprocess the words in each sentence
- Tokenize the words and convert them to lowercase.
- Remove **stopwords**, the common words that carry little meaning ("the", "is"; "र", "छ" in Nepali). NLTK provides lists for both languages.
- Remove punctuation, including `।`.
- **English only:** reduce words to their stem with the **Porter stemmer** ("celebrating" becomes "celebr"). The Porter stemmer only knows English suffixes, so it is not applied to Nepali.

### Step 3: TF-IDF vector for each sentence
Each sentence is treated as a "document":

- **TF (term frequency)** = count of the word in the sentence ÷ number of words in the sentence
- **IDF (inverse document frequency)** = `log(N ÷ df)`
  - N = number of sentences
  - df = number of sentences that contain the word

A word that appears in every sentence gets IDF = log(1) = 0, so it doesn't help tell sentences apart. Rare, specific words get more weight.

### Step 4: Cosine similarity matrix
For every pair of sentences:

```
sim(i, j) = (vᵢ · vⱼ) / (‖vᵢ‖ · ‖vⱼ‖)
```

The result ranges from 0 (no shared meaningful words) to 1 (the same content). Cosine similarity ignores sentence length and compares only direction (topic).

- The diagonal is 0: a sentence doesn't "vote" for itself, as in standard TextRank.
- A sentence whose vector is all zeros (only stopwords) gets similarity 0 instead of causing a divide-by-zero.

### Step 5: TextRank (PageRank applied to sentences)
- Sentences are the **nodes** of a graph, and similarities are the weighted **edges**. A sentence is important if many important sentences are similar to it.
- **Normalizing:** each column is divided by its sum, so it adds up to 1. The result is a **column-stochastic** transition matrix A: the probability of moving from sentence j to sentence i.
- **Dangling nodes:** a sentence that is similar to no other sentence gets a column of 1/N. It links to every sentence equally, just like a web page with no outgoing links in PageRank.
- **Damping:** with probability 0.15 the "random reader" jumps to a random sentence. With probability 0.85 it follows the similarity links.
- **Power iteration:** start with equal scores and repeat until the scores change by less than 10⁻⁶ (at most 100 rounds):

```
r ← 0.85 · A · r + 0.15 / N
```

**Why this works:** the final r satisfies `r = M·r`, where `M = 0.85·A + 0.15·(1/N)`. So r is the **eigenvector of M with eigenvalue 1**. M is column-stochastic with all entries positive. The **Perron–Frobenius theorem** therefore guarantees that this eigenvector exists, is unique, has all-positive entries, and that power iteration converges to it.

### Step 6: Select sentences
- Keep the top **30%** of sentences by score. Articles with 3 or fewer sentences keep 1 sentence.
- Put the selected sentences back in their **original order**, so the summary reads naturally.

### Worked example
| | Sentence | Words after preprocessing |
|--|----------|---------------------------|
| S1 | "Nepal wins the cricket match." | nepal, win, cricket, match |
| S2 | "Cricket fans celebrate Nepal's win." | cricket, fan, celebr, nepal, win |
| S3 | "The weather is sunny today." | weather, sunni, today |

- S1 and S2 share three words, so their similarity is high.
- S3 shares nothing with either, so its similarity is 0 and it becomes a dangling node.
- S1 and S2 reinforce each other and get the highest scores.
- There are only 3 sentences, so the summary is 1 sentence: S1 or S2.

### Complexity
With n = number of sentences and V = vocabulary size:
- Similarity matrix: O(n²·V)
- Power iteration: O(n²) per round

A news article has roughly 20–60 sentences, so summarizing takes a fraction of a second.

### Evaluation: ROUGE
`rouge()` compares a summary with a reference text using unigram, bigram and trigram overlap, and reports precision, recall and F1. It is the standard metric for summaries but is not called in the pipeline.

**Known issue:** for bigrams and trigrams, `rouge()` compares character pairs instead of word pairs. Only the unigram score is reliable.

### Why extractive and not abstractive?
- It needs no training data and no GPU.
- It never invents facts, because every sentence comes from the original article.
- It works for Nepali, which has few pre-trained summarization models.

Abstractive summarization (e.g. with a transformer) is listed as future work.

---

## 4. RabbitMQ: connecting the scraper and the backend

The scraper publishes this JSON to the queue `scraped_data_queue`:

```json
{
  "pattern": "summarised.articles",
  "data": {
    "authKey": "<MQ_SECRET_KEY>",
    "source": "ekantipur",
    "data": [ { "title": "...", "content": "...", "summarized": "...", "url": "...", "tags": ["news"], "imageUrl": "...", "publishedAt": "..." } ]
  }
}
```

- **Message format:** NestJS's RabbitMQ transport requires the `{pattern, data}` shape. It sends the message to the handler with the same pattern: `@EventPattern("summarised.articles")`.
- **Durability:** the queue is declared `durable=True` and messages are sent with `delivery_mode=2` (persistent), so queued messages survive a RabbitMQ restart.
- **`@EventPattern` vs `@MessagePattern`:** `@EventPattern` is fire-and-forget; no reply goes back to the scraper. `@MessagePattern` is request–response.
- **`authKey`:** a shared secret. It stops anyone who can reach the queue from injecting fake news. The backend compares it with `MQ_SECRET_KEY`, and both sides read the value from their own `.env` file.

**Why a message queue instead of an HTTP call:**
- The scraper and backend don't have to run at the same time.
- Messages aren't lost if the backend is down.
- More consumers can be added later to handle more load.

---

## 5. Backend (NestJS + Fastify + Prisma + PostgreSQL)

The backend has two entry points:
- `src/main.ts`: the REST API (`npm run start:dev`)
- `src/rabbit-mq.ts`: the queue consumer (`npm run start:consumer`)

### Layered architecture
Each feature folder (`news-articles`, `auth`, `categories`, `users`, `source`) is split into the same layers:

| Layer | Responsibility |
|-------|----------------|
| Controller | HTTP routes and queue events only |
| Service | Business logic |
| Repository | Database access through Prisma |
| DTOs | Shapes and validation rules for incoming and outgoing data |

- **Dependency injection** connects the layers: Nest reads each constructor's parameter types and supplies the objects automatically.
- This relies on `emitDecoratorMetadata` and `experimentalDecorators` in `tsconfig.json`.
- `"paths": {"@/*": ["./src/*"]}` in `tsconfig.json` enables imports like `@/common/dto`.
- `ConfigModule` loads `backend/.env` into `process.env` at startup.

### What happens to each HTTP request
1. **Fastify** receives the request. Fastify is used instead of Express for speed. `main.ts` also enables helmet (security headers), gzip compression and CORS.
2. **AuthGuard** (global) checks the `Authorization: Bearer <JWT>` header. Routes marked `@Public()` skip this check.
3. **RolesGuard** (global) compares `@Roles(ADMIN, SUPERADMIN)` with the role stored inside the token.
4. **ValidationPipe** (global) validates the DTO with `class-validator` and converts query strings, so `page=2` becomes the number 2.
5. The request passes through **Controller → Service → Repository → Prisma → PostgreSQL**.
6. **HttpExceptionFilter** turns any thrown error into a consistent JSON error response.

### Main API endpoints
| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| GET | `/news-articles` | Public | List articles (search, date filter, pagination, sort) |
| GET | `/news-articles/:id` | Public | Article details with summary, categories, source |
| POST | `/news-articles` | Admin | Add an article manually |
| DELETE | `/news-articles` | Admin | Soft-delete an article |
| POST | `/auth/login`, `/auth/refresh`, `/auth/logout` | — | Authentication |
| POST | `/users/register` | Public | Create an account |
| GET/POST/DELETE | `/categories` | Mixed | Manage categories |

Swagger documentation is available at `http://localhost:3000/swagger`.

### Saving articles from the queue (`createNewsArticlesFromMQ`)
1. Check `authKey` against `MQ_SECRET_KEY`. If it doesn't match, ignore the message.
2. **Find or create the source** (e.g. "ekantipur").
3. **Normalize the tags** (`/national/` becomes `national`) and **upsert the categories**, so every tag exists as a row.
4. For each article, inside **its own transaction**:
   - **Upsert by `url`**. `url` is unique, so re-scraping updates the article instead of duplicating it (the operation is idempotent). The original publish date is kept.
   - Link the article to its categories with `createMany({ skipDuplicates: true })`, so links that already exist are skipped.
   - Add a summary **only if it differs** from the latest one.
5. `Promise.allSettled` means one failing article doesn't stop the others. Failures are logged.

### Database design (`prisma/schema.prisma`)
- **NewsArticle ↔ Category** is **many-to-many** through the join table `ArticleCategory`, which has a composite primary key `(articleId, categoryId)`.
- **Summary** is its own table, one-to-many from NewsArticle, so an article can have several summaries (e.g. from a future model).
- **Soft delete:** deleting an article sets `deletedAt` and `deletedBy` instead of removing the row. This keeps an audit trail. Soft-deleted articles are hidden from all public queries.
- **LoginHistory** records the IP address, user agent, and login/logout times.
- **UserPreference** and **UserInteraction** (like, share, comment) are modeled for future features.
- **Migrations** live in `prisma/migrations/`. Prisma generates SQL migrations and a type-safe client from the schema.

### Search: PostgreSQL full-text search
- `NewsArticle.searchVector` is a `tsvector` column **generated by PostgreSQL** from the title (weight A) and content (weight B). It stays up to date automatically.
- A **GIN index** (an inverted index: word → list of rows) makes searches fast without scanning every row.
- The query uses `websearch_to_tsquery('simple', q)`, which supports Google-style input such as `"exact phrase"`, `-exclude` and `or`.
- Results are ranked by **`ts_rank`** (title matches rank higher), then by date.
- It uses the `simple` configuration (no language-specific stemming), so it works for both Nepali and English.
- It matches **whole words**, so `cric` doesn't find "cricket".
- **Pagination:** `skip = (page − 1) × limit`, `take = limit`. The defaults are page 1, limit 10, newest first. A separate count query returns the total so the frontend can show page numbers.

### Authentication and security
- **bcrypt:** passwords are stored as salted, slow hashes, so a database leak doesn't reveal them and brute-forcing is expensive.
- **JWT:** a signed token in three parts, `header.payload.signature`, containing `{userId, role}`. It is **stateless**: the server checks the signature and stores no sessions.
- **Access token:** valid for 1 day.
- **Refresh token:** valid for 7 days, marked `type: "refresh"`.
  - `/auth/refresh` **verifies** its signature and expiry before issuing new tokens.
  - A refresh token is rejected if it's used as an access token.
- **RBAC** (role-based access control): the roles are USER, ADMIN and SUPERADMIN.
- **No hardcoded secrets:** `JWT_SECRET` and `MQ_SECRET_KEY` come from `.env`, and the app refuses to start without `JWT_SECRET`.
- **SQL injection:** Prisma parameterizes every query. The raw full-text-search SQL uses Prisma's tagged `$queryRaw` template, which is parameterized too.

---

## 6. Likely viva questions

| Question | Answer |
|----------|--------|
| Why extractive, not abstractive? | No training data or GPU needed, never invents facts, and works for Nepali. |
| Why TF-IDF and not raw word counts? | Raw counts favor common words. IDF lowers the weight of words that appear in many sentences. |
| Why cosine similarity? | It ignores sentence length and compares only direction (topic). |
| What is the damping factor? | The 0.15 chance of jumping to a random sentence. It makes the graph strongly connected, so a unique score vector exists. |
| Why is the eigenvalue 1? | M is column-stochastic (its columns sum to 1), so its largest eigenvalue is 1. The PageRank vector is the eigenvector for that eigenvalue. |
| Why power iteration instead of `eig`? | It's simpler, has cost O(n²) per round, always gives the eigenvector for eigenvalue 1, and is how PageRank is normally computed. `np.linalg.eig` returns eigenvectors in no guaranteed order. |
| How do you handle a sentence with no similar sentences? | It's a dangling node: its column becomes 1/N, as in PageRank. |
| Why 30%? | A common summary ratio: short enough to save time, long enough to keep the main points. |
| Why RabbitMQ? | Decoupling, durability, and the option to add more consumers. |
| How are duplicates prevented? | `url` is unique and articles are upserted on it. Category links use `skipDuplicates`. A summary is added only if it changed. |
| Why Prisma? | Type-safe queries, migrations, and protection from SQL injection. |
| How does search work? | A generated `tsvector` column with a GIN index, `websearch_to_tsquery`, ranked with `ts_rank`. |
| How is the API secured? | Global JWT guard, RBAC, bcrypt, verified refresh tokens, helmet headers, DTO validation, secrets in `.env`. |
| How is Nepali handled differently? | Sentence split on `।`, Nepali stopword list, no stemming, and `simple` text search. |
| What happens if a news site changes its layout? | The CSS selectors stop matching and that spider collects nothing. The selectors must be updated. |

---

## 7. Known limitations and future work

- **Scraping** relies on CSS selectors that are tied to each site's HTML.
- **Nepali stemming:** there is none, so different forms of the same word (e.g. with different case suffixes) are counted as different words.
- **ROUGE:** the bigram and trigram scores in `rouge()` compare characters instead of words.
- **Unused data:** user preferences and interactions are in the schema but have no API yet.
- **Tests:** some unit tests (news-articles, categories) are placeholders that don't provide their dependencies.

Future work: transformer-based summarization, RSS or real-time updates, personalized feeds, and support for more languages (e.g. Maithili).
