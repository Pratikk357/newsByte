import { AuthRepository } from "@/api/auth/auth.repository";
import {
  LoginDTO,
  LoginResponseDTO,
  RefreshDTO,
  RefreshResponseDTO,
} from "@/api/auth/dto";
import { UserRepository } from "@/api/users/users.repository";
import { ResponseDTO } from "@/common/dto";
import { handleError } from "@/utils/error/handler";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Role, User } from "@prisma/client";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @param ipAddress IP address of the user.
   * @param userAgent User agent of the user.
   * @param loginDTO Login DTO.
   * @returns ResponseDTO<LoginResponseDTO>
   * @description Handles user login and returns a JWT token.
   */
  async login(
    ipAddress: string,
    userAgent: string = "undefined",
    loginDTO: LoginDTO,
  ): Promise<ResponseDTO<LoginResponseDTO>> {
    try {
      const user = await this.validateUser(loginDTO.email, loginDTO.password);
      const accessToken = this.generateJwt(user.id, user.role);
      const refreshToken = this.generateRefreshJwt(user.id, user.role);

      this.authRepository.login({
        userId: user.id,
        ipAddress,
        userAgent,
      });

      const loginResponseDTO: LoginResponseDTO = LoginResponseDTO.fromEntity({
        ...user,
        accessToken,
        refreshToken,
      });

      return ResponseDTO.success("Logged in successfully.", loginResponseDTO);
    } catch (error) {
      handleError(error, "Error during login.", this.logger);
    }
  }
  /**
   * @param userId User ID.
   * @param userAgent User agent of the user.
   * @returns ResponseDTO<void>
   * @description Handles user logout.
   */
  async logout(
    userId: string,
    userAgent: string = "undefined",
  ): Promise<ResponseDTO<void>> {
    try {
      await this.authRepository.logout({ userId, userAgent });
      return ResponseDTO.success("Logged out successfully.");
    } catch (error) {
      handleError(error, "Error during logout.", this.logger);
    }
  }

  async refreshLoginToken(
    refreshDTO: RefreshDTO,
  ): Promise<ResponseDTO<RefreshResponseDTO>> {
    try {
      const { refreshToken } = refreshDTO;
      const decoded = await this.jwtService
        .verifyAsync(refreshToken)
        .catch(() => null);
      if (!decoded || decoded.type !== "refresh")
        throw new UnauthorizedException("Invalid refresh token");

      const userId = decoded["userId"];
      const user = await this.userRepository.findById(userId);
      if (!user) throw new UnauthorizedException("Invalid refresh token");

      const newAccessToken = this.generateJwt(user.id, user.role);
      const newRefreshToken = this.generateRefreshJwt(user.id, user.role);

      const refreshTokenDTO = RefreshResponseDTO.fromEntity({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });

      return ResponseDTO.success("Access Token Generated", refreshTokenDTO);
    } catch (error: unknown) {
      handleError(error, "Error during refresh token generation.", this.logger);
      throw new UnauthorizedException("Failed to refresh login token");
    }
  }

  /**
   * Validates user credentials and returns the user if valid.
   * @param email User email.
   * @param password User password.
   * @returns User
   */
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException("Invalid credentials");

    return user;
  }

  async verifySuperadminToken(token: string): Promise<ResponseDTO<{ valid: boolean }>> {
    try {
      const decoded = await this.jwtService.verifyAsync(token);
      if (!decoded || decoded.role !== Role.SUPERADMIN) {
        throw new UnauthorizedException("Invalid JWT token");
      }
      return ResponseDTO.success("Token is valid", { valid: true });
    } catch (error) {
      handleError(error, "Invalid JWT token.", this.logger);
    }
  }

  /**
   * Compares a plain-text password with a hashed password.
   * @param plainText Plain-text password.
   * @param hashed Hashed password.
   * @returns Promise<boolean>
   */
  private async comparePassword(
    plainText: string,
    hashed: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainText, hashed);
  }

  /**
   * Generates a JWT token for the user.
   * @param userId ID of user
   * @returns string
   */
  private generateJwt(userId: string, role: Role): string {
    return this.jwtService.sign({ userId, role });
  }

  /**
   * Generates a JWT token for the user.
   * @param userId ID of user
   * @returns string
   */
  private generateRefreshJwt(userId: string, role: Role): string {
    return this.jwtService.sign(
      { userId, role, type: "refresh" },
      {
        expiresIn: "7d",
      },
    );
  }
}
