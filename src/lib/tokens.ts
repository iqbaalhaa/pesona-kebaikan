import { prisma } from "@/lib/prisma";

export const generateVerificationToken = async (email: string) => {
  // Generate 6 digit OTP code
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  // Token expires in 1 hour
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: email,
    },
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token,
        },
      },
    });
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
};
