"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCampaignFunnel, getCampaignRanking, parseRange } from "@/lib/campaign-stats";
import { getTrackingSettings } from "@/lib/tracking-settings";

/** Funnel for one campaign: its owner or an ADMIN. */
export async function getCampaignStats(
	campaignId: string,
	range: { from?: string; to?: string; fundraiserId?: string | null } = {},
) {
	const session = await auth();
	if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };
	if (typeof campaignId !== "string" || campaignId.length > 40) {
		return { success: false as const, error: "Campaign tidak ditemukan" };
	}

	const campaign = await prisma.campaign.findUnique({
		where: { id: campaignId },
		select: { id: true, createdById: true, fundraisers: { select: { id: true, title: true } } },
	});
	if (!campaign) return { success: false as const, error: "Campaign tidak ditemukan" };
	const isAdmin = session.user.role === "ADMIN";
	if (!isAdmin && campaign.createdById !== session.user.id) {
		return { success: false as const, error: "Unauthorized" };
	}

	const settings = await getTrackingSettings();
	const { from, to, fromStr, toStr } = parseRange(range.from, range.to);
	const fundraiserId = campaign.fundraisers.some((f) => f.id === range.fundraiserId) ? range.fundraiserId : null;
	try {
		const funnel = await getCampaignFunnel({
			campaignId,
			fundraiserId,
			from,
			to,
			withSources: isAdmin || settings.ownerSourcesEnabled,
		});
		return {
			success: true as const,
			data: { ...funnel, from: fromStr, to: toStr, fundraisers: campaign.fundraisers, trackingEnabled: settings.statsEnabled },
		};
	} catch (e) {
		console.error("getCampaignStats failed:", e);
		return { success: false as const, error: "Gagal memuat statistik" };
	}
}

/** Ranking of all campaigns in a range (ADMIN only). */
export async function getCampaignStatsRanking(range: { from?: string; to?: string; source?: string } = {}) {
	const session = await auth();
	if (session?.user?.role !== "ADMIN") return { success: false as const, error: "Unauthorized" };
	const { from, to, fromStr, toStr } = parseRange(range.from, range.to);
	const source = typeof range.source === "string" ? range.source.slice(0, 30) : undefined;
	try {
		const rows = await getCampaignRanking({ from, to, source });
		return { success: true as const, data: { rows, from: fromStr, to: toStr } };
	} catch (e) {
		console.error("getCampaignStatsRanking failed:", e);
		return { success: false as const, error: "Gagal memuat statistik" };
	}
}
