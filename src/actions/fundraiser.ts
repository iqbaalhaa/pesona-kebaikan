"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export type CreateFundraiserInput = {
	campaignSlug: string;
	title: string;
	target: number;
	slug?: string;
};

function slugify(v: string) {
	return v
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export async function createFundraiser(
	input: CreateFundraiserInput,
	_testUserId?: string,
) {
	let userId = _testUserId;
	if (!userId) {
		const session = await auth();
		userId = session?.user?.id;
	}

	if (!userId) {
		return { success: false, error: "Harus login untuk membuat fundraiser" };
	}

	if (!input.campaignSlug) {
		console.error("[createFundraiser] Missing campaignSlug", input);
		return { success: false, error: "Slug campaign tidak valid" };
	}

	let decodedSlug = input.campaignSlug;
	try {
		decodedSlug = decodeURIComponent(input.campaignSlug);
	} catch (e) {
		console.error(
			"[createFundraiser] Failed to decode slug:",
			input.campaignSlug,
			e,
		);
		// Fallback to raw slug if decoding fails
	}

	console.log("[createFundraiser] Processing:", {
		original: input.campaignSlug,
		decoded: decodedSlug,
	});

	const campaign = await prisma.campaign.findFirst({
		where: {
			OR: [{ slug: decodedSlug }, { id: decodedSlug }],
		},
		select: { id: true, slug: true, status: true },
	});

	if (!campaign) {
		return { success: false, error: "Campaign tidak ditemukan" };
	}

	if (["PAUSED", "COMPLETED", "REJECTED"].includes(campaign.status as any)) {
		return {
			success: false,
			error: "Campaign tidak tersedia untuk fundraiser",
		};
	}

	let slug: string;
	if (input.slug && input.slug.trim()) {
		const desired = slugify(input.slug);
		const exists = await prisma.fundraiser.findUnique({
			where: { slug: desired },
		});
		if (exists) {
			return { success: false, error: "Slug sudah dipakai, pilih slug lain" };
		}
		slug = desired;
	} else {
		const base = slugify(input.title);
		slug = base;
		let idx = 1;
		while (true) {
			const exists = await prisma.fundraiser.findUnique({ where: { slug } });
			if (!exists) break;
			slug = `${base}-${idx++}`;
		}
	}

	try {
		const created = await prisma.fundraiser.create({
			data: {
				title: input.title,
				slug,
				target: input.target,
				campaignId: campaign.id,
				createdById: userId,
			},
		});

		try {
			revalidatePath(`/donasi/${campaign.slug}`);
			revalidatePath(`/donasi/fundraiser/${created.slug}`);
		} catch (e) {
			// Ignore revalidation errors (e.g. during tests)
		}

		return {
			success: true,
			data: {
				...created,
				target: Number(created.target),
			},
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error.message : "Gagal membuat fundraiser",
		};
	}
}

export async function checkFundraiserSlug(slug: string) {
	const s = slugify(slug || "");
	if (!s) {
		return {
			success: true,
			available: false,
			slug: s,
			error: "Slug tidak valid",
		};
	}
	const exists = await prisma.fundraiser.findUnique({
		where: { slug: s },
		select: { id: true },
	});
	return { success: true, available: !exists, slug: s };
}

export async function getActiveFundraisers(limit = 50) {
	try {
		const fundraisers = await prisma.fundraiser.findMany({
			take: limit,
			orderBy: { createdAt: "desc" },
			include: {
				campaign: {
					select: {
						id: true,
						title: true,
						slug: true,
						status: true,
						target: true,
						end: true,
						category: { select: { name: true } },
						media: { where: { isThumbnail: true }, take: 1 },
						donations: {
							where: { status: { in: ["PAID", "paid", "SETTLED", "COMPLETED"] } },
						},
					},
				},
				createdBy: { select: { name: true, image: true, verifiedAt: true } },
				donations: {
					where: { status: { in: ["PAID", "paid", "SETTLED", "COMPLETED"] } },
				},
			},
		});

		const data = fundraisers
			.filter((fr) => fr.campaign && fr.campaign.status === "ACTIVE")
			.map((fr) => {
				const c = fr.campaign!;
				const collected = fr.donations.reduce((acc, d) => acc + Number(d.amount), 0);
				const daysLeft = c.end
					? Math.ceil((new Date(c.end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
					: 0;
				return {
					id: fr.id,
					slug: `fundraiser/${fr.slug}`,
					title: fr.title,
					category: c.category.name,
					ownerName: fr.createdBy?.name || "Anonim",
					target: Number(fr.target),
					collected,
					donors: fr.donations.length,
					daysLeft: daysLeft > 0 ? daysLeft : 0,
					status: "active",
					updatedAt: fr.createdAt.toISOString(),
					thumbnail: c.media[0]?.url || "",
					verifiedAt: fr.createdBy?.verifiedAt || null,
					campaignTitle: c.title,
				};
			});

		return { success: true, data };
	} catch (error) {
		console.error("getActiveFundraisers error:", error);
		return { success: false, data: [] };
	}
}

export async function getFundraiserCampaign(slug: string) {
	try {
		const fr = await prisma.fundraiser.findUnique({
			where: { slug },
			include: {
				createdBy: { select: { id: true, name: true, image: true } },
				amiins: {
					include: { user: true },
					orderBy: { createdAt: "desc" },
				},
			},
		});
		if (!fr?.campaignId) {
			return { success: false, error: "Fundraiser tidak ditemukan" };
		}
		const campaign = await prisma.campaign.findUnique({
			where: { id: fr.campaignId },
			include: {
				category: true,
				createdBy: true,
				donations: { orderBy: { createdAt: "desc" } },
				media: true,
				updates: { include: { media: true }, orderBy: { createdAt: "desc" } },
				withdrawals: {
					where: { status: "COMPLETED" },
					orderBy: { updatedAt: "desc" },
				},
			},
		});
		if (!campaign) {
			return { success: false, error: "Campaign induk tidak ditemukan" };
		}
		const validDonations = campaign.donations.filter((d) =>
			["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
		);

		// Total campaign collected (all sources)
		const totalCollected = validDonations.reduce(
			(acc, d) => acc + Number(d.amount),
			0,
		);

		// Filter donations specific to this fundraiser
		const fundraiserDonations = validDonations.filter(
			(d) => d.fundraiserId === fr.id,
		);
		const fundraiserCollected = fundraiserDonations.reduce(
			(acc, d) => acc + Number(d.amount),
			0,
		);

		const donors = validDonations.length;
		const fundraiserDonors = fundraiserDonations.length;

		const thumbnail =
			campaign.media.find((m) => m.isThumbnail)?.url ||
			campaign.media[0]?.url ||
			"";
		const daysLeft = campaign.end
			? Math.ceil(
					(new Date(campaign.end).getTime() - new Date().getTime()) /
						(1000 * 60 * 60 * 24),
				)
			: 0;
		const timeline = [
			...campaign.updates.map((u) => ({
				id: u.id,
				type: "update",
				title: u.title,
				content: u.content,
				date: u.createdAt,
				amount: Number(u.amount) || 0,
				images: u.media.map((m) => m.url),
			})),
			...campaign.withdrawals.map((w) => ({
				id: w.id,
				type: "withdrawal",
				title: "Pencairan Dana",
				content: `Dana sebesar ${new Intl.NumberFormat("id-ID", {
					style: "currency",
					currency: "IDR",
					maximumFractionDigits: 0,
				}).format(Number(w.amount))} telah dicairkan. ${w.notes || ""}`,
				date: w.updatedAt,
				amount: Number(w.amount),
				images: w.proofUrl ? [w.proofUrl] : [],
			})),
		].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		return {
			success: true,
			data: {
				id: campaign.id,
				slug: campaign.slug,
				title: fr.title || campaign.title,
				category: campaign.category.name,
				categorySlug: campaign.category.slug,
				description: campaign.story,
				target: Number(fr.target ?? campaign.target),
				collected: fundraiserCollected, // Use fundraiser specific collected amount
				donors: fundraiserDonors, // Use fundraiser specific donor count
				thumbnail,
				images: campaign.media.map((m) => m.url),
				daysLeft: daysLeft > 0 ? daysLeft : 0,
				status:
					campaign.status === "COMPLETED"
						? "ended"
						: (campaign.status as string).toLowerCase(),
				ownerId: campaign.createdBy.id,
				ownerName: campaign.createdBy.name || "Penggalang",
				ownerAvatar: campaign.createdBy.image || "",
				ownerVerifiedAt: (campaign.createdBy as any).verifiedAt || null,
				ownerVerifiedAs: (campaign.createdBy as any).verifiedAs || null,
				updates: timeline,
				campaignTitle: campaign.title,
				campaignSlug: campaign.slug,
				fundraiserId: fr.id,
				fundraiserSlug: fr.slug,
				fundraiserTitle: fr.title,
				fundraiserTarget: Number(fr.target),
				fundraiserCreatorId: fr.createdBy?.id || "",
				fundraiserCreatorName: fr.createdBy?.name || "Anonim",
				fundraiserCreatorImage: fr.createdBy?.image || "",
				fundraiserPrayers: fr.amiins.map((a) => ({
					id: a.id,
					name: a.user?.name || "Hamba Allah",
					date: a.createdAt,
					comment: "",
				})),
			},
		};
	} catch (error) {
		return { success: false, error: "Gagal memuat fundraiser" };
	}
}
