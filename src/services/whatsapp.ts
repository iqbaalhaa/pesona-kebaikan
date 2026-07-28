import { prisma } from "@/lib/prisma";

const WA_NOTIFY_API = "https://semata.depatidigital.com/public/wa/v1";

function formatPhoneNumber(phone: string) {
	let cleaned = phone.replace(/\D/g, "");
	if (cleaned.startsWith("0")) {
		cleaned = "62" + cleaned.slice(1);
	}
	return cleaned;
}

/**
 * WA sending is temporarily disabled system-wide (2026-07) — WhatsApp
 * Business API policy tightened by Meta, risk of the sender number getting
 * banned. This is the single chokepoint both the profile phone-verification
 * OTP flow (src/actions/otp.ts) and the admin test tool (src/actions/test-wa.ts,
 * /admin/test-wa) go through, so disabling it here blocks every caller at once.
 * To restore: delete this early return and uncomment the implementation below.
 */
export async function sendWhatsAppMessage(to: string, message: string) {
	return {
		success: false,
		error:
			"Pengiriman WhatsApp sedang dinonaktifkan sementara (kebijakan Meta diperketat, menghindari resiko banned).",
	};
}

/*
Original implementation — restore by uncommenting this and replacing the
short-circuited sendWhatsAppMessage above with it.

export async function sendWhatsAppMessage(to: string, message: string) {
	try {
		const [applicationIdKey, legacyClientIdKey, applicationSecretKey, legacySecretKey] =
			await Promise.all([
				prisma.notifyKey.findUnique({
					where: { key: "whatsapp_application_id" },
				}),
				prisma.notifyKey.findUnique({
					where: { key: "whatsapp_client_id" },
				}),
				prisma.notifyKey.findUnique({
					where: { key: "whatsapp_application_secret" },
				}),
				prisma.notifyKey.findUnique({
					where: { key: "whatsapp_secret_key" },
				}),
			]);

		const applicationId = applicationIdKey?.value || legacyClientIdKey?.value;

		if (!applicationId) {
			throw new Error("WhatsApp Application ID belum dikonfigurasi.");
		}

		const secret = applicationSecretKey?.value || legacySecretKey?.value;

		if (!secret) {
			throw new Error("WhatsApp Application Secret belum dikonfigurasi.");
		}

		const url = `${WA_NOTIFY_API}/applications/${applicationId}/send`;

		const formattedTo = formatPhoneNumber(to);

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Secret-Key": secret,
			},
			body: JSON.stringify({
				phone: formattedTo,
				message,
				priority: "high",
				secret: secret,
			}),
		});

		const responseText = await response.text();
		let data;

		try {
			data = JSON.parse(responseText);
		} catch {
			console.error("WhatsApp API Invalid JSON Response:", responseText);
			throw new Error(
				`Gagal menghubungi server WhatsApp (Status: ${response.status}). Response bukan JSON valid.`,
			);
		}

		if (!response.ok) {
			console.error("WhatsApp API Error:", data);

			if (
				response.status === 404 &&
				(data.error === "client not found" ||
					data.error === "application not found")
			) {
				throw new Error(
					"WhatsApp Application ID tidak valid atau tidak ditemukan. Silakan periksa pengaturan.",
				);
			}

			if (response.status === 401) {
				throw new Error(
					"WhatsApp Application Secret salah atau tidak cocok dengan Application ID. Silakan periksa pengaturan.",
				);
			}

			throw new Error(
				data.error || data.message || "Gagal mengirim pesan WhatsApp",
			);
		}

		if (data.ok === false) {
			console.error("WhatsApp API Error:", data);
			throw new Error(
				data.error || data.message || "Gagal mengirim pesan WhatsApp",
			);
		}

		return { success: true, data };
	} catch (error) {
		console.error("WhatsApp Error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}
*/
