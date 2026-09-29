import { AppController } from "@/api/app.controller";
import { AppService } from "@/api/app.service";
import { AuthModule } from "@/api/auth/auth.module";
import { CategoriesController } from "@/api/categories/categories.controller";
import { CategoriesModule } from "@/api/categories/categories.module";
import { CategoriesService } from "@/api/categories/categories.service";
import { NewsArticlesController } from "@/api/news-articles/news-articles.controller";
import { NewsArticlesModule } from "@/api/news-articles/news-articles.module";
import { NewsArticlesService } from "@/api/news-articles/news-articles.service";
import { PrismaController } from "@/api/prisma/prisma.controller";
import { PrismaModule } from "@/api/prisma/prisma.module";
import { PrismaService } from "@/api/prisma/prisma.service";
import { UsersModule } from "@/api/users/users.module";
import { HttpExceptionFilter } from "@/filter/http-exception.filter";
import { AuthGuard } from "@/guard/auth.guard";
import { RolesGuard } from "@/guard/roles.guard";
import { Module, ValidationPipe } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_PIPE } from "@nestjs/core";
import { SourceModule } from "./source/source.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    PrismaModule,
    NewsArticlesModule,
    CategoriesModule,
    SourceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
      }),
    },
  ],
})
export class AppModule {}
