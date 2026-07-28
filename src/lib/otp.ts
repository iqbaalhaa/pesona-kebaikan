import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const OTP_CONFIG = {
	EXPIRY_MIN: 5,
	RESEND_COOLDOWN_SEC: 60,
	MAX_PER_HOUR: 3,
	MAX_PER_DAY: 5,
	MAX_VERIFY_ATTEMPTS: 5,
	JITTER_MIN_MS: 800,
	JITTER_MAX_MS: 2500,
};

export function normalizePhone(phone: string) {
	return phone.replace(/\D/g, "");
}

export function generateOtp() {
	return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(otp: string) {
	return crypto.createHash("sha256").update(otp).digest("hex");
}

function pick<T>(arr: T[]): T {
	return arr[crypto.randomInt(0, arr.length)];
}

// #5 Throttle: random human-like delay before sending to avoid burst pattern.
export async function jitterDelay() {
	const { JITTER_MIN_MS, JITTER_MAX_MS } = OTP_CONFIG;
	const ms = JITTER_MIN_MS + crypto.randomInt(0, JITTER_MAX_MS - JITTER_MIN_MS + 1);
	await new Promise((resolve) => setTimeout(resolve, ms));
}

// #1 Cooldown + #2 Rate limit. Throws Error with a user-facing message if blocked.
export async function assertCanSend(phone: string) {
	const now = Date.now();
	const oneHourAgo = new Date(now - 60 * 60 * 1000);
	const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

	const [latest, hourCount, dayCount] = await Promise.all([
		prisma.otpRequest.findFirst({
			where: { phone },
			orderBy: { createdAt: "desc" },
		}),
		prisma.otpRequest.count({
			where: { phone, createdAt: { gte: oneHourAgo } },
		}),
		prisma.otpRequest.count({
			where: { phone, createdAt: { gte: oneDayAgo } },
		}),
	]);

	if (latest) {
		const elapsedSec = (now - latest.createdAt.getTime()) / 1000;
		if (elapsedSec < OTP_CONFIG.RESEND_COOLDOWN_SEC) {
			const wait = Math.ceil(OTP_CONFIG.RESEND_COOLDOWN_SEC - elapsedSec);
			throw new Error(
				`Mohon tunggu ${wait} detik sebelum meminta kode OTP lagi.`,
			);
		}
	}

	if (hourCount >= OTP_CONFIG.MAX_PER_HOUR) {
		throw new Error(
			"Terlalu banyak permintaan OTP. Silakan coba lagi dalam 1 jam.",
		);
	}

	if (dayCount >= OTP_CONFIG.MAX_PER_DAY) {
		throw new Error(
			"Batas permintaan OTP harian tercapai. Silakan coba lagi besok.",
		);
	}
}

// Invalidate any prior active OTP for this phone, then issue a fresh one.
export async function issueOtp(phone: string) {
	const otp = generateOtp();
	const otpHash = hashOtp(otp);

	await prisma.otpRequest.updateMany({
		where: { phone, used_at: null, expires_at: { gt: new Date() } },
		data: { used_at: new Date() },
	});

	await prisma.otpRequest.create({
		data: {
			phone,
			otp_hash: otpHash,
			expires_at: new Date(Date.now() + OTP_CONFIG.EXPIRY_MIN * 60 * 1000),
		},
	});

	return otp;
}

// #4 Message variation: rotate phrasing so repeated sends don't look like bulk spam.
export function buildVerificationMessage(otp: string) {
	const intro = pick([
		"Halo! Berikut kode verifikasi akun Anda di Pesona Kebaikan.",
		"Assalamualaikum, ini kode verifikasi akun Pesona Kebaikan Anda.",
		"Terima kasih telah bergabung di Pesona Kebaikan. Ini kode verifikasi Anda.",
	]);
	const codeLine = pick([
		`Kode OTP: *${otp}*`,
		`Kode verifikasi Anda: *${otp}*`,
		`Gunakan kode ini: *${otp}*`,
	]);
	const outro = pick([
		`Kode berlaku ${OTP_CONFIG.EXPIRY_MIN} menit. Jangan bagikan ke siapa pun.`,
		`Berlaku selama ${OTP_CONFIG.EXPIRY_MIN} menit. Rahasiakan kode ini.`,
		`Masa berlaku ${OTP_CONFIG.EXPIRY_MIN} menit. Jangan berikan kepada siapa pun.`,
	]);
	return `${intro}\n\n${codeLine}\n\n${outro}`;
}
