import { AuthController } from "@/api/auth/auth.controller";
import { AuthRepository } from "@/api/auth/auth.repository";
import { AuthService } from "@/api/auth/auth.service";
import { PrismaModule } from "@/api/prisma/prisma.module";
import { UsersModule } from "@/api/users/users.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || "your-secret-key",
      signOptions: { expiresIn: "1d" },
    }),
    UsersModule,
  ],
  providers: [AuthService, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
