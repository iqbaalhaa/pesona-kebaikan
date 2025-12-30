"use server";

import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/services/whatsapp";
import crypto from "crypto";

// Helper: Hash OTP
function hashOtp(otp: string) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function requestOtp(phone: string, campaignTitle: string, amount: string, campaignSlug?: string) {
  try {
    // 1. Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(otp);

    // 2. Save to DB (Valid for 5 minutes)
    await prisma.otpRequest.create({
      data: {
        phone,
        otp_hash: otpHash,
        expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // 3. Send via WhatsApp
    let message = `*Konfirmasi Pencairan Dana*\n\nUntuk menyetujui pencairan dana sebesar *${amount}* dari campaign "${campaignTitle}", gunakan kode OTP berikut:\n\n*${otp}*\n\nKode ini berlaku selama 5 menit. Jangan berikan kepada siapapun.`;

    if (campaignSlug) {
      message += `\n\nLink Campaign:\nlocalhost:3000/galang-dana/${campaignSlug}`;
    }

    const result = await sendWhatsAppMessage(phone, message);

    if (!result.success) {
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Request OTP Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}

export async function requestVerificationOtp(phone: string) {
  try {
    // 1. Generate OTP (6 digit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = hashOtp(otp);

    // 2. Save to DB (Valid for 5 minutes)
    await prisma.otpRequest.create({
      data: {
        phone,
        otp_hash: otpHash,
        expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // 3. Send via WhatsApp
    const message = `*Verifikasi Akun*\n\nKode OTP Anda adalah: *${otp}*\n\nGunakan kode ini untuk memverifikasi akun Anda di Pesona Kebaikan.\nKode berlaku selama 5 menit. JANGAN BERIKAN KODE INI KEPADA SIAPAPUN.`;

    const result = await sendWhatsAppMessage(phone, message);

    if (!result.success) {
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error) {
    console.error("Request Verification OTP Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}

export async function verifyOtp(phone: string, otp: string) {
  try {
    const otpHash = hashOtp(otp);

    // Find valid OTP
    const validOtp = await prisma.otpRequest.findFirst({
      where: {
        phone,
        otp_hash: otpHash,
        expires_at: { gt: new Date() },
        used_at: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!validOtp) {
      return { success: false, error: "Kode OTP salah atau sudah kadaluarsa." };
    }

    // Mark as used
    await prisma.otpRequest.update({
      where: { id: validOtp.id },
      data: { used_at: new Date() },
    });

    return { success: true };
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}
