import { prisma } from "@/lib/prisma";

const WA_NOTIFY_API = "https://wanotify.depatidigital.com/public/wa/v1";
// Note: In a real app, this should be an env var, but using the provided secret for now
const WA_SECRET_DEFAULT =
	"b568e335a1ef1f599f1644262abad403afefcc558dbeb2230c12aabaf16bc9de";

function formatPhoneNumber(phone: string) {
	let cleaned = phone.replace(/\D/g, "");
	if (cleaned.startsWith("0")) {
		cleaned = "62" + cleaned.slice(1);
	}
	return cleaned;
}

export async function sendWhatsAppMessage(to: string, message: string) {
	try {
		const [notifyKey, secretKey] = await Promise.all([
			prisma.notifyKey.findUnique({ where: { key: "whatsapp_client_id" } }),
			prisma.notifyKey.findUnique({ where: { key: "whatsapp_secret_key" } }),
		]);

		if (!notifyKey || !notifyKey.value) {
			throw new Error("WhatsApp Client ID belum dikonfigurasi.");
		}

		const clientId = notifyKey.value;
		// Use configured secret key or fallback to default
		const secret = secretKey?.value || WA_SECRET_DEFAULT;

		const url = `${WA_NOTIFY_API}/${clientId}/send`;

		const formattedTo = formatPhoneNumber(to);

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"X-Secret-Key": secret,
			},
			body: JSON.stringify({
				to: formattedTo,
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

			if (response.status === 404 && data.error === "client not found") {
				throw new Error(
					"WhatsApp Client ID tidak valid atau tidak ditemukan. Silakan periksa pengaturan.",
				);
			}

			if (response.status === 401) {
				throw new Error(
					"WhatsApp Secret Key salah atau tidak cocok dengan Client ID. Silakan periksa pengaturan.",
				);
			}

			throw new Error(data.message || "Gagal mengirim pesan WhatsApp");
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
