import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { Prisma } from "@prisma/client";

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

  // Add more filters as needed
  // @IsOptional()
  // @IsString()
  // category?: string;
}
