import { CategoryGetQueryDTO } from "@/api/categories/dto";
import { PrismaService } from "@/api/prisma/prisma.service";
import { handlePrismaError } from "@/utils/error/handler";
import { Injectable, Logger } from "@nestjs/common";
import { Category, NewsArticle } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { NewsArticleGetQueryDTO } from "./dto/news-article-get.query.dto";
import { NewsArticleWithIncludes } from "./types/news-article-complex.type";

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
      const newsArticle = await prisma.newsArticle.findUnique({
        where: { id },
        include: {
          articleCategories: {
            include: {
              category: true,
            },
          },
          summaries: true,
          source: true,
        },
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

      // Build Prisma where/filter object based on query
      const where: Prisma.NewsArticleWhereInput = {};
      if (query.q) {
        where.OR = [
          { title: { contains: query.q, mode: "insensitive" } },
          { content: { contains: query.q, mode: "insensitive" } },
        ];
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

      // Pagination
      const skip = (query.page - 1) * query.limit;
      const take = query.limit ?? 10;

      const [total, data] = [
        await prisma.newsArticle.count({ where }),
        await prisma.newsArticle.findMany({
          where,
          include: {
            articleCategories: {
              include: {
                category: true,
              },
            },
            summaries: true,
            source: true,
          },
          skip,
          take,
          orderBy: { createdAt: query.order },
        }),
      ];

      return { total, data };
    } catch (error) {
      this.logger.error(`Error fetching news articles: ${error}`);
      handlePrismaError(error, "Failed to fetch news articles.");
    }
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
}
