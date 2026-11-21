"use client";

import { useEffect } from "react";
import {
	ensurePixel,
	getGlobalPixelId,
	trackCampaignEvent,
	trackInitiateCheckout,
	trackPixel,
} from "@/lib/meta-pixel-client";

type Props = {
	campaignId: string;
	fundraiserId?: string | null;
	campaignTitle?: string;
	/** Owner's pixel (already checked server-side: enabled, not disabled). */
	ownerPixelId?: string | null;
	/** VIEW on the campaign page, DONATE_CLICK on the donation form page. */
	step: "VIEW" | "DONATE_CLICK";
};

// Funnel event for our own stats + the matching Meta pixel event
// (ViewContent / InitiateCheckout) to Pesona's and the owner's pixel.
export default function CampaignTracker({ campaignId, fundraiserId, campaignTitle, ownerPixelId, step }: Props) {
	useEffect(() => {
		trackCampaignEvent(campaignId, step, fundraiserId);

		let cancelled = false;
		getGlobalPixelId().then((globalId) => {
			if (cancelled) return;
			// Child effects run before TrackingInit's, so init here too (idempotent).
			if (globalId) ensurePixel(globalId);
			if (ownerPixelId) {
				ensurePixel(ownerPixelId, { autoConfig: false });
				// TrackingInit only sends PageView to Pesona's pixel.
				trackPixel([ownerPixelId], "PageView");
			}
			if (step === "DONATE_CLICK") {
				// Usually already sent on the "Donasi Sekarang" click; deduped per pixel.
				trackInitiateCheckout(campaignId, campaignTitle, [ownerPixelId]);
				return;
			}
			const params = { content_ids: [campaignId], content_name: campaignTitle, content_type: "product", currency: "IDR" };
			trackPixel([globalId, ownerPixelId], "ViewContent", params);
		});
		return () => {
			cancelled = true;
		};
	}, [campaignId, fundraiserId, campaignTitle, ownerPixelId, step]);

	return null;
}
