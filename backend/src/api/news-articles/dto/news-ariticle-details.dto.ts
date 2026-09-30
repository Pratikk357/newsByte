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
import { Language, NewsArticle } from "@prisma/client";
import { NewsArticleWithIncludes } from "../types/news-article-complex.type";
// import { AuthorResponseDTO } from '../../authors/dto/author-response.dto';
// import { CategoryResponseDTO } from '../../categories/dto/category-response.dto';

export class StoryCoverageDTO {
    @ApiProperty({ example: "b3c1e2d4-1234-4f56-8a9b-1234567890ab" })
    id: string;

    @ApiProperty({ example: "BP Highway reopens after four-day closure" })
    title: string;

    @ApiProperty({ example: "thehimalayantimes" })
    source: string;

    @ApiProperty({ example: "https://thehimalayantimes.com/nepal/bp-highway-reopens" })
    url: string;
}

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

    @ApiProperty({ enum: Language, example: "en" })
    language: Language;

    @ApiProperty({
        type: () => [StoryCoverageDTO],
        description: "The same story as reported by other sources",
    })
    coverage: StoryCoverageDTO[];

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
        dto.language = entity.language;
        dto.coverage = NewsArticleDetailResponseDTO.coverageOf(entity);
        // dto.author = AuthorResponseDTO.fromEntity(entity.author);
        dto.publishedAt = entity.publishedDate;
        dto.updatedAt = entity.updatedAt;
        return dto;
    }

    /** The other articles of this article's story: its lead and the lead's other articles. */
    private static coverageOf(entity: NewsArticleWithIncludes): StoryCoverageDTO[] {
        const lead = entity.story && !entity.story.deletedAt ? entity.story : null;
        const articles = lead
            ? [lead, ...lead.storyArticles.filter((a) => a.id !== entity.id)]
            : entity.storyArticles;
        return articles.map((a) => ({
            id: a.id,
            title: a.title,
            source: a.source.name,
            url: a.url,
        }));
    }
}

export class NewsArticleResponseWrapperDTO {
    @ApiProperty({ type: () => NewsArticleDetailResponseDTO })
    data: NewsArticleDetailResponseDTO;
}
