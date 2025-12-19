import { signIn } from "@/auth";
import prisma from "@/lib/db";
import { LoginSchema } from "@/utils/schema";
import { AuthError } from "next-auth";
import * as z from "zod";

const login = async (data: z.infer<typeof LoginSchema>) => {
  const validateData = LoginSchema.parse(data);
  if (!validateData) {
    return { error: "Invalid input data" };
  }
  const { email, password } = validateData;
  const userExist = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  if (!userExist || !userExist.password || !userExist.email) {
    return { error: "User not found" };
  }

  try {
    await signIn("credentials", {
      email: userExist.email,
      password: password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Please confirm your email address" };
      }
    }
    throw error;
  }

  return { success: "User logged in successfully!" };
};

export default login;
