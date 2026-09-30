import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsEnum,
  IsIn,
} from "class-validator";
import { Type } from "class-transformer";
import { Language, Prisma } from "@prisma/client";
import { MAIN_CATEGORIES, MainCategory } from "@/api/categories/main-categories";

export class NewsArticleGetQueryDTO {
  @IsOptional()
  @IsString()
  q?: string; // Common search query

  // tag: string | null = null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  @IsOptional()
  @IsDateString() 
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  order: Prisma.SortOrder = "desc";

  @IsOptional()
  @IsEnum(Language)
  language?: Language; // "en" or "ne"

  @IsOptional()
  @IsIn(MAIN_CATEGORIES)
  category?: MainCategory; // e.g. "sports"
}
