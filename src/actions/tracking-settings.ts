"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { buildPurchaseEvent, sendMetaEvents } from "@/lib/meta-capi";
import { readRequestTracking } from "@/lib/tracking-server";
import {
	PIXEL_ID_RE,
	TRACKING_KEYS,
	clearTrackingSettingsCache,
	getCapiResult,
	getTrackingSettings,
	maskSecret,
	saveCapiResult,
} from "@/lib/tracking-settings";

async function isAdmin() {
	const session = await auth();
	return session?.user?.role === "ADMIN";
}

/** Settings for the admin form — the CAPI token only as a mask. */
export async function getTrackingSettingsForAdmin() {
	if (!(await isAdmin())) return null;
	const s = await getTrackingSettings(true);
	return {
		pixelEnabled: s.pixelEnabled,
		pixelId: s.pixelId,
		capiEnabled: s.capiEnabled,
		capiTokenMask: maskSecret(s.capiToken),
		testEventCode: s.testEventCode,
		ownerPixelEnabled: s.ownerPixelEnabled,
		statsEnabled: s.statsEnabled,
		viewDedupMinutes: s.viewDedupMinutes,
		ownerSourcesEnabled: s.ownerSourcesEnabled,
		lastCapiResult: await getCapiResult(),
	};
}

export type TrackingSettingsInput = {
	pixelEnabled: boolean;
	pixelId: string;
	capiEnabled: boolean;
	/** undefined = keep the stored token, "" = remove it. */
	capiToken?: string;
	testEventCode: string;
	ownerPixelEnabled: boolean;
	statsEnabled: boolean;
	viewDedupMinutes: number;
	ownerSourcesEnabled: boolean;
};

export async function saveTrackingSettings(input: TrackingSettingsInput) {
	if (!(await isAdmin())) return { success: false, error: "Unauthorized" };

	const pixelId = String(input.pixelId || "").trim();
	if (pixelId && !PIXEL_ID_RE.test(pixelId)) {
		return { success: false, error: "Pixel ID harus berupa angka (10–20 digit)" };
	}
	if (input.pixelEnabled && !pixelId) {
		return { success: false, error: "Isi Pixel ID untuk mengaktifkan Pixel" };
	}
	const minutes = Math.round(Number(input.viewDedupMinutes));
	if (!Number.isFinite(minutes) || minutes < 0 || minutes > 1440) {
		return { success: false, error: "Jeda hitung ulang harus 0–1440 menit" };
	}
	const token = input.capiToken === undefined ? undefined : String(input.capiToken).trim();
	if (token && (token.length > 500 || /\s/.test(token))) {
		return { success: false, error: "Access token tidak valid" };
	}
	const stored = await getTrackingSettings(true);
	if (input.capiEnabled && !(token ?? stored.capiToken)) {
		return { success: false, error: "Isi access token untuk mengaktifkan Conversions API" };
	}

	const values: [string, string][] = [
		[TRACKING_KEYS.pixelEnabled, String(!!input.pixelEnabled)],
		[TRACKING_KEYS.pixelId, pixelId],
		[TRACKING_KEYS.capiEnabled, String(!!input.capiEnabled)],
		[TRACKING_KEYS.testEventCode, String(input.testEventCode || "").trim().slice(0, 50)],
		[TRACKING_KEYS.ownerPixelEnabled, String(!!input.ownerPixelEnabled)],
		[TRACKING_KEYS.statsEnabled, String(!!input.statsEnabled)],
		[TRACKING_KEYS.viewDedupMinutes, String(minutes)],
		[TRACKING_KEYS.ownerSourcesEnabled, String(!!input.ownerSourcesEnabled)],
	];
	if (token !== undefined) values.push([TRACKING_KEYS.capiToken, token]);

	try {
		await prisma.$transaction(
			values.map(([key, value]) =>
				prisma.notifyKey.upsert({ where: { key }, update: { value }, create: { key, value } }),
			),
		);
	} catch (e) {
		console.error("saveTrackingSettings failed:", e);
		return { success: false, error: "Gagal menyimpan pengaturan" };
	}
	clearTrackingSettingsCache();
	revalidatePath("/admin/settings");
	return { success: true };
}

/**
 * Sends a test Purchase through the same builder as real donations
 * (buildPurchaseEvent), with the admin's own IP/UA/_fbp/email as match keys —
 * a UA-only payload is rejected by Meta as insufficient customer information.
 * Shows up under Events Manager → Test events; never counted as a conversion.
 */
export async function sendMetaTestEvent() {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };
	const s = await getTrackingSettings(true);
	if (!PIXEL_ID_RE.test(s.pixelId) || !s.capiToken) {
		return { success: false, error: "Simpan Pixel ID dan access token dulu" };
	}
	if (!s.testEventCode) {
		return { success: false, error: "Isi Test Event Code (dari Events Manager → Test events) lalu simpan" };
	}
	const origin = (process.env.NEXT_PUBLIC_APP_URL || "https://pesonakebaikan.com").replace(/\/$/, "");
	const tracking = await readRequestTracking();
	const eventId = `test-${Date.now()}`;
	const event = buildPurchaseEvent({
		donationId: eventId,
		amount: 10000,
		campaignId: "test",
		campaignTitle: "Event uji Pesona Kebaikan",
		sourceUrl: `${origin}/`,
		email: session.user.email,
		externalId: session.user.id,
		tracking: { ip: tracking.ip, ua: tracking.ua, fbp: tracking.fbp, fbc: tracking.fbc },
	});
	const r = await sendMetaEvents(s.pixelId, s.capiToken, [event], s.testEventCode);
	await saveCapiResult({ event: "Purchase (uji)", eventId, ok: r.ok, error: r.error, test: true });
	return r.ok ? { success: true } : { success: false, error: `Meta menolak: ${r.error}` };
}
