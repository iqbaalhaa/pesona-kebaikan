"use server";

import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/services/whatsapp";
import crypto from "crypto";

function normalizePhone(phone: string) {
	return phone.replace(/\D/g, "");
}

function hashOtp(otp: string) {
	return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function requestOtp(
	phone: string,
	campaignTitle: string,
	amount: string,
	campaignSlug?: string,
) {
	try {
		const normalizedPhone = normalizePhone(phone);
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpHash = hashOtp(otp);

		await prisma.otpRequest.create({
			data: {
				phone: normalizedPhone,
				otp_hash: otpHash,
				expires_at: new Date(Date.now() + 15 * 60 * 1000),
			},
		});

		let message = `*Konfirmasi Pencairan Dana*\n\nUntuk menyetujui pencairan dana sebesar *${amount}* dari campaign "${campaignTitle}", gunakan kode OTP berikut:\n\n*${otp}*\n\nKode ini berlaku selama 5 menit. Jangan berikan kepada siapapun.`;

		if (campaignSlug) {
			message += `\n\nLink Campaign:\nlocalhost:3000/galang-dana/${campaignSlug}`;
		}

		const result = await sendWhatsAppMessage(normalizedPhone, message);

		if (!result.success) {
			throw new Error(result.error);
		}

		return { success: true };
	} catch (error) {
		console.error("Request OTP Error:", error);
		let message =
			error instanceof Error ? error.message : "Unknown error occurred";
		if (message.includes("Status: 504")) {
			message =
				"Layanan WhatsApp sedang bermasalah (504: Gateway timeout). Silakan coba lagi beberapa menit lagi.";
		}
		return {
			success: false,
			error: message,
		};
	}
}

export async function requestVerificationOtp(phone: string) {
	try {
		const normalizedPhone = normalizePhone(phone);
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpHash = hashOtp(otp);

		await prisma.otpRequest.create({
			data: {
				phone: normalizedPhone,
				otp_hash: otpHash,
				expires_at: new Date(Date.now() + 15 * 60 * 1000),
			},
		});

		const message = `*Verifikasi Akun*\n\nKode OTP Anda adalah: *${otp}*\n\nGunakan kode ini untuk memverifikasi akun Anda di Pesona Kebaikan.\nKode berlaku selama 5 menit. JANGAN BERIKAN KODE INI KEPADA SIAPAPUN.`;

		const result = await sendWhatsAppMessage(normalizedPhone, message);

		if (!result.success) {
			throw new Error(result.error);
		}

		return { success: true };
	} catch (error) {
		console.error("Request Verification OTP Error:", error);
		let message =
			error instanceof Error ? error.message : "Unknown error occurred";
		if (message.includes("Status: 504")) {
			message =
				"Layanan WhatsApp sedang bermasalah (504: Gateway timeout). Silakan coba lagi beberapa menit lagi.";
		}
		return {
			success: false,
			error: message,
		};
	}
}

export async function verifyOtp(phone: string, otp: string) {
	try {
		const normalizedPhone = normalizePhone(phone);
		console.log(`[OTP] Verifying for ${normalizedPhone} with code ${otp}`);
		if (process.env.NEXT_PUBLIC_BYPASS_OTP === "true" && otp === "000000") {
			console.log("[OTP] Bypassed");
			return { success: true };
		}

		const otpHash = hashOtp(otp);
		console.log(`[OTP] Hash: ${otpHash}`);

		const validOtp = await prisma.otpRequest.findFirst({
			where: {
				phone: normalizedPhone,
				otp_hash: otpHash,
				expires_at: {
					gt: new Date(),
				},
			},
		});

		if (!validOtp) {
			console.log("[OTP] No valid OTP found");
			const expiredOtp = await prisma.otpRequest.findFirst({
				where: {
					phone: normalizedPhone,
					otp_hash: otpHash,
				},
			});
			if (expiredOtp) {
				console.log("[OTP] Found expired OTP");
				return { success: false, error: "Kode OTP sudah kadaluarsa." };
			}
			return { success: false, error: "Kode OTP salah atau sudah kadaluarsa." };
		}

		console.log("[OTP] Valid OTP found");

		// Mark as used (delete)
		await prisma.otpRequest.delete({
			where: {
				id: validOtp.id,
			},
		});

		return { success: true };
	} catch (error) {
		console.error("Verify OTP Error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}
