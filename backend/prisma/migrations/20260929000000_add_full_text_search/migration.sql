-- Full-text search: a tsvector column that PostgreSQL keeps up to date automatically.
-- 'simple' config does no language-specific stemming, so it works for Nepali and English.
-- Title matches (weight A) rank higher than content matches (weight B).
ALTER TABLE "NewsArticle" ADD COLUMN "searchVector" tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple'::regconfig, coalesce("title", '')), 'A') ||
    setweight(to_tsvector('simple'::regconfig, coalesce("content", '')), 'B')
  ) STORED;

-- GIN (inverted) index so searches don't scan every row
CREATE INDEX "NewsArticle_searchVector_idx" ON "NewsArticle" USING GIN ("searchVector");
