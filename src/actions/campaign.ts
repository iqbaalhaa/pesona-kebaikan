"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, uploadCoverFile } from "@/actions/upload";
import { CampaignStatus, NotificationType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { CATEGORY_TITLE } from "@/lib/constants";
import { validateCampaignType } from "@/lib/campaignValidation";
import { notifyAdmins } from "@/actions/notification";


const QUICK_DONATION_SLUG = "donasi-cepat";

export async function createCampaign(formData: FormData) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const slugify = (value: string) =>
			(value || "")
				.toLowerCase()
				.trim()
				.replace(/[^\w\s]/g, "")
				.replace(/[\s_]+/g, "");

		const status = (formData.get("status") as CampaignStatus) || "PENDING";

		const rawTitle = (formData.get("title") as string) || "";
		const rawSlug = (formData.get("slug") as string) || "";

		if (status !== "DRAFT" && !rawTitle.trim() && !rawSlug.trim()) {
			return {
				success: false,
				error: "Judul dan link campaign wajib diisi",
			};
		}

		let title = rawTitle;
		if (status === "DRAFT" && !title) {
			title = "Draft Campaign";
		}

		let slug = rawSlug;

		if (slug && slug.trim()) {
			slug = slugify(slug);
			const existing = await prisma.campaign.findUnique({
				where: { slug },
				select: { id: true },
			});

			if (existing) {
				return {
					success: false,
					error:
						"URL publik sudah digunakan campaign lain, silakan pilih URL lain",
				};
			}
		} else {
			slug = slugify(title);
			slug = `${slug}-${Date.now().toString().slice(-4)}`;
		}

		const categoryKey = formData.get("category") as string;
		const type = formData.get("type") as string;

		const validation = validateCampaignType(type, categoryKey);
		if (!validation.valid) {
			return { success: false, error: validation.error };
		}

		const targetStr = formData.get("target") as string;
		const duration = formData.get("duration") as string;
		let story = formData.get("story") as string;

		if (status !== "DRAFT") {
			if (!story || story.trim().length < 50) {
				return {
					success: false,
					error: "Cerita campaign harus diisi minimal 50 karakter",
				};
			}
		}

		if (status === "DRAFT" && !story) {
			story = "";
		}

		const phone = formData.get("phone") as string;

		const metadataStr = formData.get("metadata") as string;
		let metadata = undefined;
		if (metadataStr) {
			try {
				metadata = JSON.parse(metadataStr);
			} catch (e) {
				console.error("Failed to parse metadata", e);
			}
		}

		const resumeMedisFile = formData.get("resume_medis") as File;
		const suratRsFile = formData.get("surat_rs") as File;
		let medicalDocs = (metadata as any)?.medicalDocs || {};

		const uploadPromises: Promise<{
			type: "resume" | "exam" | "cover";
			res: any;
		}>[] = [];

		if (resumeMedisFile && (resumeMedisFile as any).size > 0) {
			const fd = new FormData();
			fd.append("file", resumeMedisFile);
			uploadPromises.push(
				uploadFile(fd).then((res) => ({ type: "resume", res })),
			);
		}

		if (suratRsFile && (suratRsFile as any).size > 0) {
			const fd = new FormData();
			fd.append("file", suratRsFile);
			uploadPromises.push(
				uploadFile(fd).then((res) => ({ type: "exam", res })),
			);
		}

		const coverFile = formData.get("cover") as File;
		if (coverFile && coverFile.size > 0) {
			const fd = new FormData();
			fd.append("file", coverFile);
			uploadPromises.push(
				uploadCoverFile(fd).then((res) => ({ type: "cover", res })),
			);
		}

		const results = await Promise.all(uploadPromises);

		let coverUrl = (formData.get("coverUrl") as string) || "";

		for (const result of results) {
			if (result.res.success && result.res.url) {
				if (result.type === "resume")
					medicalDocs = { ...medicalDocs, resume_medis: result.res.url };
				if (result.type === "exam")
					medicalDocs = { ...medicalDocs, surat_rs: result.res.url };
				if (result.type === "cover") coverUrl = result.res.url;
			} else {
				if (result.type === "cover") {
					return {
						success: false,
						error: result.res.error || "Gagal mengupload cover image",
					};
				}
			}
		}

		if (Object.keys(medicalDocs || {}).length > 0) {
			metadata = { ...(metadata || {}), medicalDocs };
		}

		let category = await prisma.campaignCategory.findUnique({
			where: { slug: categoryKey },
		});

		if (!category) {
			const categoryName = CATEGORY_TITLE[categoryKey] || "Lainnya";
			category = await prisma.campaignCategory.findUnique({
				where: { name: categoryName },
			});

			if (category) {
				if (!category.slug) {
					category = await prisma.campaignCategory.update({
						where: { id: category.id },
						data: { slug: categoryKey },
					});
				}
			} else {
				category = await prisma.campaignCategory.create({
					data: {
						name: categoryName,
						slug: categoryKey,
					},
				});
			}
		}

		const target = parseFloat(targetStr.replace(/[^\d]/g, "")) || 0;

		const start = new Date();
		let end: Date | null = null;
		if (duration !== "unlimited") {
			end = new Date();
			if (duration && duration !== "custom") {
				end.setDate(end.getDate() + parseInt(duration));
			} else {
				end.setDate(end.getDate() + 30);
			}
		}

		const campaign = await prisma.campaign.create({
			data: {
				title,
				slug,
				story,
				target,
				start,
				end,
				phone,
				categoryId: category.id,
				createdById: session.user.id,
				status,
				...(metadata ? { metadata } : {}),
				media: coverUrl
					? {
							create: {
								type: "IMAGE",
								url: coverUrl,
								isThumbnail: true,
							},
						}
					: undefined,
			},
		});

		revalidatePath("/galang-dana");
		revalidatePath("/admin/campaign");

		// DRAFT is just an autosave, nothing to review yet — only PENDING is an
		// actual submission waiting on admin/staff approval.
		if (status === "PENDING") {
			await notifyAdmins(
				"Pengajuan Campaign Baru",
				`Campaign baru "${title}" menunggu verifikasi.`,
				NotificationType.NEW_CAMPAIGN,
				{ permission: "APPROVE_CAMPAIGNS" },
			);
		}

		return { success: true, campaignId: campaign.id };
	} catch (error: any) {
		console.error("Create campaign error:", error);
		return {
			success: false,
			error: error.message || "Failed to create campaign",
		};
	}
}

export async function getMyCampaigns(
	page: number = 1,
	limit: number = 9,
	filter: string = "all",
	search: string = "",
) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}
	return getCampaigns(page, limit, filter, search, session.user.id);
}

export async function getCampaigns(
	page: number = 1,
	limit: number = 9,
	filter: string = "all",
	search: string = "",
	userId?: string,
	categoryName?: string,
	isEmergency?: boolean,
	isVerified?: boolean,
	sortBy: string = "newest",
	includeQuickDonation: boolean = false,
	startDate?: string,
	endDate?: string,
	provinceId?: string,
) {
	const skip = (page - 1) * limit;

	const where: Prisma.CampaignWhereInput = {};

	if (filter !== "all") {
		if (filter === "ended") {
			where.status = "COMPLETED";
		} else {
			where.status = filter.toUpperCase() as CampaignStatus;
		}
	}

	if (!includeQuickDonation) {
		where.NOT = {
			slug: QUICK_DONATION_SLUG,
		};
		// Only apply end-date filter for public listings, not for owner's own campaigns.
		// A null end means an unlimited-duration campaign — always keep those.
		if (!userId) {
			where.AND = [{ OR: [{ end: null }, { end: { gte: new Date() } }] }];
		}
	}

	if (search) {
		where.OR = [
			{ title: { contains: search, mode: "insensitive" } },
			{ createdBy: { name: { contains: search, mode: "insensitive" } } },
			{ category: { name: { contains: search, mode: "insensitive" } } },
		];
	}

	if (userId) {
		where.createdById = userId;
	}

	if (categoryName && categoryName !== "Semua") {
		where.category = { is: { name: categoryName } };
	}

	if (isEmergency) {
		where.isEmergency = true;
	}

	if (isVerified) {
		where.verifiedAt = { not: null };
	}

	if (startDate || endDate) {
		const range: any = {};
		if (startDate) {
			range.gte = new Date(startDate);
		}
		if (endDate) {
			range.lte = new Date(endDate);
		}
		where.createdAt = range;
	}

	if (provinceId) {
		where.createdBy = { provinceId };
	}

	let orderBy: Prisma.CampaignOrderByWithRelationInput = { createdAt: "desc" };

	if (sortBy === "ending_soon") {
		orderBy = { end: "asc" };
	} else if (sortBy === "most_collected") {
		orderBy = { donations: { _count: "desc" } };
	} else if (sortBy === "oldest") {
		orderBy = { createdAt: "asc" };
	} else if (sortBy === "newest") {
		orderBy = { createdAt: "desc" };
	}

	try {
		let fundraisers: any[] = [];
		let totalFundraisers = 0;

		if (!userId) {
			const frWhere: any = {};
			if (search) {
				frWhere.title = { contains: search, mode: "insensitive" };
			}
			if (provinceId) {
				frWhere.createdBy = { provinceId };
			}

			[fundraisers, totalFundraisers] = await Promise.all([
				prisma.fundraiser.findMany({
					where: frWhere,
					take: limit,
					orderBy: { createdAt: "desc" },
					include: {
						campaign: {
							include: {
								category: true,
								createdBy: true,
								media: true,
								donations: true
							}
						},
						createdBy: true,
						donations: true
					}
				}),
				prisma.fundraiser.count({ where: frWhere })
			]);
		}

		const [campaigns, total] = await Promise.all([
			prisma.campaign.findMany({
				where,
				skip,
				take: limit,
				orderBy,
				include: {
					category: true,
					createdBy: true,
					donations: {
						select: {
							amount: true,
							status: true,
						},
					},
					media: {
						select: {
							url: true,
							isThumbnail: true,
						},
					},
				},
			}),
			prisma.campaign.count({ where }),
		]);

		const now = new Date();
		const expiredIds = campaigns
			.filter((c) => c.end && new Date(c.end).getTime() < now.getTime())
			.filter((c) => c.status !== "COMPLETED")
			.map((c) => c.id);
		if (expiredIds.length > 0) {
			await prisma.campaign.updateMany({
				where: { id: { in: expiredIds } },
				data: { status: "COMPLETED" },
			});
		}

		const campaignRows = campaigns.map((c) => {
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

			const thumbnail =
				c.media.find((m) => m.isThumbnail)?.url || "";

			const slugKey =
				c.category.slug ||
				Object.entries(CATEGORY_TITLE).find(
					([, name]) => name === c.category.name,
				)?.[0];

			return {
				id: c.id,
				slug: c.slug || c.id,
				title: c.title,
				category: c.category.name,
				type:
					c.category.name === "Bantuan Medis & Kesehatan" ? "sakit" : "lainnya",
				ownerName: c.createdBy.name || "Unknown",
				target: Number(c.target),
				collected,
				donors: validDonations.length,
				status: c.status.toLowerCase(),
				updatedAt: new Date(c.updatedAt).toISOString(),
				createdAt: new Date(c.createdAt).toISOString(),
				categorySlug: slugKey || "lainnya",
				daysLeft: daysLeft > 0 ? daysLeft : 0,
				isVerified: !!c.verifiedAt,
				verifiedAt: c.verifiedAt ? new Date(c.verifiedAt).toISOString() : null,
				verifiedAs: (c.createdBy as any).verifiedAs || null,
				isEmergency: c.isEmergency,
				isUnlimited: !c.end,
				thumbnail,
				metadata: c.metadata,
				description: c.story,
			};
		});

		const fundraiserRows = fundraisers.map((fr) => {
			const c = fr.campaign;
			if (!c) return null;

			const validDonations = fr.donations.filter((d: any) =>
				["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
			);
			const collected = validDonations.reduce(
				(acc: number, d: any) => acc + Number(d.amount),
				0,
			);

			let daysLeft = 0;
			if (c.end) {
				daysLeft = Math.ceil(
					(new Date(c.end).getTime() - new Date().getTime()) /
						(1000 * 60 * 60 * 24),
				);
			}

			const thumbnail =
				c.media.find((m: any) => m.isThumbnail)?.url || "";

			const slugKey =
				c.category.slug ||
				Object.entries(CATEGORY_TITLE).find(
					([, name]) => name === c.category.name,
				)?.[0];

			return {
				id: fr.id,
				slug: `fundraiser/${fr.slug}`,
				title: fr.title,
				category: c.category.name,
				type:
					c.category.name === "Bantuan Medis & Kesehatan" ? "sakit" : "lainnya",
				ownerName: fr.createdBy.name || "Fundraiser",
				target: Number(fr.target),
				collected,
				donors: validDonations.length,
				status: c.status.toLowerCase(),
				updatedAt: new Date(fr.updatedAt).toISOString(),
				createdAt: new Date(fr.createdAt).toISOString(),
				categorySlug: slugKey || "lainnya",
				daysLeft: daysLeft > 0 ? daysLeft : 0,
				isVerified: false,
				verifiedAt: null as string | null,
				verifiedAs: null as string | null,
				isEmergency: false,
				thumbnail,
				metadata: null as any,
				description: `Fundraiser untuk: ${c.title}`,
				isFundraiser: true,
				fundraiserSlug: fr.slug
			};
		}).filter(Boolean);

		let mixedRows = [...campaignRows];

		if (sortBy === "newest") {
			mixedRows.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		}

		return {
			success: true,
			data: mixedRows,
			total,
			page,
			limit,
			totalPages: Math.ceil((total + totalFundraisers) / limit),
		};
	} catch (error) {
		console.error("Get campaigns error:", error);
		return { success: false, error: "Failed to fetch campaigns" };
	}
}

export async function getCampaignBySlug(slug: string) {
	try {
		const campaign = await prisma.campaign.findUnique({
			where: { slug },
			select: { id: true },
		});

		if (!campaign) {
			return getCampaignById(slug);
		}

		return getCampaignById(campaign.id);
	} catch (error) {
		console.error("Get campaign by slug error:", error);
		return { success: false, error: "Failed to fetch campaign" };
	}
}

export async function getCampaignById(id: string) {
	try {
		const campaign = await prisma.campaign.findUnique({
			where: { id },
			include: {
				category: true,
				createdBy: true,
				media: {
					select: {
						url: true,
						isThumbnail: true,
					},
				},
				updates: {
					include: {
						media: {
							select: {
								url: true,
							},
						},
					},
					orderBy: { createdAt: "desc" },
				},
				withdrawals: {
					where: { status: "COMPLETED" },
					orderBy: { updatedAt: "desc" },
					select: {
						id: true,
						amount: true,
						notes: true,
						updatedAt: true,
					},
				},
			},
		});

		if (!campaign) {
			return { success: false, error: "Campaign not found" };
		}

		const validStatuses = ["PAID", "paid", "SETTLED", "COMPLETED"];

		const [donationStats, recentDonations] = await Promise.all([
			prisma.donation.aggregate({
				where: {
					campaignId: id,
					status: { in: validStatuses },
				},
				_sum: {
					amount: true,
					fee: true,
				},
				_count: true,
			}),
			prisma.donation.findMany({
				where: {
					campaignId: id,
					status: { in: validStatuses },
				},
				orderBy: { createdAt: "desc" },
				take: 50,
			}),
		]);

		if (
			campaign.end &&
			new Date(campaign.end).getTime() < new Date().getTime()
		) {
			if (campaign.status !== "COMPLETED") {
				await prisma.campaign.update({
					where: { id: campaign.id },
					data: { status: "COMPLETED" },
				});
				campaign.status = "COMPLETED";
			}
		}

		const collected = Number(donationStats._sum.amount) || 0;
		const totalFees = Number(donationStats._sum.fee) || 0;
		const donors = donationStats._count;

		const thumbnail =
			campaign.media.find((m) => m.isThumbnail)?.url || "";
		let daysLeft = 0;
		if (campaign.end) {
			if (campaign.status === "PENDING" && campaign.start) {
				daysLeft = Math.ceil(
					(new Date(campaign.end).getTime() -
						new Date(campaign.start).getTime()) /
						(1000 * 60 * 60 * 24),
				);
			} else {
				daysLeft = Math.ceil(
					(new Date(campaign.end).getTime() - new Date().getTime()) /
						(1000 * 60 * 60 * 24),
				);
			}
		}

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
				images: [],
			})),
		].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		let fundraisers: any[] = [];
		if ((prisma as any).fundraiser) {
			fundraisers = await (prisma as any).fundraiser.findMany({
				where: { campaignId: campaign.id },
				select: {
					id: true,
					title: true,
					slug: true,
					target: true,
					createdBy: { select: { name: true, image: true } },
				},
			});
		}

		const data = {
			id: campaign.id,
			slug: campaign.slug,
			title: campaign.title,
			category: campaign.category.name,
			categorySlug: campaign.category.slug,
			type:
				campaign.category.name === "Bantuan Medis & Kesehatan"
					? "sakit"
					: "lainnya",
			ownerId: campaign.createdById,
			ownerName: campaign.createdBy.name || "Unknown",
			ownerEmail: campaign.createdBy.email || "-",
			ownerPhone: campaign.createdBy.phone || "-",
			ownerAvatar: campaign.createdBy.image || "",
			ownerVerifiedAt: campaign.createdBy.verifiedAt
				? new Date(campaign.createdBy.verifiedAt).toISOString()
				: null,
			ownerVerifiedAs: (campaign.createdBy as any).verifiedAs || null,
			phone: campaign.phone || "-",
			target: Number(campaign.target),
			start: campaign.start ? new Date(campaign.start).toISOString() : null,
			end: campaign.end ? new Date(campaign.end).toISOString() : null,
			collected,
			totalFees,
			foundationFee: Number(campaign.foundationFee),
			donors,
			daysLeft: daysLeft > 0 ? daysLeft : 0,
			status:
				campaign.status === "COMPLETED"
					? "ended"
					: campaign.status.toLowerCase(),
			rejectionReason: campaign.rejectionReason,
			rejectedAt: campaign.rejectedAt
				? new Date(campaign.rejectedAt).toISOString()
				: null,
			metadata: campaign.metadata,
			description: campaign.story,
			createdAt: new Date(campaign.createdAt).toISOString(),
			updatedAt: new Date(campaign.updatedAt).toISOString(),
			thumbnail,
			images: campaign.media.map((m) => m.url),
			donations: recentDonations.map((d) => ({
				id: d.id,
				name: d.donorName || "#OrangBaik",
				amount: Number(d.amount),
				date: new Date(d.createdAt).toISOString(),
				comment: d.message,
			})),
			updates: timeline.map((t) => ({
				...t,
				date: new Date(t.date).toISOString(),
			})),
			fundraisers: fundraisers.map((f: any) => ({
				id: f.id,
				title: f.title,
				slug: f.slug,
				target: Number(f.target),
				creatorName: f.createdBy?.name || "Anonim",
				creatorImage: f.createdBy?.image || "",
			})),
		};

		return { success: true, data };
	} catch (error) {
		console.error("Get campaign by id error:", error);
		return { success: false, error: "Failed to fetch campaign" };
	}
}

export async function finishCampaign(campaignId: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const campaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
		});

		if (!campaign) {
			return { success: false, error: "Campaign not found" };
		}

		if (campaign.slug === QUICK_DONATION_SLUG) {
			return {
				success: false,
				error: "Quick donation campaign cannot be finished",
			};
		}

		if (
			campaign.createdById !== session.user.id &&
			session.user.role !== "ADMIN"
		) {
			return { success: false, error: "Forbidden" };
		}

		await prisma.campaign.update({
			where: { id: campaignId },
			data: { status: "COMPLETED" },
		});

		revalidatePath("/admin/campaign");
		revalidatePath(`/admin/campaign/${campaignId}`);
		if (campaign.slug) {
			revalidatePath(`/galang-dana/${campaign.slug}`);
		}
		revalidatePath("/galang-dana");
		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Finish campaign error:", error);
		return { success: false, error: "Failed to finish campaign" };
	}
}

export async function updateCampaign(id: string, formData: FormData) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const title = formData.get("title") as string;
		const slug = formData.get("slug") as string;
		const categoryKey = formData.get("category") as string;
		const targetStr = formData.get("target") as string;
		const story = formData.get("story") as string;
		const phone = formData.get("phone") as string;
		const status = formData.get("status") as CampaignStatus | null;
		const startStr = formData.get("start") as string;
		const endStr = formData.get("end") as string;

		const metadataStr = formData.get("metadata") as string;
		let metadata = undefined;
		if (metadataStr) {
			try {
				metadata = JSON.parse(metadataStr);
			} catch (e) {
				console.error("Failed to parse metadata", e);
			}
		}

		const resumeMedisFile = formData.get("resume_medis") as File;
		const suratRsFile = formData.get("surat_rs") as File;
		let medicalDocs = (metadata as any)?.medicalDocs || {};

		const uploadPromises: Promise<{
			type: "resume" | "exam" | "cover";
			res: any;
		}>[] = [];

		if (resumeMedisFile && (resumeMedisFile as any).size > 0) {
			const fd = new FormData();
			fd.append("file", resumeMedisFile);
			uploadPromises.push(
				uploadFile(fd).then((res) => ({ type: "resume", res })),
			);
		}

		if (suratRsFile && (suratRsFile as any).size > 0) {
			const fd = new FormData();
			fd.append("file", suratRsFile);
			uploadPromises.push(
				uploadFile(fd).then((res) => ({ type: "exam", res })),
			);
		}

		const coverFile = formData.get("cover") as File;
		if (coverFile && coverFile.size > 0) {
			const fd = new FormData();
			fd.append("file", coverFile);
			uploadPromises.push(
				uploadCoverFile(fd).then((res) => ({ type: "cover", res })),
			);
		}

		const results = await Promise.all(uploadPromises);
		let coverUploadRes: any = null;

		for (const result of results) {
			if (result.res.success && result.res.url) {
				if (result.type === "resume")
					medicalDocs = { ...medicalDocs, resume_medis: result.res.url };
				if (result.type === "exam")
					medicalDocs = { ...medicalDocs, surat_rs: result.res.url };
				if (result.type === "cover") coverUploadRes = result.res;
			}
		}

		if (Object.keys(medicalDocs || {}).length > 0) {
			metadata = { ...(metadata || {}), medicalDocs };
		}

		const existing = await prisma.campaign.findUnique({
			where: { id },
			select: { metadata: true, slug: true },
		});

		const target = parseFloat(targetStr?.replace(/[^\d]/g, "") || "0") || 0;

		let category = await prisma.campaignCategory.findUnique({
			where: { slug: categoryKey },
		});

		if (!category) {
			category = await prisma.campaignCategory.findFirst({
				where: { name: CATEGORY_TITLE[categoryKey] || categoryKey },
			});
		}

		if (!category) {
			category = await prisma.campaignCategory.findFirst({
				where: { name: "Lainnya" },
			});
		}

		if (!category) {
			return { success: false, error: "Invalid category" };
		}

		const coverUrlDirect = formData.get("coverUrl") as string;
		if (coverUrlDirect) {
			await prisma.campaignMedia.updateMany({
				where: { campaignId: id },
				data: { isThumbnail: false },
			});
			await prisma.campaignMedia.create({
				data: {
					campaignId: id,
					type: "IMAGE",
					url: coverUrlDirect,
					isThumbnail: true,
				},
			});
		} else if (coverUploadRes && coverUploadRes.success && coverUploadRes.url) {
			await prisma.campaignMedia.updateMany({
				where: { campaignId: id },
				data: { isThumbnail: false },
			});

			await prisma.campaignMedia.create({
				data: {
					campaignId: id,
					type: "IMAGE",
					url: coverUploadRes.url,
					isThumbnail: true,
				},
			});
		}

		let mergedMetadata = metadata;
		if (
			metadata &&
			existing?.metadata &&
			typeof existing.metadata === "object"
		) {
			mergedMetadata = { ...(existing.metadata as any), ...(metadata as any) };
		}

		await prisma.campaign.update({
			where: { id },
			data: {
				title,
				slug,
				story,
				target,
				phone,
				start: startStr ? new Date(startStr) : undefined,
				end: endStr ? new Date(endStr) : undefined,
				categoryId: category.id,
				...(mergedMetadata ? { metadata: mergedMetadata } : {}),
				...(status ? { status } : {}),
			},
		});

		revalidatePath("/admin/campaign");
		revalidatePath(`/admin/campaign/${id}`);
		revalidatePath(
			`/campaign/${slug || existing?.metadata ? (existing as any).slug : ""}`,
		);
		revalidatePath("/");

		return { success: true };
	} catch (error: any) {
		console.error("Update campaign error:", error);
		return {
			success: false,
			error: error.message || "Failed to update campaign",
		};
	}
}

export async function updateCampaignStory(
	id: string,
	title: string,
	story: string,
	cta?: string,
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const campaign = await prisma.campaign.findUnique({
			where: { id },
			select: { metadata: true, category: true },
		});

		if (!campaign) {
			return { success: false, error: "Campaign not found" };
		}

		let metadata: any = campaign.metadata || {};
		if (cta !== undefined) {
			const isSakit =
				campaign.category.name === "Bantuan Medis & Kesehatan" ||
				metadata.type === "sakit";

			if (isSakit) {
				metadata = { ...metadata, cta };
			} else {
				metadata = { ...metadata, ctaOther: cta };
			}
		}

		await prisma.campaign.update({
			where: { id },
			data: {
				title,
				story,
				metadata,
			},
		});

		revalidatePath("/admin/campaign");
		revalidatePath(`/admin/campaign/${id}`);
		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Update campaign story error:", error);
		return { success: false, error: "Failed to update campaign story" };
	}
}

export async function deleteCampaign(id: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const campaign = await prisma.campaign.findUnique({
			where: { id },
			select: { status: true },
		});

		if (!campaign) {
			return { success: false, error: "Campaign not found" };
		}

		if (["ACTIVE", "COMPLETED"].includes(campaign.status)) {
			return {
				success: false,
				error: "Campaign aktif atau sudah selesai tidak dapat dihapus",
			};
		}

		await prisma.donation.deleteMany({
			where: { campaignId: id },
		});

		await prisma.campaign.delete({ where: { id } });
		revalidatePath("/admin/campaign");
		revalidatePath("/galang-dana");
		return { success: true };
	} catch (error) {
		console.error("Delete campaign error:", error);
		return { success: false, error: "Failed to delete campaign" };
	}
}
