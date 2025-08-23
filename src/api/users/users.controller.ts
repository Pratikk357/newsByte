import {
  RegisterDTO,
  RegisterResponseDTO,
  RegisterResponseWrapperDTO,
} from "@/api/users/dto";
import { UsersService } from "@/api/users/users.service";
import { Public } from "@/common/decorators";
import { ResponseDTO } from "@/common/dto";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * Register User to the system
   * @param registerDTO User Details like name, email, phone number, email and so on
   * @returns Http Response with user details
   */
  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register" })
  @ApiResponse({
    status: 200,
    description: "Register Authentication",
    type: RegisterResponseWrapperDTO,
  })
  async register(
    @Body() registerDTO: RegisterDTO,
  ): Promise<ResponseDTO<RegisterResponseDTO | null>> {
    return await this.userService.register(registerDTO);
  }
}
