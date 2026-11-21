import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { createNotification } from "@/actions/notification";
import { buildPurchaseEvent, sendMetaEvents } from "@/lib/meta-capi";
import { PIXEL_ID_RE, activeCampaignPixelId, getTrackingSettings, saveCapiResult } from "@/lib/tracking-settings";
import type { DonationTracking } from "@/lib/tracking-server";

export const PAID_STATUSES = ["PAID", "SETTLED"];

const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL || "https://pesonakebaikan.com").replace(/\/$/, "");

/**
 * Single place a donation's payment status changes (DOKU webhook, status
 * polling). Compare-and-set on the previous status, so a re-sent webhook or a
 * webhook racing the poller only runs the side effects once: donor
 * notification + Meta CAPI Purchase, both only on the first move into PAID/SETTLED.
 */
export async function applyDonationStatus(donationId: string, status: string) {
	const prev = await prisma.donation.findUnique({
		where: { id: donationId },
		select: {
			id: true,
			status: true,
			amount: true,
			donorPhone: true,
			userId: true,
			tracking: true,
			createdAt: true,
			campaign: {
				select: {
					id: true,
					slug: true,
					title: true,
					metaPixelId: true,
					metaCapiToken: true,
					metaPixelDisabled: true,
				},
			},
		},
	});
	if (!prev || prev.status === status) return { changed: false, becamePaid: false };

	const { count } = await prisma.donation.updateMany({
		where: { id: donationId, status: prev.status },
		data: { status },
	});
	if (count === 0) return { changed: false, becamePaid: false };

	const becamePaid = PAID_STATUSES.includes(status) && !PAID_STATUSES.includes(prev.status);
	if (becamePaid) {
		await Promise.allSettled([notifyDonor(prev), sendPurchase(prev)]);
	}
	return { changed: true, becamePaid };
}

type SettledDonation = {
	id: string;
	amount: unknown;
	donorPhone: string | null;
	userId: string | null;
	tracking: unknown;
	campaign: {
		id: string;
		slug: string | null;
		title: string;
		metaPixelId: string | null;
		metaCapiToken: string | null;
		metaPixelDisabled: boolean;
	};
};

async function notifyDonor(d: SettledDonation) {
	let userId = d.userId;
	if (!userId && d.donorPhone) {
		const byPhone = await prisma.user.findUnique({
			where: { phone: d.donorPhone },
			select: { id: true },
		});
		userId = byPhone?.id ?? null;
	}
	if (!userId) return;
	const amountNum = Number(d.amount);
	const amountStr = isFinite(amountNum) ? amountNum.toLocaleString("id-ID") : `${d.amount}`;
	await createNotification(
		userId,
		"Donasi Berhasil",
		`Terima kasih. Donasi Rp ${amountStr} ke ${d.campaign.title || "Campaign"} telah berhasil.`,
		NotificationType.KABAR,
	);
}

async function sendPurchase(d: SettledDonation) {
	const s = await getTrackingSettings();
	const targets: { pixelId: string; token: string; testCode?: string }[] = [];
	if (s.capiEnabled && PIXEL_ID_RE.test(s.pixelId) && s.capiToken)
		targets.push({ pixelId: s.pixelId, token: s.capiToken, testCode: s.testEventCode || undefined });
	const ownerPixel = activeCampaignPixelId(d.campaign, s);
	if (ownerPixel && d.campaign.metaCapiToken && ownerPixel !== s.pixelId) {
		targets.push({ pixelId: ownerPixel, token: d.campaign.metaCapiToken });
	}
	if (targets.length === 0) return;

	const tracking = (d.tracking || {}) as DonationTracking;
	let email: string | null = null;
	if (d.userId) {
		const u = await prisma.user.findUnique({ where: { id: d.userId }, select: { email: true } });
		email = u?.email ?? null;
	}
	const event = buildPurchaseEvent({
		donationId: d.id,
		amount: Number(d.amount),
		campaignId: d.campaign.id,
		campaignTitle: d.campaign.title,
		sourceUrl: tracking.url || `${APP_ORIGIN}/donasi/${d.campaign.slug || d.campaign.id}`,
		phone: d.donorPhone,
		email,
		externalId: d.userId || tracking.visitorId || null,
		tracking,
	});
	const results = await Promise.all(
		targets.map((t) => sendMetaEvents(t.pixelId, t.token, [event], t.testCode)),
	);
	await Promise.all(
		results.map((r, i) => {
			if (!r.ok) console.error(`[Meta CAPI] pixel ${targets[i].pixelId} failed: ${r.error}`);
			// Only Pesona's own pixel is reported in /admin/settings.
			if (targets[i].pixelId !== s.pixelId) return;
			return saveCapiResult({ event: "Purchase", eventId: d.id, ok: r.ok, error: r.error, test: !!targets[i].testCode });
		}),
	);
}
