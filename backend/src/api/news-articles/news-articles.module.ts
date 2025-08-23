import { Module } from "@nestjs/common";
import { NewsArticlesController } from "./news-articles.controller";
import { NewsArticlesService } from "./news-articles.service";
import { NewsArticlesRepository } from "./news-articles.repository";
import { PrismaModule } from "../prisma/prisma.module";
import { SourceSharedModule } from "../source/shared/source-shared.module";

@Module({
  imports: [PrismaModule, SourceSharedModule],
  providers: [NewsArticlesService, NewsArticlesRepository],
  controllers: [NewsArticlesController],
  exports: [NewsArticlesService, NewsArticlesRepository],
})
export class NewsArticlesModule {}
