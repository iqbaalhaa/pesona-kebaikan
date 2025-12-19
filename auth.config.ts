import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { LoginSchema } from "@/utils/schema";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export default {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const validateData = LoginSchema.parse(credentials);
        if (!validateData) {
          return { error: "Invalid credentials" };
        }

        const { email, password } = validateData;
        const lowerCaseEmail = email.toLowerCase();

        const userExist = await prisma.user.findFirst({
          where: {
            email: lowerCaseEmail,
          },
        });
        if (!userExist || !userExist.password || !userExist.email) {
          return { error: "User not found" };
        }

        const passwordsMatch = await bcrypt.compare(password, userExist.password);
        if (passwordsMatch) return userExist;

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
