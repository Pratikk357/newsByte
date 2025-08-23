import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDefined, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class RabbitMqRequestDTO<T> {
  @ApiProperty({ description: "Pattern for the message", type: String })
  // @IsString()
  pattern: string;

  @ApiProperty({ description: "Dynamic data payload" })
  @IsDefined()
  data: T;
}
