import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsDate,
  IsArray,
  ValidateNested,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";
import { NewsArticle } from "@prisma/client";
import { NewsArticleWithIncludes } from "../types/news-article-complex.type";
// import { AuthorResponseDTO } from '../../authors/dto/author-response.dto';
// import { CategoryResponseDTO } from '../../categories/dto/category-response.dto';

export class NewsArticleResponseDTO {
  @ApiProperty({ example: "b3c1e2d4-1234-4f56-8a9b-1234567890ab" })
  @IsUUID()
  id: string;

  @ApiProperty({ example: "Breaking News: Major Event Happens" })
  @IsString()
  title: string;

  @ApiProperty({ example: "A major event has just occurred in the city..." })
  @IsString()
  content: string;

  @ApiProperty({ example: "https://example.com/image.jpg", required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string | null;

  // @ApiProperty({ type: () => AuthorResponseDTO })
  // @ValidateNested()
  // @Type(() => AuthorResponseDTO)
  // author: AuthorResponseDTO;

  // @ApiProperty({ type: () => [CategoryResponseDTO] })
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CategoryResponseDTO)
  // categories: CategoryResponseDTO[];

  @ApiProperty({ example: "2024-06-01T12:00:00.000Z" })
  @IsDate()
  @Type(() => Date)
  publishedAt: Date;

  @ApiProperty({ example: "2024-06-01T12:00:00.000Z" })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  updatedAt?: Date;

  static fromEntity(entity: NewsArticle): NewsArticleResponseDTO {
    const dto = new NewsArticleResponseDTO();
    dto.id = entity.id;
    dto.title = entity.title;
    dto.content = entity.content;
    dto.imageUrl = entity.imageUrl;
    // dto.author = AuthorResponseDTO.fromEntity(entity.author);
    // dto.categories = entity.categories?.map(CategoryResponseDTO.fromEntity) || [];
    dto.publishedAt = entity.publishedDate;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

export class NewsArticleResponseWrapperDTO {
  @ApiProperty({ type: () => NewsArticleResponseDTO })
  data: NewsArticleResponseDTO;
}
