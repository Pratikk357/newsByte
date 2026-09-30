-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'ne');

-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'en';

-- CreateIndex
CREATE INDEX "NewsArticle_language_idx" ON "NewsArticle"("language");

-- Backfill: same rule as detectLanguage() in story-similarity.ts, i.e. Nepali when
-- the text has more Devanagari (U+0900-U+097F) than Latin letters
UPDATE "NewsArticle"
SET "language" = 'ne'
WHERE length(regexp_replace("title" || ' ' || "content", '[^ऀ-ॿ]', '', 'g'))
    > length(regexp_replace("title" || ' ' || "content", '[^A-Za-z]', '', 'g'));
