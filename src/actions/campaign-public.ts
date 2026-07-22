"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { CATEGORY_TITLE } from "@/lib/constants";

const QUICK_DONATION_SLUG = "donasi-cepat";

type CampaignWithRelations = Prisma.CampaignGetPayload<{
	include: {
		category: true;
		createdBy: true;
		donations: true;
		media: true;
	};
}>;

function mapCampaignsToTypes(campaigns: CampaignWithRelations[]) {
	return campaigns.map((c) => {
		const validDonations = c.donations.filter((d) =>
			["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
		);
		const collected = validDonations.reduce(
			(acc, d) => acc + Number(d.amount),
			0,
		);
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
			organizerVerifiedAs: (c.createdBy as any).verifiedAs || null,
			categorySlug: slugKey || undefined,
			category: c.category.name,
			cover: c.media.find((m) => m.isThumbnail)?.url || c.media[0]?.url || "",
			target: Number(c.target),
			collected,
			donors: validDonations.length,
			daysLeft: daysLeft > 0 ? daysLeft : 0,
			tag: c.createdBy.verifiedAt
				? (c.createdBy as any).verifiedAs === "organization"
					? "ORG"
					: "PER"
				: undefined,
			slug: c.slug || c.id,
			isEmergency: c.isEmergency,
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
			name: d.isAnonymous ? "Hamba Allah" : d.donorName,
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
				end: { gte: now },
				slug: { not: QUICK_DONATION_SLUG },
				OR: [
					{ isEmergency: true },
					{ end: { lte: in14Days } },
				],
			},
			orderBy: [{ isEmergency: "desc" }, { end: "asc" }],
			take: limit,
			include: {
				category: true,
				createdBy: true,
				donations: true,
				media: true,
			},
		});

		return {
			success: true,
			data: mapCampaignsToTypes(campaigns),
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
				end: { gte: new Date() },
				slug: { not: QUICK_DONATION_SLUG },
			},
			orderBy: { createdAt: "desc" },
			take: limit * 2,
			include: {
				category: true,
				createdBy: true,
				donations: true,
				media: true,
			},
		});

		const sorted = campaigns
			.sort((a, b) => {
				const validA = a.donations.filter((d) =>
					["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
				).length;
				const validB = b.donations.filter((d) =>
					["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
				).length;
				return validB - validA;
			})
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
				end: { gte: new Date() },
				slug: { not: QUICK_DONATION_SLUG },
			},
			orderBy: { createdAt: "desc" },
			take: limit * 5,
			include: {
				category: true,
				createdBy: true,
				donations: true,
				media: true,
			},
		});

		let picks = campaigns.filter((c) => {
			const m: any = (c as any).metadata || {};
			return m?.featured === true || m?.featured === "true";
		});

		if (picks.length > 0) {
			picks = picks
				.map((c) => {
					const m: any = (c as any).metadata || {};
					const order =
						typeof m?.featuredOrder === "number"
							? m.featuredOrder
							: parseInt(m?.featuredOrder || "0", 10) || 0;
					return { c, order };
				})
				.sort((a, b) => a.order - b.order)
				.map((x) => x.c)
				.slice(0, limit);
		} else {
			picks = campaigns
				.sort((a, b) => {
					const validA = a.donations.filter((d) =>
						["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
					).length;
					const validB = b.donations.filter((d) =>
						["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
					).length;
					return validB - validA;
				})
				.slice(0, limit);
		}

		return {
			success: true,
			data: mapCampaignsToTypes(picks),
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
				end: { gte: new Date() },
				slug: { not: QUICK_DONATION_SLUG },
			},
			orderBy: { createdAt: "desc" },
			take: limit,
			include: {
				category: true,
				createdBy: true,
				donations: true,
				media: true,
			},
		});

		return {
			success: true,
			data: mapCampaignsToTypes(campaigns),
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
			include: {
				category: true,
				createdBy: true,
				donations: true,
				media: true,
			},
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
				include: {
					category: true,
					createdBy: true,
					donations: true,
					media: true,
				},
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
