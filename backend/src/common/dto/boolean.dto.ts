import { ApiProperty } from "@nestjs/swagger";
import { ResponseDTO } from "./response.dto";

export class BooleanResponseDTO {
  @ApiProperty({
    example: true,
    description: "Tells if the request was sucessful or not.",
  })
  success: boolean;

  @ApiProperty({
    example: "Request Executed Successfully.",
    description: "Message for response.",
  })
  message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }

  static fromEntity({ success, message }: BooleanResponseDTO) {
    return new BooleanResponseDTO(success, message);
  }
}

export class BooleanResponseWrapperDTO extends ResponseDTO<BooleanResponseDTO> {
  @ApiProperty({ type: BooleanResponseDTO })
  declare responseObject: BooleanResponseDTO;
}
