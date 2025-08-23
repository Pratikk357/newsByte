import { CategoriesRepository } from "@/api/categories/categories.repository";
import {
  CategoryCreateDTO,
  CategoryDeleteDTO,
  CategoryGetQueryDTO,
  CategoryResponseDTO,
  PaginatedCategoryListDTO,
} from "@/api/categories/dto";
import {
  BooleanResponseDTO,
  PaginatedResponseDTO,
  ResponseDTO,
} from "@/common/dto";
import { handleError } from "@/utils/error/handler";
import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { NewsArticlesRepository } from "./news-articles.repository";
import { NewsArticleCreateDTO } from "./dto/news-article.create.dto";
import { NewsArticleResponseDTO } from "./dto/news-article-response.dto";
import { NewsArticleGetQueryDTO } from "./dto/news-article-get.query.dto";
import { NewsArticleDeleteDTO } from "./dto/news-article-delete.dto";
import { NewsArticleCreateMQDTO } from "./dto/news-article.create.mq";
import { SourceRepository } from "../source/source.repository";
import { NewsArticleDetailResponseDTO } from "./dto/news-ariticle-details.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class NewsArticlesService {
  private readonly logger = new Logger(NewsArticlesService.name);
  constructor(
    private readonly newsRepo: NewsArticlesRepository,
    private readonly sourceRepo: SourceRepository,
    private readonly prisma: PrismaService,
  ) { }

  /**
   * Create a new news article
   * @param newsArticleDTO News Article DTO
   * @returns Created news article
   */
  async createNewsArticle(
    newsArticleDTO: NewsArticleCreateDTO,
  ): Promise<ResponseDTO<NewsArticleResponseDTO>> {
    try {
      const newsArticle = await this.newsRepo.create({
        title: newsArticleDTO.title,
        content: newsArticleDTO.content,
        addedBy: newsArticleDTO.authorId || "",
        publishedDate: new Date(newsArticleDTO.publishedAt ?? ""),
        sourceId: newsArticleDTO.sourceId,
        url: newsArticleDTO.url,
      });
      if (!newsArticle)
        throw new ConflictException("Error during news article creation.");

      const newsArticleResponseDTO =
        NewsArticleResponseDTO.fromEntity(newsArticle);
      return ResponseDTO.success(
        "News article created successfully.",
        newsArticleResponseDTO,
      );
    } catch (error) {
      handleError(error, "Error creating news article.", this.logger);
    }
  }

  /**
   * Get all news articles with pagination and filtering
   * @param getNewsArticleDTO Get News Article DTO
   * @returns List of news articles
   */
  async getAllNewsArticles(
    getNewsArticleDTO: NewsArticleGetQueryDTO,
  ): Promise<ResponseDTO<PaginatedResponseDTO<NewsArticleResponseDTO>>> {
    try {
      const newsArticleListObj =
        await this.newsRepo.findMany(getNewsArticleDTO);
      if (!newsArticleListObj)
        throw new ConflictException("Error fetching news articles.");
      const paginatedNewsArticleListDTO = new PaginatedResponseDTO(
        getNewsArticleDTO.page,
        getNewsArticleDTO.limit,
        newsArticleListObj.total,
        newsArticleListObj.data.map((article) =>
          NewsArticleDetailResponseDTO.fromEntity(article),
        ),
      );
      if (newsArticleListObj.total === 0) {
        return ResponseDTO.success(
          "No news articles found.",
          paginatedNewsArticleListDTO,
        );
      }

      return ResponseDTO.success(
        "News articles fetched successfully.",
        paginatedNewsArticleListDTO,
      );
    } catch (error) {
      handleError(error, "Error fetching news articles.", this.logger);
    }
  }

  /**
 * Get all news articles with pagination and filtering
 * @param getNewsArticleDTO Get News Article DTO
 * @returns List of news articles
 */
  async getNewsArticleById(
    id: string,
  ): Promise<ResponseDTO<NewsArticleDetailResponseDTO>> {
    try {
      const newsArticleListObj =
        await this.newsRepo.findByIdWithIncludes(id);
      if (!newsArticleListObj)
        throw new ConflictException("Error fetching news articles.");

      const articleDTO = NewsArticleDetailResponseDTO.fromEntity(newsArticleListObj);
      if (!articleDTO)
        throw new ConflictException("News article not found.");
      return ResponseDTO.success(
        "News articles fetched successfully.",
        articleDTO,
      );
    } catch (error) {
      handleError(error, "Error fetching news articles.", this.logger);
    }
  }

  /**
   * Delete a news article
   * @param deleteNewsArticleDTO Delete News Article DTO
   * @returns Deleted news article
   */
  async deleteNewsArticle(
    userId: string,
    deleteNewsArticleDTO: NewsArticleDeleteDTO,
  ): Promise<ResponseDTO<BooleanResponseDTO>> {
    try {
      const newsArticleExists = await this.newsRepo.findById(
        deleteNewsArticleDTO.id,
      );
      if (!newsArticleExists)
        throw new ConflictException("News article not found.");

      const newsArticle = await this.newsRepo.softDelete(
        deleteNewsArticleDTO.id,
        userId,
      );
      if (!newsArticle)
        throw new ConflictException("Error during news article deletion.");

      return ResponseDTO.success(
        "News article deleted successfully.",
        new BooleanResponseDTO(true, "News article deleted successfully."),
      );
    } catch (error) {
      handleError(error, "Error deleting news article.", this.logger);
    }
  }

  /**
   * Create news articles from MQ DTO, handling source creation if needed
   * @param newsArticleCreateMQDTO NewsArticleCreateMQDTO
   * @returns Success response with count of inserted articles
   */
  async createNewsArticlesFromMQ(
    newsArticleCreateMQDTO: NewsArticleCreateMQDTO,
  ): Promise<void> {
    try {
      if (!newsArticleCreateMQDTO.authKey) {
        return
      }
      if (newsArticleCreateMQDTO.authKey !== process.env.MQ_SECRET_KEY) {
        this.logger.warn("Missing authKey in NewsArticleCreateMQDTO. Aborting import.");
        return;
      }
      if (newsArticleCreateMQDTO.authKey !== process.env.MQ_SECRET_KEY) {
        this.logger.warn("Invalid authKey provided in NewsArticleCreateMQDTO. Aborting import.");
        return;
      }
      // Find or create source
      this.logger.log(`Looking for source: ${newsArticleCreateMQDTO.source}`);
      let source = await this.sourceRepo.findUnique({
        name: newsArticleCreateMQDTO.source,
      });
      if (!source) {
        this.logger.log(
          `Source not found. Creating source: ${newsArticleCreateMQDTO.source}`,
        );
        source = await this.sourceRepo.create({
          name: newsArticleCreateMQDTO.source,
          website: `${newsArticleCreateMQDTO.source}.com`,
        });
        if (!source) throw new ConflictException("Error creating source.");
        this.logger.log(`Source created with id: ${source.id}`);
      } else {
        this.logger.log(`Source found with id: ${source.id}`);
      }
      const sourceId = source.id;

      // Prepare articles
      this.logger.log(
        `Preparing articles for bulk insert. Count: ${newsArticleCreateMQDTO.data.length}`,
      );
      const articles = newsArticleCreateMQDTO.data.map((article, idx) => {
        this.logger.log(`Preparing article #${idx + 1}: ${article.title}`);
        return {
          title: article.title,
          content: article.content,
          publishedDate: article.publishedAt
            ? new Date(article.publishedAt)
            : new Date(),
          url: article.url,
          tags: (article.tags ?? []).map(tag =>
            tag.replace(/^\/|\/$/g, "").trim()
          ),
          imageUrl: article.imageUrl,
          sourceId,
        };
      });
      console.log(articles[0].tags)

      const allTags = [
        ...new Set(
          newsArticleCreateMQDTO.data.flatMap(article => article.tags ?? [])
        )
      ];

      await Promise.all(
        allTags.map(tag =>
          this.prisma.category.upsert({
            where: { name: tag },
            update: {},
            create: { name: tag }
          })
        )
      );

      // Insert articles
      this.logger.log(`Inserting articles into DB. Count: ${articles.length}`);
      const insertPromises = newsArticleCreateMQDTO.data.map(article => this.newsRepo.upsert({
        where: { url: article.url },
        update: {
          title: article.title,
          content: article.content,
          publishedDate: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          url: article.url,
          imageUrl: article.imageUrl,
          sourceId,
          summaries: {
            create: {
              summaryText: article.summerized,
            }
          },
          articleCategories: {
            create: (article.tags ?? []).map(tag => ({
              category: { connect: { name: tag } }
            })),
          },
        },
        create: {
          title: article.title,
          content: article.content,
          publishedDate: article.publishedAt ? new Date(article.publishedAt) : new Date(),
          url: article.url,
          sourceId,
          imageUrl: article.imageUrl,
          summaries: {
            create: {
              summaryText: article.summerized,
            }
          },
          articleCategories: {
            create: (article.tags ?? []).map(tag => ({
              category: { connect: { name: tag } }
            })),
          },
        }
      }));
      const insertedArticles = await Promise.all(insertPromises);
      const insertedCount = insertedArticles.length;
      this.logger.log(`Inserted articles count: ${insertedCount}`);
    } catch (error) {
      this.logger.error({ error });
      // handleError(error, "Error importing news articles from MQ.", this.logger);
    }
  }
}
