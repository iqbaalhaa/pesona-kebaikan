"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail, verifyTransport } from "@/lib/mail";

export async function requestEmailVerification() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  });

  if (!user?.email) {
    return { error: "Email tidak ditemukan" };
  }

  if (user.emailVerified) {
    return { success: "Email sudah terverifikasi" };
  }

  if (!process.env.EMAIL_SERVER_HOST) {
    return { error: "Konfigurasi SMTP belum tersedia" };
  }

  try {
    const verify = await verifyTransport();
    if (!verify.ok) {
      return { error: verify.message || "Transport tidak siap" };
    }
    const tokenRec = await generateVerificationToken(user.email);
    const sent = await sendVerificationEmail(tokenRec.identifier, tokenRec.token);
    if (!sent.ok) {
      return { error: sent.message || "Gagal mengirim email verifikasi", debug: sent.debug };
    }
    return { success: "Kode verifikasi telah dikirim ke email Anda", debug: sent.debug };
  } catch (error) {
    console.error("Send verification email error:", error);
    return { error: "Gagal mengirim email verifikasi" };
  }
}
