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

export class NewsArticleDetailResponseDTO {
    @ApiProperty({ example: "b3c1e2d4-1234-4f56-8a9b-1234567890ab" })
    @IsUUID()
    id: string;

    @ApiProperty({ example: "Breaking News: Major Event Happens" })
    @IsString()
    title: string;

    @ApiProperty({ example: "A major event has just occurred in the city..." })
    @IsString()
    content: string;

    @ApiProperty({ type: [String], example: ["politics", "breaking-news"] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiProperty({ example: "A major event in city happen..." })
    @IsString()
    summary: string;

    @ApiProperty({ example: "https://example.com/images/news-article.jpg" })
    @IsString()
    @IsOptional()
    imageUrl?: string | null;

    @ApiProperty({ example: "Reuters" })
    @IsString()
    @IsOptional()
    source?: string;

    @ApiProperty({ example: "https://reuters.com/news/major-event" })
    @IsString()
    @IsOptional()
    sourceUrl?: string;
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

    static fromEntity(entity: NewsArticleWithIncludes): NewsArticleDetailResponseDTO {
        const dto = new NewsArticleDetailResponseDTO();
        dto.id = entity.id;
        dto.title = entity.title;
        dto.content = entity.content;
        dto.summary = entity.summaries[0]?.summaryText;
        dto.tags = entity.articleCategories.map(ac => ac.category.name);
        dto.imageUrl = entity.imageUrl;
        dto.source = entity.source?.name;
        dto.sourceUrl = entity.url
        // dto.author = AuthorResponseDTO.fromEntity(entity.author);
        dto.publishedAt = entity.publishedDate;
        dto.updatedAt = entity.updatedAt;
        return dto;
    }
}

export class NewsArticleResponseWrapperDTO {
    @ApiProperty({ type: () => NewsArticleDetailResponseDTO })
    data: NewsArticleDetailResponseDTO;
}
