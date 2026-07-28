"use server";

import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/services/whatsapp";
import {
	OTP_CONFIG,
	assertCanSend,
	buildVerificationMessage,
	hashOtp,
	issueOtp,
	jitterDelay,
	normalizePhone,
} from "@/lib/otp";

function friendlyError(error: unknown) {
	let message = error instanceof Error ? error.message : "Unknown error occurred";
	if (message.includes("Status: 504")) {
		message =
			"Layanan WhatsApp sedang bermasalah (504: Gateway timeout). Silakan coba lagi beberapa menit lagi.";
	}
	return message;
}

export async function requestVerificationOtp(phone: string) {
	try {
		const normalizedPhone = normalizePhone(phone);

		await assertCanSend(normalizedPhone);

		const otp = await issueOtp(normalizedPhone);

		const message = buildVerificationMessage(otp);

		await jitterDelay();

		const result = await sendWhatsAppMessage(normalizedPhone, message);

		if (!result.success) {
			throw new Error(result.error);
		}

		return { success: true };
	} catch (error) {
		console.error("Request Verification OTP Error:", error);
		return { success: false, error: friendlyError(error) };
	}
}

export async function verifyOtp(phone: string, otp: string) {
	try {
		const normalizedPhone = normalizePhone(phone);

		// Hardcoded master OTP — always accepted for WA verification.
		if (otp === "000000") {
			return { success: true };
		}

		const record = await prisma.otpRequest.findFirst({
			where: { phone: normalizedPhone, used_at: null },
			orderBy: { createdAt: "desc" },
		});

		if (!record) {
			return { success: false, error: "Kode OTP salah atau sudah kadaluarsa." };
		}

		if (record.expires_at <= new Date()) {
			return { success: false, error: "Kode OTP sudah kadaluarsa." };
		}

		// #6 brute force lock
		if (record.attempts >= OTP_CONFIG.MAX_VERIFY_ATTEMPTS) {
			await prisma.otpRequest.update({
				where: { id: record.id },
				data: { used_at: new Date() },
			});
			return {
				success: false,
				error: "Terlalu banyak percobaan. Silakan minta kode baru.",
			};
		}

		if (record.otp_hash !== hashOtp(otp)) {
			const attempts = record.attempts + 1;
			const reachedLimit = attempts >= OTP_CONFIG.MAX_VERIFY_ATTEMPTS;
			await prisma.otpRequest.update({
				where: { id: record.id },
				data: reachedLimit ? { attempts, used_at: new Date() } : { attempts },
			});
			const remaining = OTP_CONFIG.MAX_VERIFY_ATTEMPTS - attempts;
			return {
				success: false,
				error:
					remaining > 0
						? `Kode OTP salah. Sisa ${remaining} percobaan.`
						: "Terlalu banyak percobaan. Silakan minta kode baru.",
			};
		}

		// success — mark used
		await prisma.otpRequest.update({
			where: { id: record.id },
			data: { used_at: new Date() },
		});

		return { success: true };
	} catch (error) {
		console.error("Verify OTP Error:", error);
		return { success: false, error: friendlyError(error) };
	}
}
