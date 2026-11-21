"use client";

import { ensurePixel, trackPixel } from "@/lib/meta-pixel-client";

export type ReturnStatus = "paid" | "pending" | "failed";
type Result = { status: ReturnStatus; amount?: number };

type StatusResponse =
	| {
			success: true;
			data: { status: string; amount: number; campaignId: string; pixelIds: string[] };
	  }
	| { success: false; error: string };

const POLL_MS = 5000;
const MAX_POLLS = 6; // ~30s: DOKU often redirects before its webhook lands

function firePurchaseOnce(donationId: string, amount: number, campaignId: string, pixelIds: string[]) {
	const key = `pk_purchase:${donationId}`;
	try {
		if (sessionStorage.getItem(key)) return;
		sessionStorage.setItem(key, "1");
	} catch {
		// storage blocked: Meta still dedups by eventID
	}
	pixelIds.forEach((id, i) => ensurePixel(id, { autoConfig: i === 0 }));
	trackPixel(
		pixelIds,
		"Purchase",
		{ value: amount, currency: "IDR", content_ids: [campaignId], content_type: "product" },
		donationId,
	);
}

/**
 * Back from DOKU: real status from the server (not the URL) via a plain fetch
 * (/api/donation-status — not a server action, see that route), re-checked
 * while still pending. Fires the browser Purchase once paid, with event id =
 * donation id (same as CAPI) so Meta counts the pair once. onStatus is called
 * on every known status.
 */
export async function checkDonationReturn(donationId: string, onStatus: (r: Result) => void) {
	for (let i = 0; i < MAX_POLLS; i++) {
		if (i > 0) await new Promise((r) => setTimeout(r, POLL_MS));
		let res: StatusResponse;
		try {
			const r = await fetch(`/api/donation-status?id=${encodeURIComponent(donationId)}`, { cache: "no-store" });
			res = (await r.json()) as StatusResponse;
		} catch {
			continue;
		}
		if (!res.success) return;
		const { status: raw, amount, campaignId, pixelIds } = res.data;
		const status: ReturnStatus =
			raw === "PAID" || raw === "SETTLED" ? "paid" : raw === "PENDING" ? "pending" : "failed";
		onStatus({ status, amount });
		if (status === "paid" && pixelIds.length > 0) firePurchaseOnce(donationId, amount, campaignId, pixelIds);
		if (status !== "pending") return;
	}
}
