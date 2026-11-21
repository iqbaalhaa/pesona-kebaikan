"use client";

import { getDonationStatus } from "@/actions/donation";
import { ensurePixel, trackPixel } from "@/lib/meta-pixel-client";

export type ReturnStatus = "paid" | "pending" | "failed";

/**
 * Back from DOKU: real status from the server (not the URL), and the browser
 * Purchase pixel event once paid. event id = donation id, the same as the CAPI
 * event, so Meta counts the pair once.
 */
export async function checkDonationReturn(
	donationId: string,
): Promise<{ status: ReturnStatus; amount?: number } | null> {
	const res = await getDonationStatus(donationId);
	if (!res.success) return null;
	const { status: raw, amount, campaignId, pixelIds } = res.data;
	const status: ReturnStatus =
		raw === "PAID" || raw === "SETTLED" ? "paid" : raw === "PENDING" ? "pending" : "failed";

	if (status === "paid" && pixelIds.length > 0) {
		pixelIds.forEach((id, i) => ensurePixel(id, { autoConfig: i === 0 }));
		trackPixel(
			pixelIds,
			"Purchase",
			{ value: amount, currency: "IDR", content_ids: [campaignId], content_type: "product" },
			donationId,
		);
	}
	return { status, amount };
}
