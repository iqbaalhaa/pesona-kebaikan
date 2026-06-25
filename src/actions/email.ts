"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail, verifyTransport } from "@/lib/mail";

const mapSmtpError = (msg?: string) => {
  const m = (msg || "").toLowerCase();
  if (/invalid login|username and password not accepted|535/i.test(m)) {
    return "Login SMTP gagal. Gunakan App Password Gmail dan pastikan 2FA aktif.";
  }
  if (/enotfound|econnrefused|econnreset|ehostunreach|timed out|timeout|greeting never received/i.test(m)) {
    return "Gagal terhubung ke server email. Coba ganti ke port 465 (secure) atau periksa koneksi jaringan/firewall.";
  }
  if (/authentication failed|auth/i.test(m)) {
    return "Autentikasi SMTP gagal. Periksa EMAIL_SERVER_USER dan EMAIL_SERVER_PASSWORD.";
  }
  return msg || "Gagal mengirim email verifikasi";
};

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
    // return { success: "Email sudah terverifikasi" };
  }

  if (!process.env.EMAIL_SERVER_HOST) {
    return { error: "Konfigurasi SMTP belum tersedia" };
  }

  try {
    const verify = await verifyTransport();
    if (!verify.ok) {
      return { error: mapSmtpError(verify.message) };
    }
    const tokenRec = await generateVerificationToken(user.email);
    const sent = await sendVerificationEmail(tokenRec.identifier, tokenRec.token);
    if (!sent.ok) {
      return { error: mapSmtpError(sent.message), debug: sent.debug };
    }
    return { success: "Kode verifikasi telah dikirim ke email Anda. Cek kotak masuk (Inbox), jika tidak ada periksa folder Spam/Promosi.", debug: sent.debug };
  } catch (error) {
    console.error("Send verification email error:", error);
    return { error: "Gagal mengirim email verifikasi" };
  }
}
