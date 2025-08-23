import { ResponseDTO } from "@/common/dto";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

// Create Schema
export class CategoryCreateDTO {
  @ApiProperty({ example: "Sports", description: "Category Name" })
  @IsNotEmpty({ message: "Category name is required" })
  name: string;
}

export class CategoryResponseDTO {
  @ApiProperty({ example: "uuid", description: "ID of category." })
  id: string;

  @ApiProperty({ example: "Sports", description: "Category Name" })
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static fromEntity({
    id,
    name,
  }: {
    id: string;
    name: string;
  }): CategoryResponseDTO {
    return new CategoryResponseDTO(id, name);
  }
}

export class CategoryResponseWrapperDTO extends ResponseDTO<CategoryResponseDTO> {
  @ApiProperty({ type: CategoryResponseDTO })
  declare responseObject: CategoryResponseDTO;
}
