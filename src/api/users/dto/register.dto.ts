import { ResponseDTO } from "@/common/dto";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "@prisma/client";
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MinLength,
} from "class-validator";

// Register Schema
export class RegisterDTO {
  @ApiProperty({ example: "John", description: "First Name" })
  @IsNotEmpty({ message: "First name is required" })
  firstName: string;

  @ApiProperty({ example: "Doe", description: "Last Name" })
  @IsNotEmpty({ message: "Last name is required" })
  lastName: string;

  @ApiProperty({ example: "johndoe@example.com", description: "User Email" })
  @IsEmail({}, { message: "Invalid email format" })
  email: string;

  @ApiProperty({ example: "johndoe", description: "Usernmae" })
  @IsNotEmpty({ message: "Username is required" })
  username: string;

  @ApiProperty({ example: "Strong@123", description: "User Password" })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters long" })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Password must be strong. It should contain at least 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol.",
    },
  )
  password: string;

  @ApiProperty({ example: "Strong@123", description: "Confirm Password" })
  @IsNotEmpty({ message: "Confirm Password is required" })
  // @Equals('password', { message: 'Passwords do not match' }) // TODO: To fix
  confirmPassword: string;

  @ApiProperty({
    example: "+1234567890",
    description: "Phone Number",
    required: false,
  })
  @IsNotEmpty({ message: "Phone number is required" })
  phoneNumber: string;
}

export class RegisterResponseDTO {
  @ApiProperty({ example: "1234567890", description: "User ID" })
  id: string;

  @ApiProperty({ example: "John Doe", description: "Full Name" })
  name: string;

  @ApiProperty({ example: "John", description: "First Name" })
  firstName: string;

  @ApiProperty({ example: "Doe", description: "Last Name" })
  lastName: string | null;

  @ApiProperty({ example: "johndoe@example.com", description: "User Email" })
  email: string;

  @ApiProperty({ example: "USER", description: "User Role" })
  role: string;

  @ApiProperty({ example: true, description: "Account activation status" })
  isActive: boolean;

  constructor(
    id: string,
    firstName: string,
    lastName: string | null,
    email: string,
    role: string,
    isActive: boolean,
  ) {
    this.id = id;
    this.name = `${firstName} ${lastName ?? ""}`.trim();
    this.firstName = firstName;
    this.lastName = lastName ?? "";
    this.email = email;
    this.role = role;
    this.isActive = isActive;
  }

  static fromEntity({ id, firstName, lastName, email, role, isActive }: User) {
    return new RegisterResponseDTO(
      id,
      firstName,
      lastName,
      email,
      role,
      isActive,
    );
  }
}

export class RegisterResponseWrapperDTO extends ResponseDTO<RegisterResponseDTO> {
  @ApiProperty({ type: RegisterResponseDTO })
  declare responseObject: RegisterResponseDTO;
}
