import { createHash } from "crypto";
import type { DonationTracking } from "@/lib/tracking-server";

// Meta Conversions API (server-side events). Docs:
// https://developers.facebook.com/docs/marketing-api/conversions-api
const GRAPH_VERSION = "v23.0";

export const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Indonesian phone → E.164 digits without "+", as Meta expects before hashing. */
export function normalizePhone(phone: string | null | undefined): string | null {
	const d = (phone || "").replace(/\D/g, "");
	if (d.length < 8) return null;
	if (d.startsWith("62")) return d;
	if (d.startsWith("0")) return `62${d.slice(1)}`;
	if (d.startsWith("8")) return `62${d}`;
	return d;
}

export type MetaEvent = Record<string, unknown>;

export function buildPurchaseEvent(input: {
	donationId: string;
	amount: number;
	campaignId: string;
	campaignTitle?: string | null;
	sourceUrl: string;
	phone?: string | null;
	email?: string | null;
	externalId?: string | null;
	tracking?: DonationTracking | null;
	eventTime?: number;
}): MetaEvent {
	const t = input.tracking || {};
	const phone = normalizePhone(input.phone);
	const email = input.email?.trim().toLowerCase();
	const userData: Record<string, unknown> = {};
	if (phone) userData.ph = [sha256(phone)];
	if (email) userData.em = [sha256(email)];
	if (input.externalId) userData.external_id = [sha256(input.externalId)];
	if (t.ip) userData.client_ip_address = t.ip;
	if (t.ua) userData.client_user_agent = t.ua;
	if (t.fbp) userData.fbp = t.fbp;
	if (t.fbc) userData.fbc = t.fbc;
	return {
		event_name: "Purchase",
		event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
		// Same id the browser pixel uses → Meta deduplicates the pair.
		event_id: input.donationId,
		action_source: "website",
		event_source_url: input.sourceUrl,
		user_data: userData,
		custom_data: {
			currency: "IDR",
			value: input.amount,
			content_ids: [input.campaignId],
			content_name: input.campaignTitle || undefined,
			content_type: "product",
		},
	};
}

/** POSTs events to one pixel. Never throws; 5s timeout so webhooks stay fast. */
export async function sendMetaEvents(
	pixelId: string,
	accessToken: string,
	events: MetaEvent[],
	testEventCode?: string,
): Promise<{ ok: boolean; error?: string }> {
	try {
		const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				data: events,
				access_token: accessToken,
				...(testEventCode ? { test_event_code: testEventCode } : {}),
			}),
			signal: AbortSignal.timeout(5000),
		});
		if (res.ok) return { ok: true };
		const j = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
		return { ok: false, error: j?.error?.message || `HTTP ${res.status}` };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : String(e) };
	}
}
