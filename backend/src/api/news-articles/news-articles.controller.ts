import { Public, Roles } from "@/common/decorators";
import { _FastifyRequest } from "@/common/types";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Role } from "@prisma/client";
import { NewsArticleDeleteDTO } from "./dto/news-article-delete.dto";
import { NewsArticleGetQueryDTO } from "./dto/news-article-get.query.dto";
import { NewsArticleCreateDTO } from "./dto/news-article.create.dto";
import { NewsArticlesService } from "./news-articles.service";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { RabbitMqRequestDTO } from "@/common/dto/rabbit-mq.request";
import { NewsArticleCreateMQDTO } from "./dto/news-article.create.mq";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";

@Controller("news-articles")
export class NewsArticlesController {
  constructor(private readonly newsArticlesService: NewsArticlesService) {}

  @Roles(...[Role.SUPERADMIN, Role.ADMIN])
  @ApiBearerAuth()
  @Post()
  async createNewsArticle(@Body() newsArticleDTO: NewsArticleCreateDTO) {
    return this.newsArticlesService.createNewsArticle(newsArticleDTO);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Get all news articles" })
  @ApiQuery({ type: NewsArticleGetQueryDTO })
  @ApiResponse({ status: 200, description: "List of news articles" })
  async getAllNewsArticles(@Query() getNewsArticleDTO: NewsArticleGetQueryDTO) {
    return this.newsArticlesService.getAllNewsArticles(getNewsArticleDTO);
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get news article by ID" })
  @ApiResponse({ status: 200, description: "News article details" })
  async getNewsArticleById(@Param("id") id: string) {
    return this.newsArticlesService.getNewsArticleById(id);
  }

  @Roles(...[Role.SUPERADMIN, Role.ADMIN])
  @Delete()
  async deleteNewsArticle(
    @Req() req: _FastifyRequest,
    @Body() deleteNewsArticleDTO: NewsArticleDeleteDTO,
  ) {
    // Assuming userId is available in req.user.userId
    const userId = req.user?.userId || "";
    return this.newsArticlesService.deleteNewsArticle(
      userId,
      deleteNewsArticleDTO,
    );
  }

  @Public()
  @EventPattern("summarised.articles")
  async handleScrapedData(
    @Payload() data: NewsArticleCreateMQDTO,
    @Ctx() context: RmqContext,
  ) {
    console.log("Received data:", data);
    this.newsArticlesService.createNewsArticlesFromMQ(data);
  }
}
