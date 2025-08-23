import { CategoryResponseDTO } from "@/api/categories/dto";
import { ResponseDTO } from "@/common/dto";
import { ApiProperty } from "@nestjs/swagger";
import { Category } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

// Category Get Schema
export class CategoryGetQueryDTO {
  @ApiProperty({
    example: "Sports",
    description: "Category Name",
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 1, description: "Page number", required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? Number(value) : 1), { toClassOnly: true }) // Ensure it's a number
  @Type(() => Number)
  page: number = 1;

  @ApiProperty({
    example: 10,
    description: "Number of items per page",
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => (value ? Number(value) : 10), { toClassOnly: true }) // Ensure it's a number
  @Type(() => Number)
  limit: number = 10;

  @ApiProperty({
    example: "name",
    description: "Field to sort by",
    required: false,
    enum: ["name", "created_at"],
  })
  @IsString()
  @IsOptional()
  sortBy?: "name" | "created_at" = "name";

  @ApiProperty({
    example: "asc",
    description: "Sort order",
    required: false,
    enum: ["asc", "desc"],
  })
  @IsString()
  @IsOptional()
  sortOrder?: "asc" | "desc" = "asc";
}

export class PaginatedCategoryListDTO {
  @ApiProperty({ description: "Current page of the results.", example: 1 })
  page: number;

  @ApiProperty({ description: "Number of items per page.", example: 10 })
  limit: number;

  @ApiProperty({ description: "Total number of items.", example: 100 })
  total: number;

  @ApiProperty({
    description: "List of categories.",
    type: [CategoryResponseDTO],
  })
  data: CategoryResponseDTO[];

  constructor(
    page: number,
    limit: number,
    total: number,
    data: CategoryResponseDTO[],
  ) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.data = data;
  }

  static fromEntity(
    page: number,
    limit: number,
    total: number,
    category: Category[],
  ): PaginatedCategoryListDTO {
    return new PaginatedCategoryListDTO(
      page,
      limit,
      total,
      category.map((category) => CategoryResponseDTO.fromEntity(category)),
    );
  }
}

export class PaginatedCategoryListResponseWrapperDTO extends ResponseDTO<PaginatedCategoryListDTO> {
  @ApiProperty({ type: PaginatedCategoryListDTO })
  declare responseObject: PaginatedCategoryListDTO;
}
