import { Role } from "@prisma/client";

export type UserLoginSession = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  role: Role;
  accessToken: string;
  refreshToken: string;
};
