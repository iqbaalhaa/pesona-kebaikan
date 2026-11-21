import { prisma } from "@/lib/prisma";
import { getTrackingSettings } from "@/lib/tracking-settings";
import { isBotUserAgent } from "@/lib/tracking-source";
import type { RequestTracking } from "@/lib/tracking-server";

export const EVENT_TYPES = ["VIEW", "DONATE_CLICK", "CHECKOUT"] as const;
export type CampaignEventType = (typeof EVENT_TYPES)[number];

// Records one funnel event. Skips bots, visitors without the pk_vid cookie, and
// repeats by the same visitor inside the dedup window (admin setting, default
// 30 min) so refreshes don't inflate the counts. Never throws.
// ponytail: visitorId is client-generated, so a script could forge views; good
// enough for funnel stats, add rate limiting if counts start looking abused.
export async function recordCampaignEvent(input: {
	campaignId: string;
	fundraiserId?: string | null;
	type: CampaignEventType;
	tracking: RequestTracking;
}): Promise<"recorded" | "skipped"> {
	try {
		const { tracking } = input;
		if (!tracking.visitorId || isBotUserAgent(tracking.ua)) return "skipped";
		const settings = await getTrackingSettings();
		if (!settings.statsEnabled) return "skipped";

		if (settings.viewDedupMinutes > 0) {
			const since = new Date(Date.now() - settings.viewDedupMinutes * 60_000);
			const recent = await prisma.campaignEvent.findFirst({
				where: {
					visitorId: tracking.visitorId,
					campaignId: input.campaignId,
					type: input.type,
					createdAt: { gte: since },
				},
				select: { id: true },
			});
			if (recent) return "skipped";
		}

		await prisma.campaignEvent.create({
			data: {
				campaignId: input.campaignId,
				fundraiserId: input.fundraiserId || null,
				type: input.type,
				visitorId: tracking.visitorId,
				source: tracking.attribution.source,
				utmCampaign: tracking.attribution.utmCampaign ?? null,
				utmContent: tracking.attribution.utmContent ?? null,
			},
		});
		return "recorded";
	} catch (e) {
		console.error("recordCampaignEvent failed:", e);
		return "skipped";
	}
}
