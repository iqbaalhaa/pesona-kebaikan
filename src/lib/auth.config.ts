import type { NextAuthConfig } from "next-auth";
import { Role } from "@/generated/prisma/enums";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Middleware logic is handled in middleware.ts
      return true;
    },
    session({ session, token }) {
      if (token?.role && session.user) {
        session.user.role = token.role as Role;
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role as Role;
      }
      return token;
    }
  },
  providers: [],
} satisfies NextAuthConfig;
