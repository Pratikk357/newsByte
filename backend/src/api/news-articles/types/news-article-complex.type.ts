import { Prisma } from "@prisma/client";

// Fields shown for another source's article about the same story
const COVERAGE_SELECT = {
  id: true,
  title: true,
  url: true,
  source: { select: { name: true } },
} satisfies Prisma.NewsArticleSelect;

// Relations returned with every article
export const ARTICLE_INCLUDE = {
  articleCategories: {
    include: {
      category: true,
    },
  },
  // Newest first: the DTOs show summaries[0], and re-scraping can add a newer summary
  summaries: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
  source: true,
  // Same story from other sources: the lead (for a grouped article) and its other articles
  story: {
    select: {
      ...COVERAGE_SELECT,
      deletedAt: true,
      storyArticles: { where: { deletedAt: null }, select: COVERAGE_SELECT },
    },
  },
  storyArticles: { where: { deletedAt: null }, select: COVERAGE_SELECT },
} satisfies Prisma.NewsArticleInclude;

export type NewsArticleWithIncludes = Prisma.NewsArticleGetPayload<{
  include: typeof ARTICLE_INCLUDE;
}>;
