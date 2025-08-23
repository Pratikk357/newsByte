import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

// Delete Schema
export class CategoryDeleteDTO {
  @ApiProperty({ example: "uuid", description: "Category ID" })
  @IsNotEmpty({ message: "Category ID is required" })
  @IsString()
  id: string;
}
