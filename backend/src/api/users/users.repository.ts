import { PrismaService } from "@/api/prisma/prisma.service";
import { handlePrismaError } from "@/utils/error/handler";
import { Injectable, Logger } from "@nestjs/common";
import { User } from "@prisma/client";

@Injectable()
export class UserRepository {
  private readonly logger = new Logger(UserRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Gets the user by ID.
   * @param id User ID
   * @returns User Type
   */
  async findById(id: string): Promise<User | null> {
    try {
      const user = this.prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return user;
    } catch (error: unknown) {
      throw new Error(`Error finding user by ID: ${error}`);
    }
  }

  /**
   * Gets User by Email
   * @param email Email to find the user
   * @returns User Type
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = this.prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return user;
    } catch (error: unknown) {
      throw new Error(`Error finding user by email: ${error}`);
    }
  }

  /**
   * Get User by Phone Number
   * @param phoneNumber Unique Phone number to fetch user from
   * @returns User Type
   */
  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    try {
      const user = this.prisma.user.findUnique({ where: { phoneNumber } });
      if (!user) return null;
      return user;
    } catch (error: unknown) {
      throw new Error(`Error finding user by phone number: ${error}`);
    }
  }

  /**
   * Creates user data in the database
   * @param data firstName, lastName, email, password, phoneNumber of the user to create
   * @returns User Type
   */
  async createUser(data: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
  }): Promise<User | null> {
    try {
      return await this.prisma.user.create({ data });
    } catch (error: unknown) {
      this.logger.error(`Error during user creation: ${error}`);
      handlePrismaError(error, "Error while creating user.");
    }
  }

  /**
   * Updates the user data in database
   * @param id User ID
   * @param data Data that is to be updated
   * @returns User Type
   */
  async updateUser(
    id: string,
    data: { email?: string; password?: string },
  ): Promise<User | null> {
    try {
      const user = this.prisma.user.update({ where: { id }, data });
      if (!user) return null;
      return user;
    } catch (error: unknown) {
      throw new Error(`Error updating user: ${error}`);
    }
  }
}
