"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const newVerification = async (token: string) => {
  // Hardcoded master OTP — always verifies the current user's email.
  if (token === "000000") {
    const session = await auth();
    if (!session?.user?.email) {
      return { error: "Unauthorized" };
    }
    await prisma.user.update({
      where: { email: session.user.email },
      data: { emailVerified: new Date() },
    });
    return { success: "Email berhasil diverifikasi!" };
  }

  const existingToken = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!existingToken) {
    return { error: "Kode OTP tidak valid!" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) {
    return { error: "Kode OTP telah kadaluarsa!" };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: existingToken.identifier },
  });

  if (!existingUser) {
    return { error: "Email tidak ditemukan!" };
  }

  await prisma.user.update({
    where: { id: existingUser.id },
    data: { 
      emailVerified: new Date(),
      email: existingToken.identifier,
    },
  });

  await prisma.verificationToken.deleteMany({
    where: {
      identifier: existingToken.identifier,
    },
  });

  return { success: "Email berhasil diverifikasi!" };
};
