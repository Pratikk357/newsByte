import { AuthController } from "@/api/auth/auth.controller";
import { AuthService } from "@/api/auth/auth.service";
import { LoginDTO, RefreshDTO } from "@/api/auth/dto";
import { ResponseDTO } from "@/common/dto";
import { Test, TestingModule } from "@nestjs/testing";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    refreshLoginToken: jest.fn(),
  };

  const mockRequest = {
    ip: "127.0.0.1",
    headers: { "user-agent": "jest-agent" },
    user: { userId: "test-user-id" },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should call authService.login and return response", async () => {
      const loginDTO: LoginDTO = {
        email: "test@example.com",
        password: "test123",
      };

      const mockResponse = ResponseDTO.success("Login successful", {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: "user-id", email: "test@example.com" },
      });

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await controller.login(mockRequest, loginDTO);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockRequest.ip,
        "jest-agent",
        loginDTO,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("logout", () => {
    it("should call authService.logout and return response", async () => {
      const mockResponse = ResponseDTO.success("Logout successful", undefined);
      mockAuthService.logout.mockResolvedValue(mockResponse);

      const result = await controller.logout(mockRequest);
      expect(mockAuthService.logout).toHaveBeenCalledWith(
        "test-user-id",
        "jest-agent",
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("refresh", () => {
    it("should call authService.refreshLoginToken and return response", async () => {
      const refreshDTO: RefreshDTO = {
        refreshToken: "valid-refresh-token",
      };

      const mockResponse = ResponseDTO.success("Token refreshed", {
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });

      mockAuthService.refreshLoginToken.mockResolvedValue(mockResponse);

      const result = await controller.refresh(mockRequest, refreshDTO);
      expect(mockAuthService.refreshLoginToken).toHaveBeenCalledWith(
        refreshDTO,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
