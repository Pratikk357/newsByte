import { AuthRepository } from "@/api/auth/auth.repository";
import { AuthService } from "@/api/auth/auth.service";
import { LoginDTO, RefreshDTO } from "@/api/auth/dto";
import { UserRepository } from "@/api/users/users.repository";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

describe("AuthService", () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let authRepository: jest.Mocked<AuthRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    refreshLoginToken: jest.fn(),
    validateUser: jest.fn(),
    comparePassword: jest.fn(),
    generateJwt: jest.fn(),
    generateRefreshJwt: jest.fn(),
  };

  const mockUser = {
    id: "123",
    email: "user@example.com",
    password: "password123",
    role: Role.USER,
    username: "user123",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "1234567890",
    isActive: true,
    emailVerified: true,
    lastLoginAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    authRepository = module.get(AuthRepository);
    jwtService = module.get(JwtService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should validate user credentials and return user", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare" as any).mockResolvedValue(true);

      const result = await service.validateUser("test@example.com", "password");
      expect(result).toEqual(mockUser);
    });

    it("should throw UnauthorizedException if user not found", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      await expect(
        service.validateUser("wrong@example.com", "pass"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password invalid", async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, "compare").mockImplementation(async () => false);

      await expect(
        service.validateUser("test@example.com", "wrongpass"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  it("should return JWT tokens and user data", async () => {
    const loginDTO: LoginDTO = {
      email: "test@example.com",
      password: "password",
    };

    userRepository.findByEmail.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, "compare" as any).mockResolvedValue(true);

    // Mock the JWT sign function for access and refresh tokens
    jest.spyOn(jwtService, "sign").mockImplementation((payload, options) => {
      if (options?.expiresIn === "7d") {
        return "refresh-token"; // mock refresh token
      }
      return "access-token"; // mock access token
    });

    const result = await service.login("127.0.0.1", "jest-agent", loginDTO);
    expect(result.responseObject?.accessToken).toBe("access-token");
    expect(result.responseObject?.refreshToken).toBe("refresh-token");
    expect(result.message).toBe("Logged in successfully.");
  });

  describe("logout", () => {
    it("should call logout on repository and return success response", async () => {
      const result = await service.logout("user-id", "jest-agent");
      expect(authRepository.logout).toHaveBeenCalledWith({
        userId: "user-id",
        userAgent: "jest-agent",
      });
      expect(result.message).toBe("Logged out successfully.");
    });
  });

  describe("refreshLoginToken", () => {
    it("should generate new access and refresh tokens", async () => {
      const refreshDTO: RefreshDTO = {
        refreshToken: "valid-token",
      };

      jwtService.verifyAsync.mockResolvedValue({
        userId: "user-id",
        role: Role.USER,
        type: "refresh",
      });
      userRepository.findById.mockResolvedValue(mockUser);
      jwtService.sign
        .mockReturnValueOnce("new-access-token")
        .mockReturnValueOnce("new-refresh-token");

      const result = await service.refreshLoginToken(refreshDTO);
      expect(result.responseObject?.accessToken).toBe("new-access-token");
      expect(result.responseObject?.refreshToken).toBe("new-refresh-token");
    });

    it("should throw if refresh token is invalid", async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error("invalid signature"));

      await expect(
        service.refreshLoginToken({ refreshToken: "bad-token" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw if an access token is used as a refresh token", async () => {
      jwtService.verifyAsync.mockResolvedValue({
        userId: "user-id",
        role: Role.USER,
      });

      await expect(
        service.refreshLoginToken({ refreshToken: "access-token" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
