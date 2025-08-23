import { RegisterDTO } from "@/api/users/dto";
import { UserRepository } from "@/api/users/users.repository";
import { UsersService } from "@/api/users/users.service";
import {
  ConflictException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("UsersService", () => {
  let service: UsersService;
  let mockUserRepository: {
    findByEmail: jest.Mock;
    findByPhoneNumber: jest.Mock;
    createUser: jest.Mock;
  };

  const mockUser = {
    id: "user-id",
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "johndoe@example.com",
    phoneNumber: "1234567890",
    password: "hashed-password",
    role: Role.USER,
    isActive: true,
  };

  const registerDTO: RegisterDTO = {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "johndoe@example.com",
    phoneNumber: "1234567890",
    password: "password123",
    confirmPassword: "password123",
  };

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findByPhoneNumber: jest.fn(),
      createUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should register a user successfully", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findByPhoneNumber.mockResolvedValue(null);
    mockUserRepository.createUser.mockResolvedValue(mockUser);

    const response = await service.register(registerDTO);

    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "johndoe@example.com",
    );
    expect(mockUserRepository.findByPhoneNumber).toHaveBeenCalledWith(
      "1234567890",
    );
    expect(mockUserRepository.createUser).toHaveBeenCalledWith({
      firstName: "John",
      lastName: "Doe",
      username: "johndoe",
      email: "johndoe@example.com",
      password: "hashed-password",
      phoneNumber: "1234567890",
    });
    expect(response.message).toBe("User registration successful.");
    expect(response.responseObject?.email).toBe("johndoe@example.com");
  });

  it("should throw ConflictException if email already exists", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);

    await expect(service.register(registerDTO)).rejects.toThrow(
      ConflictException,
    );
  });

  it("should throw ConflictException if phone number already exists", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findByPhoneNumber.mockResolvedValue(mockUser);

    await expect(service.register(registerDTO)).rejects.toThrow(
      ConflictException,
    );
  });

  it("should throw InternalServerErrorException if user creation fails", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.findByPhoneNumber.mockResolvedValue(null);
    mockUserRepository.createUser.mockResolvedValue(null);

    await expect(service.register(registerDTO)).rejects.toThrow(
      InternalServerErrorException,
    );
  });
});
