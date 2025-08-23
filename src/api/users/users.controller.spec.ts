import { RegisterDTO, RegisterResponseDTO } from "@/api/users/dto";
import { UsersController } from "@/api/users/users.controller";
import { UsersService } from "@/api/users/users.service";
import { ResponseDTO } from "@/common/dto";
import { Test, TestingModule } from "@nestjs/testing";
import { Role } from "@prisma/client";

// Mock UsersService
const mockUsersService = {
  register: jest.fn(),
};

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    it("should return a success response when user is registered", async () => {
      const registerDTO: RegisterDTO = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "johndoe@example.com",
        password: "password123",
        confirmPassword: "password123",
        phoneNumber: "1234567890",
      };

      const mockResponse: RegisterResponseDTO = {
        id: "user-id",
        name: "John Doe",
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        role: Role.USER,
        isActive: true,
      };

      // Mock the UsersService's register method to return a mocked response
      mockUsersService.register.mockResolvedValue(
        ResponseDTO.success("User registered successfully.", mockResponse),
      );

      // Call the register method from the controller
      const result = await controller.register(registerDTO);

      // Check if the result matches the expected response
      expect(result).toEqual(
        ResponseDTO.success("User registered successfully.", mockResponse),
      );
      expect(mockUsersService.register).toHaveBeenCalledWith(registerDTO);
    });

    it("should throw error if registration fails", async () => {
      const registerDTO: RegisterDTO = {
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        email: "johndoe@example.com",
        password: "password123",
        confirmPassword: "password123",
        phoneNumber: "1234567890",
      };

      // Mock the UsersService's register method to simulate failure
      mockUsersService.register.mockResolvedValue(
        ResponseDTO.failure("Registration failed.", null),
      );

      // Call the register method and check for the error response
      const result = await controller.register(registerDTO);
      expect(result).toEqual(ResponseDTO.failure("Registration failed.", null));
      expect(mockUsersService.register).toHaveBeenCalledWith(registerDTO);
    });
  });
});
