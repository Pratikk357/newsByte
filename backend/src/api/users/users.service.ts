import { RegisterDTO, RegisterResponseDTO } from "@/api/users/dto";
import { UserRepository } from "@/api/users/users.repository";
import { ResponseDTO } from "@/common/dto";
import { handleError } from "@/utils/error/handler";
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly userRepository: UserRepository) {}
  /**
   * @param registerDTO Contains the Register Information like name, email, password and so on
   * Handles user registration and returns user information with success message.
   */
  async register(
    registerDTO: RegisterDTO,
  ): Promise<ResponseDTO<RegisterResponseDTO>> {
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(registerDTO.password, 10);

      // Check if the email or phone number already exists
      const existingUser = await this.userRepository.findByEmail(
        registerDTO.email,
      );

      if (existingUser) throw new ConflictException("Email already in use.");

      const existingPhone = await this.userRepository.findByPhoneNumber(
        registerDTO.phoneNumber,
      );

      if (existingPhone)
        throw new ConflictException("Phone number already in use.");

      // Create the new user
      const user = await this.userRepository.createUser({
        firstName: registerDTO.firstName,
        lastName: registerDTO.lastName,
        username: registerDTO.username,
        email: registerDTO.email,
        password: hashedPassword,
        phoneNumber: registerDTO.phoneNumber,
      });

      // Handle user creation failure
      if (!user) throw new InternalServerErrorException("Error creating user.");

      // Prepare the response DTO
      const registerResponseDTO: RegisterResponseDTO =
        RegisterResponseDTO.fromEntity(user);

      // Return success response
      return ResponseDTO.success(
        "User registration successful.",
        registerResponseDTO,
      );
    } catch (error: unknown) {
      handleError(error, "Error registering user.", this.logger);
    }
  }
}
