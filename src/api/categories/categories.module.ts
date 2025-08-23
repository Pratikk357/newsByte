import { Module } from "@nestjs/common";
import { PrismaService } from "@/api/prisma/prisma.service";
import { CategoriesRepository } from "@/api/categories/categories.repository";
import { CategoriesService } from "@/api/categories/categories.service";
import { CategoriesController } from "./categories.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [CategoriesService, CategoriesRepository],
  controllers: [CategoriesController],
  exports: [CategoriesRepository, CategoriesService],
})
export class CategoriesModule {}
