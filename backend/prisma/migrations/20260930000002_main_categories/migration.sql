-- Data-only migration: move articles from each site's section names onto the main
-- categories. Mirrors toMainCategory() in src/api/categories/main-categories.ts.

CREATE TEMP TABLE category_mapping AS
SELECT id AS old_id,
       CASE
         WHEN section IN ('national', 'politics', 'business', 'world', 'regional', 'sports',
                          'entertainment', 'technology', 'health', 'opinion') THEN section
         WHEN section LIKE '%-pradesh' THEN 'regional'
         WHEN section IN ('money', 'markets') THEN 'business'
         WHEN section = 'international' THEN 'world'
         WHEN section IN ('province', 'kathmandu') THEN 'regional'
         WHEN section IN ('art-culture', 'lifestyle') THEN 'entertainment'
         WHEN section = 'science-and-tech' THEN 'technology'
         ELSE 'national'
       END AS new_name
FROM (
  SELECT id, replace(lower(trim(BOTH '/' FROM trim(name))), '_', '-') AS section
  FROM "Category"
) sections;

-- Make sure every main category that is needed exists
INSERT INTO "Category" (id, name)
SELECT gen_random_uuid()::text, new_name FROM (SELECT DISTINCT new_name FROM category_mapping) needed
ON CONFLICT (name) DO NOTHING;

ALTER TABLE category_mapping ADD COLUMN new_id TEXT;
UPDATE category_mapping m SET new_id = c.id FROM "Category" c WHERE c.name = m.new_name;

-- Re-point links to the main categories (an article or user may already have it)
INSERT INTO "ArticleCategory" ("articleId", "categoryId")
SELECT ac."articleId", m.new_id
FROM "ArticleCategory" ac JOIN category_mapping m ON m.old_id = ac."categoryId"
WHERE m.new_id <> m.old_id
ON CONFLICT DO NOTHING;

INSERT INTO "UserPreference" ("userId", "categoryId")
SELECT up."userId", m.new_id
FROM "UserPreference" up JOIN category_mapping m ON m.old_id = up."categoryId"
WHERE m.new_id <> m.old_id
ON CONFLICT DO NOTHING;

-- Remove the old section categories and their links
DELETE FROM "ArticleCategory" WHERE "categoryId" IN (SELECT old_id FROM category_mapping WHERE new_id <> old_id);
DELETE FROM "UserPreference" WHERE "categoryId" IN (SELECT old_id FROM category_mapping WHERE new_id <> old_id);
DELETE FROM "Category" WHERE id IN (SELECT old_id FROM category_mapping WHERE new_id <> old_id);

DROP TABLE category_mapping;
