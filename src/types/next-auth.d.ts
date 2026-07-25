import { Role, AdminPermission } from "@prisma/client";
import { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role: Role;
  permissions?: AdminPermission[];
  phone?: string | null;
  emailVerified?: Date | null;
  phoneVerified?: Date | null;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    role: Role;
    permissions?: AdminPermission[];
    phone?: string | null;
    emailVerified?: Date | null;
    phoneVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    permissions?: AdminPermission[];
    phone?: string | null;
    emailVerified?: Date | null;
    phoneVerified?: Date | null;
  }
}
