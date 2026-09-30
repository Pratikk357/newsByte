import { CategoryGetQueryDTO } from "@/api/categories/dto";
import { PrismaService } from "@/api/prisma/prisma.service";
import { handlePrismaError } from "@/utils/error/handler";
import { Injectable, Logger } from "@nestjs/common";
import { Category, NewsArticle } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { NewsArticleGetQueryDTO } from "./dto/news-article-get.query.dto";
import {
  ARTICLE_INCLUDE,
  NewsArticleWithIncludes,
} from "./types/news-article-complex.type";

@Injectable()
export class NewsArticlesRepository {
  private readonly logger = new Logger(NewsArticlesRepository.name);
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Find By ID
   * @param id Category ID
   * @returns Category
   */
  async findById(
    id: string,
    client?: Prisma.TransactionClient,
  ): Promise<NewsArticle | null> {
    try {
      const prisma = await this.prisma.getClient(client);
      const newsArticle = await prisma.newsArticle.findUnique({
        where: { id },
      });
      return newsArticle;
    } catch (error) {
      this.logger.error(`Error fetching news article by ID: ${error}`);
      handlePrismaError(error, "Something went wrong.");
    }
  }

  /**
 * Find By ID
 * @param id Category ID
 * @returns Category
 */
  async findByIdWithIncludes(
    id: string,
    client?: Prisma.TransactionClient,
  ): Promise<NewsArticleWithIncludes | null> {
    try {
      const prisma = await this.prisma.getClient(client);
      const newsArticle = await prisma.newsArticle.findFirst({
        where: { id, deletedAt: null },
        include: ARTICLE_INCLUDE,
      });
      return newsArticle;
    } catch (error) {
      this.logger.error(`Error fetching news article by ID: ${error}`);
      handlePrismaError(error, "Something went wrong.");
    }
  }

  /**
   * Find many NewsArticles based on query
   * @param query NewsArticleGetQueryDTO
   * @returns { total: number, data: NewsArticle[] }
   */
  async findMany(
    query: NewsArticleGetQueryDTO, // Replace 'any' with NewsArticleGetQueryDTO when available
    client?: Prisma.TransactionClient,
  ): Promise<{ total: number; data: NewsArticleWithIncludes[] }> {
    try {
      const prisma = await this.prisma.getClient(client);

      // Pagination
      const take = query.limit ?? 10;
      const skip = (query.page - 1) * take;

      if (query.q?.trim()) {
        return await this.fullTextSearch(query, skip, take, prisma);
      }

      // Soft-deleted articles are never listed. A story covered by several sources is
      // listed once, as its lead; its other articles are shown as the lead's coverage
      // (unless the lead was deleted, then they are listed on their own again).
      const where: Prisma.NewsArticleWhereInput = {
        deletedAt: null,
        OR: [{ storyId: null }, { story: { deletedAt: { not: null } } }],
      };
      if (query.language) {
        where.language = query.language;
      }
      if (query.category) {
        where.articleCategories = { some: { category: { name: query.category } } };
      }
      if (query.dateFrom || query.dateTo) {
        where.createdAt = {};
        if (query.dateFrom) {
          (where.createdAt as Prisma.DateTimeFilter).gte = query.dateFrom;
        }
        if (query.dateTo) {
          (where.createdAt as Prisma.DateTimeFilter).lte = query.dateTo;
        }
      }

      const [total, data] = await Promise.all([
        prisma.newsArticle.count({ where }),
        prisma.newsArticle.findMany({
          where,
          include: ARTICLE_INCLUDE,
          skip,
          take,
          orderBy: { createdAt: query.order },
        }),
      ]);

      return { total, data };
    } catch (error) {
      this.logger.error(`Error fetching news articles: ${error}`);
      handlePrismaError(error, "Failed to fetch news articles.");
    }
  }

  /**
   * Full-text search using the GIN-indexed "searchVector" tsvector column
   * (title weighted A, content weighted B). Results are ranked by ts_rank,
   * then by createdAt in the requested order.
   */
  private async fullTextSearch(
    query: NewsArticleGetQueryDTO,
    skip: number,
    take: number,
    prisma: Prisma.TransactionClient,
  ): Promise<{ total: number; data: NewsArticleWithIncludes[] }> {
    // 'simple' config: no language-specific stemming, so it works for Nepali and English
    const tsQuery = Prisma.sql`websearch_to_tsquery('simple', ${query.q!.trim()})`;
    const conditions = [
      Prisma.sql`"deletedAt" IS NULL`,
      Prisma.sql`"searchVector" @@ ${tsQuery}`,
    ];
    if (query.dateFrom) {
      conditions.push(Prisma.sql`"createdAt" >= ${new Date(query.dateFrom)}`);
    }
    if (query.dateTo) {
      conditions.push(Prisma.sql`"createdAt" <= ${new Date(query.dateTo)}`);
    }
    if (query.language) {
      conditions.push(Prisma.sql`"language" = ${query.language}::"Language"`);
    }
    if (query.category) {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM "ArticleCategory" ac JOIN "Category" c ON c.id = ac."categoryId"
        WHERE ac."articleId" = "NewsArticle".id AND c.name = ${query.category})`);
    }
    const where = Prisma.join(conditions, " AND ");
    const order = Prisma.raw(query.order === "asc" ? "ASC" : "DESC");

    const [countRows, idRows] = await Promise.all([
      prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int AS count FROM "NewsArticle" WHERE ${where}`,
      prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "NewsArticle" WHERE ${where}
        ORDER BY ts_rank("searchVector", ${tsQuery}) DESC, "createdAt" ${order}
        LIMIT ${take} OFFSET ${skip}`,
    ]);

    const ids = idRows.map((row) => row.id);
    const articles = await prisma.newsArticle.findMany({
      where: { id: { in: ids } },
      include: ARTICLE_INCLUDE,
    });
    // findMany does not keep the ranked order, so restore it
    const rank = new Map(ids.map((id, i) => [id, i]));
    articles.sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);

    return { total: countRows[0]?.count ?? 0, data: articles };
  }

  /**
   * Create a new NewsArticle
   * @param data NewsArticle creation data
   * @returns Created NewsArticle
   */
  async create(
    data: Prisma.NewsArticleUncheckedCreateInput,
    client?: Prisma.TransactionClient,
  ): Promise<NewsArticle> {
    try {
      const prisma = await this.prisma.getClient(client);
      const newsArticle = await prisma.newsArticle.create({
        data,
      });
      return newsArticle;
    } catch (error) {
      this.logger.error(`Error creating news article: ${error}`);
      handlePrismaError(error, "Failed to create news article.");
    }
  }

  async upsert(
    data: Prisma.NewsArticleUpsertArgs,
    client?: Prisma.TransactionClient,
  ): Promise<NewsArticle> {
    try {
      const prisma = await this.prisma.getClient(client);
      const newsArticle = await prisma.newsArticle.upsert(data);
      return newsArticle;
    } catch (error) {
      this.logger.error(`Error upserting news article: ${error}`);
      handlePrismaError(error, "Failed to upsert news article.");
    }
  }

  /**
   * Bulk insert NewsArticles
   * @param data Array of NewsArticle creation data
   * @returns Array of created NewsArticles
   */
  async bulkInsert(
    data: Prisma.NewsArticleUncheckedCreateInput[],
    client?: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const prisma = await this.prisma.getClient(client);
      await prisma.newsArticle.createMany({
        data,
        skipDuplicates: true,
      });
    } catch (error) {
      this.logger.error(`Error bulk inserting news articles: ${error}`);
      handlePrismaError(error, "Failed to bulk insert news articles.");
    }
  }

  /**
   * Update a NewsArticle by ID
   * @param id NewsArticle ID
   * @param data NewsArticle update data
   * @returns Updated NewsArticle
   */
  async update(
    id: string,
    data: Prisma.NewsArticleUpdateInput,
    client?: Prisma.TransactionClient,
  ): Promise<NewsArticle | null> {
    try {
      const prisma = await this.prisma.getClient(client);
      const newsArticle = await prisma.newsArticle.update({
        where: { id },
        data,
      });
      return newsArticle;
    } catch (error) {
      this.logger.error(`Error updating news article: ${error}`);
      handlePrismaError(error, "Failed to update news article.");
    }
  }

  /**
   * Soft delete a NewsArticle by ID
   * @param id NewsArticle ID
   * @returns Soft deleted NewsArticle
   */
  async softDelete(
    id: string,
    userId: string,
    client?: Prisma.TransactionClient,
  ): Promise<NewsArticle | null> {
    try {
      const prisma = await this.prisma.getClient(client);
      const newsArticle = await prisma.newsArticle.update({
        where: { id },
        data: { deletedAt: new Date(), deletedBy: userId },
      });
      return newsArticle;
    } catch (error) {
      this.logger.error(`Error soft deleting news article: ${error}`);
      handlePrismaError(error, "Failed to soft delete news article.");
    }
  }

  /**
   * Articles published since the given date, oldest first, with what story
   * grouping needs: text, source, current lead and whether others joined them.
   */
  async findForStoryGrouping(
    since: Date,
    client?: Prisma.TransactionClient,
  ) {
    try {
      const prisma = await this.prisma.getClient(client);
      return await prisma.newsArticle.findMany({
        where: { deletedAt: null, publishedDate: { gte: since } },
        select: {
          id: true,
          title: true,
          content: true,
          sourceId: true,
          storyId: true,
          _count: { select: { storyArticles: true } },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
    } catch (error) {
      this.logger.error(`Error fetching articles for story grouping: ${error}`);
      handlePrismaError(error, "Failed to fetch articles for story grouping.");
    }
  }

  /**
   * Save story grouping results
   * @param leads article id -> id of the lead article of its story
   */
  async setStoryIds(leads: Map<string, string>): Promise<void> {
    try {
      await this.prisma.$transaction(
        [...leads].map(([id, storyId]) =>
          this.prisma.newsArticle.update({ where: { id }, data: { storyId } }),
        ),
      );
    } catch (error) {
      this.logger.error(`Error saving story grouping: ${error}`);
      handlePrismaError(error, "Failed to save story grouping.");
    }
  }
}
