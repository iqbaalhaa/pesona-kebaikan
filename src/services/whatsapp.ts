import { prisma } from "@/lib/prisma";

const WA_NOTIFY_API = "https://wanotify.depatidigital.com/public/wa/v1";
// Note: In a real app, this should be an env var, but using the provided secret for now
const WA_SECRET = "c3b50797c7be76edc016176296c2203cc0a8789ae3448ee96088557899254fb2";

function formatPhoneNumber(phone: string) {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
}

export async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const notifyKey = await prisma.notifyKey.findUnique({
      where: { key: "whatsapp_client_id" },
    });

    if (!notifyKey || !notifyKey.value) {
      throw new Error("WhatsApp Client ID belum dikonfigurasi.");
    }

    const clientId = notifyKey.value;
    const url = `${WA_NOTIFY_API}/${clientId}/send`;
    
    const formattedTo = formatPhoneNumber(to);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Secret-Key": WA_SECRET,
      },
      body: JSON.stringify({
        to: formattedTo,
        message,
        priority: "high",
        secret: WA_SECRET,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal mengirim pesan WhatsApp");
    }

    return { success: true, data };
  } catch (error) {
    console.error("WhatsApp Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}
