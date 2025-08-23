import { AuthService } from "@/api/auth/auth.service";
import { Public } from "@/common/decorators";
import { ResponseDTO } from "@/common/dto";
import { _FastifyRequest } from "@/common/types/request.type";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  LoginDTO,
  LoginResponseDTO,
  LoginResponseWrapperDTO,
} from "./dto/login.dto";
import { RefreshDTO, RefreshResponseWrapperDTO } from "./dto/refresh.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * This Method calls login service which handles the login logic.
   * @param loginDTO Login Data like email, password are validated and passed.
   * @returns Standard Service Response containing responseObject if successful and error message if failed.
   */
  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login" })
  @ApiResponse({
    status: 200,
    description: "Login Authentication",
    type: LoginResponseWrapperDTO,
  })
  async login(
    @Req() req: _FastifyRequest,
    @Body() loginDTO: LoginDTO,
  ): Promise<ResponseDTO<LoginResponseDTO>> {
    const ipAddress: string = req.ip;
    const userAgent: string | undefined = req.headers["user-agent"];
    return await this.authService.login(ipAddress, userAgent, loginDTO);
  }

  /**
   * This Method calls logout service which handles the logout logic.
   * @returns Standard Service Response containing responseObject if successful and error message if failed.
   */
  @Post("logout")
  @ApiOperation({ summary: "Logout" })
  @ApiResponse({
    status: 200,
    description: "Logout Authentication",
    type: LoginResponseWrapperDTO,
  })
  async logout(@Req() req: _FastifyRequest): Promise<ResponseDTO<void>> {
    const userId: string = req.user.userId;
    const userAgent: string | undefined = req.headers["user-agent"];
    return await this.authService.logout(userId, userAgent);
  }

  /**
   * This Method calls refresh token service which generates a new refresh token.
   * @returns A new access token and refresh token.
   */
  @Post("refresh")
  @ApiOperation({ summary: "Refresh Token" })
  @ApiResponse({
    status: 200,
    description: "Refresh Token",
    type: RefreshResponseWrapperDTO,
  })
  async refresh(
    @Req() req: _FastifyRequest,
    @Body() refreshTokenDTO: RefreshDTO,
  ): Promise<ResponseDTO<RefreshDTO>> {
    return await this.authService.refreshLoginToken(refreshTokenDTO);
  }

  /**
   * This Method verifies the validity of a JWT token.
   * @returns Standard Service Response indicating token validity.
   */
  @Public()
  @Post("verify/superadmin")
  @ApiOperation({ summary: "Verify JWT Token" })
  @ApiResponse({
    status: 200,
    description: "JWT Token Verification",
    type: ResponseDTO,
  })
  async verify(
    @Body("token") token: string,
  ): Promise<ResponseDTO<{ valid: boolean }>> {
    const response = await this.authService.verifySuperadminToken(token);
    return response;
  }
}
