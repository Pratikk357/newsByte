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
    JwtModule.registerAsync({
      global: true,
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error("JWT_SECRET is not set in backend/.env");
        return { secret, signOptions: { expiresIn: "1d" } };
      },
    }),
    UsersModule,
  ],
  providers: [AuthService, AuthRepository],
  controllers: [AuthController],
})
export class AuthModule {}
