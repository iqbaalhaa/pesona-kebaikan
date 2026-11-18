"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CATEGORY_TITLE } from "@/lib/constants";

const QUICK_DONATION_SLUG = "donasi-cepat";

const PAID_STATUSES = ["PAID", "paid", "SETTLED", "COMPLETED"];

// Only the columns the campaign cards need — no story HTML, no full owner row,
// no donation rows (totals come from one groupBy in withDonationStats).
const CARD_SELECT = {
	id: true,
	title: true,
	slug: true,
	status: true,
	start: true,
	end: true,
	target: true,
	isEmergency: true,
	metadata: true,
	category: { select: { name: true, slug: true } },
	createdBy: { select: { name: true, verifiedAt: true, verifiedAs: true } },
	media: { where: { isThumbnail: true }, take: 1, select: { url: true } },
} satisfies Prisma.CampaignSelect;

type CardCampaign = Prisma.CampaignGetPayload<{ select: typeof CARD_SELECT }>;
type CardWithStats = CardCampaign & { collected: number; donors: number };

async function withDonationStats(
	campaigns: CardCampaign[],
): Promise<CardWithStats[]> {
	if (campaigns.length === 0) return [];
	const stats = await prisma.donation.groupBy({
		by: ["campaignId"],
		where: {
			campaignId: { in: campaigns.map((c) => c.id) },
			status: { in: PAID_STATUSES },
		},
		_sum: { amount: true },
		_count: { _all: true },
	});
	const byId = new Map(stats.map((s) => [s.campaignId, s]));
	return campaigns.map((c) => {
		const s = byId.get(c.id);
		return {
			...c,
			collected: Number(s?._sum.amount ?? 0),
			donors: s?._count._all ?? 0,
		};
	});
}

function mapCampaignsToTypes(campaigns: CardWithStats[]) {
	return campaigns.map((c) => {
		let daysLeft = 0;
		if (c.end) {
			if (c.status === "PENDING" && c.start) {
				daysLeft = Math.ceil(
					(new Date(c.end).getTime() - new Date(c.start).getTime()) /
						(1000 * 60 * 60 * 24),
				);
			} else {
				daysLeft = Math.ceil(
					(new Date(c.end).getTime() - new Date().getTime()) /
						(1000 * 60 * 60 * 24),
				);
			}
		}
		const slugKey =
			c.category.slug ||
			Object.entries(CATEGORY_TITLE).find(
				([, name]) => name === c.category.name,
			)?.[0];

		return {
			id: c.id,
			title: c.title,
			organizer: c.createdBy.name || "Unknown",
			organizerVerifiedAt: c.createdBy.verifiedAt || null,
			organizerVerifiedAs: c.createdBy.verifiedAs || null,
			categorySlug: slugKey || undefined,
			category: c.category.name,
			cover: c.media[0]?.url || "",
			target: Number(c.target),
			collected: c.collected,
			donors: c.donors,
			daysLeft: daysLeft > 0 ? daysLeft : 0,
			tag: c.createdBy.verifiedAt
				? c.createdBy.verifiedAs === "organization"
					? "ORG"
					: "PER"
				: undefined,
			slug: c.slug || c.id,
			isEmergency: c.isEmergency,
			isUnlimited: !c.end,
		};
	});
}

export async function getLatestDonations(limit: number = 10) {
	try {
		const donations = await prisma.donation.findMany({
			where: {
				status: {
					in: ["PAID", "paid", "SETTLED", "COMPLETED"],
				},
			},
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				campaign: {
					select: { title: true },
				},
			},
		});

		const data = donations.map((d) => ({
			id: d.id,
			name: d.isAnonymous ? "#OrangBaik" : d.donorName,
			time: (() => {
				const now = Date.now();
				const diff = now - new Date(d.createdAt).getTime();
				const mins = Math.floor(diff / 60000);
				if (mins < 1) return "Baru saja";
				if (mins < 60) return `${mins} menit yang lalu`;
				const hours = Math.floor(mins / 60);
				if (hours < 24) return `${hours} jam yang lalu`;
				const days = Math.floor(hours / 24);
				if (days < 30) return `${days} hari yang lalu`;
				const months = Math.floor(days / 30);
				return `${months} bulan yang lalu`;
			})(),
			campaignTitle: d.campaign.title,
			message: d.message || "Semoga berkah",
			amiinCount: (d as any).amiinCount ?? 0,
		}));

		return { success: true, data };
	} catch (error) {
		console.error("Get latest donations error:", error);
		return { success: false, error: "Failed to fetch donations" };
	}
}

export async function getUrgentCampaigns(limit: number = 10) {
	try {
		const now = new Date();
		const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
		const campaigns = await prisma.campaign.findMany({
			where: {
				status: "ACTIVE",
				slug: { not: QUICK_DONATION_SLUG },
				AND: [
					{ OR: [{ end: null }, { end: { gte: now } }] },
					{ OR: [{ isEmergency: true }, { end: { lte: in14Days } }] },
				],
			},
			orderBy: [{ isEmergency: "desc" }, { end: "asc" }],
			take: limit,
			select: CARD_SELECT,
		});

		return {
			success: true,
			data: mapCampaignsToTypes(await withDonationStats(campaigns)),
		};
	} catch (error) {
		console.error("Get urgent campaigns error:", error);
		return { success: false, error: "Failed to fetch urgent campaigns" };
	}
}

export async function getPopularCampaigns(limit: number = 10) {
	try {
		const campaigns = await prisma.campaign.findMany({
			where: {
				status: "ACTIVE",
				OR: [{ end: null }, { end: { gte: new Date() } }],
				slug: { not: QUICK_DONATION_SLUG },
			},
			orderBy: { createdAt: "desc" },
			take: limit * 2,
			select: CARD_SELECT,
		});

		const sorted = (await withDonationStats(campaigns))
			.sort((a, b) => b.donors - a.donors)
			.slice(0, limit);

		return {
			success: true,
			data: mapCampaignsToTypes(sorted),
		};
	} catch (error) {
		console.error("Get popular campaigns error:", error);
		return { success: false, error: "Failed to fetch popular campaigns" };
	}
}

export async function getFeaturedCampaigns(limit: number = 10) {
	try {
		const campaigns = await prisma.campaign.findMany({
			where: {
				status: "ACTIVE",
				OR: [{ end: null }, { end: { gte: new Date() } }],
				slug: { not: QUICK_DONATION_SLUG },
			},
			orderBy: { createdAt: "desc" },
			take: limit * 5,
			select: CARD_SELECT,
		});

		let picks = campaigns.filter((c) => {
			const m: any = c.metadata || {};
			return m?.featured === true || m?.featured === "true";
		});

		if (picks.length > 0) {
			picks = picks
				.map((c) => {
					const m: any = c.metadata || {};
					const order =
						typeof m?.featuredOrder === "number"
							? m.featuredOrder
							: parseInt(m?.featuredOrder || "0", 10) || 0;
					return { c, order };
				})
				.sort((a, b) => a.order - b.order)
				.map((x) => x.c)
				.slice(0, limit);
			return {
				success: true,
				data: mapCampaignsToTypes(await withDonationStats(picks)),
			};
		}

		const byDonors = (await withDonationStats(campaigns))
			.sort((a, b) => b.donors - a.donors)
			.slice(0, limit);

		return {
			success: true,
			data: mapCampaignsToTypes(byDonors),
		};
	} catch (error) {
		console.error("Get featured campaigns error:", error);
		return { success: false, error: "Failed to fetch featured campaigns" };
	}
}

export async function getAllActiveCampaigns(limit: number = 50) {
	try {
		const campaigns = await prisma.campaign.findMany({
			where: {
				status: "ACTIVE",
				OR: [{ end: null }, { end: { gte: new Date() } }],
				slug: { not: QUICK_DONATION_SLUG },
			},
			orderBy: { createdAt: "desc" },
			take: limit,
			select: CARD_SELECT,
		});

		return {
			success: true,
			data: mapCampaignsToTypes(await withDonationStats(campaigns)),
		};
	} catch (error) {
		console.error("Get all active campaigns error:", error);
		return { success: false, error: "Failed to fetch campaigns" };
	}
}

export async function getQuickDonationCampaign() {
	try {
		let campaign = await prisma.campaign.findUnique({
			where: { slug: QUICK_DONATION_SLUG },
			select: { id: true },
		});

		if (!campaign) {
			const admin = await prisma.user.findFirst({
				where: { role: "ADMIN" },
			});

			if (!admin) {
				return {
					success: false,
					error: "Admin user not found to create quick donation campaign",
				};
			}

			let category = await prisma.campaignCategory.findFirst({
				where: { name: "Lainnya" },
			});

			if (!category) {
				category = await prisma.campaignCategory.create({
					data: { name: "Lainnya", slug: "lainnya" },
				});
			}

			campaign = await prisma.campaign.create({
				data: {
					title: "Donasi Cepat",
					slug: QUICK_DONATION_SLUG,
					story:
						"Campaign khusus untuk menampung donasi cepat dari halaman utama.",
					target: 1000000000,
					status: "ACTIVE",
					start: new Date(),
					categoryId: category.id,
					createdById: admin.id,
				},
				select: { id: true },
			});
		}

		return { success: true, data: campaign };
	} catch (error) {
		console.error("Get quick donation campaign error:", error);
		return { success: false, error: "Failed to fetch quick donation campaign" };
	}
}

export async function getQuickDonationCampaignId() {
	const res = await getQuickDonationCampaign();
	if (res.success && res.data) {
		return res.data.id;
	}
	return null;
}
