import { User } from "@prisma/client";

export type UserWithToken = User & {
  accessToken: string;
  refreshToken: string;
};
