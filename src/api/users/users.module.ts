import { PrismaService } from "@/api/prisma/prisma.service";
import { UsersController } from "@/api/users/users.controller";
import { UserRepository } from "@/api/users/users.repository";
import { UsersService } from "@/api/users/users.service";
import { Module } from "@nestjs/common";

@Module({
  providers: [UsersService, PrismaService, UserRepository],
  controllers: [UsersController],
  exports: [UserRepository],
})
export class UsersModule {}
