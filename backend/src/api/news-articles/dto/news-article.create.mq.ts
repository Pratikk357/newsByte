import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsArray,
  IsUrl,
  ArrayNotEmpty,
  IsISO8601,
} from "class-validator";

export class NewsArticleBodyMQDTO {
  @ApiProperty({ description: "Title of the news article" })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: "Content of the news article" })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: "Sumerized content of the news article" })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Summarized content of the news article" })
  @IsString()
  @IsNotEmpty()
  summarized: string;


  @ApiPropertyOptional({
    description: "Publication date in ISO8601 format",
    type: String,
    example: "2024-06-01T12:00:00Z",
  })
  @IsOptional()
  @IsISO8601()
  publishedAt?: string;

  @ApiProperty({
    description: "URL of the article",
    type: String,
    example: "https://example.com/news-article",
  })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: "Tags for the article", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: "URL of the article image" })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class NewsArticleCreateMQDTO {
  @ApiProperty({ description: "Secure Key", type: String, example: "HSodiujk1oiuj90sdoij2ojeoj90sajdoqi9012eqwoid" })
  @IsString()
  authKey: string;

  @ApiProperty({ description: "Source", type: String, example: "Hamro Patro" })
  @IsString()
  source: string;

  @ApiProperty({
    description: "Object of news articles",
    type: [NewsArticleBodyMQDTO],
  })
  data: NewsArticleBodyMQDTO[];
}
