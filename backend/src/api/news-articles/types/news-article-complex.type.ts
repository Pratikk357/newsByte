import { Prisma } from "@prisma/client";

export type NewsArticleWithIncludes = Prisma.NewsArticleGetPayload<{
  include: {
    articleCategories: {
      include: {
        category: true;
      };
    };
    summaries: true;
    source: true;
  };
}>;
