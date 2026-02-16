"use server";

import { sendWhatsAppMessage } from "@/services/whatsapp";

export async function sendTestWhatsapp(to: string, message: string) {
	try {
		const result = await sendWhatsAppMessage(to, message);

		if (!result.success) {
			return {
				success: false,
				error: result.error || "Gagal mengirim pesan WhatsApp",
			};
		}

		return { success: true, data: result.data };
	} catch (error: unknown) {
		console.error("Error sending WhatsApp:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Terjadi kesalahan internal",
		};
	}
}
