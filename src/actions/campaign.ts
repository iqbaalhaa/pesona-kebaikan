"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/actions/upload";
import { CampaignStatus, Prisma, NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { CATEGORY_TITLE } from "@/lib/constants";
import { createNotification } from "@/actions/notification";

const QUICK_DONATION_SLUG = "donasi-cepat";

export async function createCampaign(formData: FormData) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const status = (formData.get("status") as CampaignStatus) || "PENDING";

		let title = formData.get("title") as string;
		if (status === "DRAFT" && !title) {
			title = "Draft Campaign";
		}

		let slug = formData.get("slug") as string;

		if (!slug) {
			slug = title
				.toLowerCase()
				.trim()
				.replace(/[^\w\s-]/g, "")
				.replace(/[\s_-]+/g, "-")
				.replace(/^-+|-+$/g, "");

			// Add random suffix to ensure uniqueness
			slug = `${slug}-${Date.now().toString().slice(-4)}`;
		}

		const categoryKey = formData.get("category") as string;
		// const type = formData.get("type") as string; // 'sakit' or 'lainnya'
		const targetStr = formData.get("target") as string;
		const duration = formData.get("duration") as string;
		let story = formData.get("story") as string;

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

		// File upload
		const coverFile = formData.get("cover") as File;
		let coverUrl = "";

		if (coverFile && coverFile.size > 0) {
			const uploadFormData = new FormData();
			uploadFormData.append("file", coverFile);
			const uploadRes = await uploadFile(uploadFormData);

			if (uploadRes.success && uploadRes.url) {
				coverUrl = uploadRes.url;
			} else {
				return { success: false, error: "Failed to upload cover image" };
			}
		}

		// Category
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

		// Target amount
		const target = parseFloat(targetStr.replace(/[^\d]/g, "")) || 0;

		// Dates
		const start = new Date();
		const end = new Date();
		if (duration && duration !== "custom") {
			end.setDate(end.getDate() + parseInt(duration));
		} else {
			// Default 30 days if custom or not specified
			end.setDate(end.getDate() + 30);
		}

		// Create Campaign
		// status is already defined above

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
		// Map 'ended' to COMPLETED for filter
		if (filter === "ended") {
			where.status = "COMPLETED";
		} else {
			where.status = filter.toUpperCase() as CampaignStatus;
		}
	}

	// Exclude quick donation campaign from public listing unless requested
	if (!includeQuickDonation) {
		where.NOT = {
			slug: QUICK_DONATION_SLUG,
		};
		// Exclude campaigns that have already ended for public contexts
		where.end = { gte: new Date() };
	}

	if (search) {
		where.OR = [
			{ title: { contains: search, mode: "insensitive" } },
			{ createdBy: { name: { contains: search, mode: "insensitive" } } },
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
		// Show ending soonest first, but only future ones
		orderBy = { end: "asc" };
		// We might want to filter out expired ones if not handled by status
	} else if (sortBy === "most_collected") {
		// Approximate by number of donations
		orderBy = { donations: { _count: "desc" } };
	} else if (sortBy === "oldest") {
		orderBy = { createdAt: "asc" };
	} else if (sortBy === "newest") {
		orderBy = { createdAt: "desc" };
	}

	try {
		const [campaigns, total] = await Promise.all([
			prisma.campaign.findMany({
				where,
				skip,
				take: limit,
				orderBy,
				include: {
					category: true,
					createdBy: true,
					donations: true,
					media: true,
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

		// Map to simplified structure if needed, or return as is.
		// UI expects: id, title, category, type, ownerName, target, collected, donors, status, updatedAt
		const rows = campaigns.map((c) => {
			const validDonations = c.donations.filter((d) =>
				["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
			);
			const collected = validDonations.reduce(
				(acc, d) => acc + Number(d.amount),
				0,
			);
			const donors = validDonations.length;
			const thumbnail =
				c.media.find((m) => m.isThumbnail)?.url || c.media[0]?.url || "";
			const daysLeft = c.end
				? Math.ceil(
						(new Date(c.end).getTime() - new Date().getTime()) /
							(1000 * 60 * 60 * 24),
					)
				: 0;

			return {
				id: c.id,
				slug: c.slug,
				title: c.title,
				category: c.category.name,
				type:
					c.category.name === "Bantuan Medis & Kesehatan" ? "sakit" : "lainnya", // Simple heuristic
				ownerName: c.createdBy.name || "Unknown",
				target: Number(c.target),
				collected,
				donors,
				daysLeft: daysLeft > 0 ? daysLeft : 0,
				status: c.status === "COMPLETED" ? "ended" : c.status.toLowerCase(),
				updatedAt: c.updatedAt.toLocaleDateString("id-ID", {
					day: "numeric",
					month: "short",
					year: "numeric",
				}),
				thumbnail,
				isEmergency: c.isEmergency,
				verifiedAt: c.verifiedAt,
				metadata: c.metadata,
				description: c.story,
			};
		});

		return {
			success: true,
			data: rows,
			total,
			page,
			limit,
			totalPages: Math.ceil(total / limit),
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
			include: {
				category: true,
				createdBy: true,
				donations: {
					orderBy: { createdAt: "desc" },
				},
				media: true,
				updates: {
					include: { media: true },
					orderBy: { createdAt: "desc" },
				},
				withdrawals: {
					where: { status: "COMPLETED" },
					orderBy: { updatedAt: "desc" },
				},
			},
		});

		if (!campaign) {
			// Fallback to ID check if slug not found (in case slug param is actually an ID)
			return getCampaignById(slug);
		}

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

		const validDonations = campaign.donations.filter((d) =>
			["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
		);

		const collected = validDonations.reduce(
			(acc, d) => acc + Number(d.amount),
			0,
		);
		const totalFees = validDonations.reduce(
			(acc, d) => acc + (Number(d.fee) || 0),
			0,
		);
		const donors = validDonations.length;
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

		let fundraisers: {
			id: string;
			title: string;
			slug: string;
			target: any;
		}[] = [];
		if ((prisma as any).fundraiser) {
			fundraisers = await (prisma as any).fundraiser.findMany({
				where: { campaignId: campaign.id },
				select: { id: true, title: true, slug: true, target: true },
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
			ownerVerifiedAt: campaign.createdBy.verifiedAt || null,
			ownerVerifiedAs: (campaign.createdBy as any).verifiedAs || null,
			phone: campaign.phone || "-",
			target: Number(campaign.target),
			collected,
			totalFees,
			foundationFee: campaign.foundationFee,
			donors,
			daysLeft: daysLeft > 0 ? daysLeft : 0,
			status:
				campaign.status === "COMPLETED"
					? "ended"
					: campaign.status.toLowerCase(),
			description: campaign.story,
			createdAt: campaign.createdAt,
			updatedAt: campaign.updatedAt,
			thumbnail,
			images: campaign.media.map((m) => m.url),
			donations: validDonations.map((d) => ({
				id: d.id,
				name: d.donorName || "Hamba Allah",
				amount: Number(d.amount),
				date: d.createdAt,
				comment: d.message,
			})),
			updates: timeline,
			fundraisers: fundraisers.map((f) => ({
				id: f.id,
				title: f.title,
				slug: f.slug,
				target: Number(f.target),
			})),
		};

		return { success: true, data };
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
				donations: {
					orderBy: { createdAt: "desc" },
				},
				media: true,
				updates: {
					include: { media: true },
					orderBy: { createdAt: "desc" },
				},
				withdrawals: {
					where: { status: "COMPLETED" },
					orderBy: { updatedAt: "desc" },
				},
			},
		});

		if (!campaign) {
			return { success: false, error: "Campaign not found" };
		}

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

		const validDonations = campaign.donations.filter((d) =>
			["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
		);

		const collected = validDonations.reduce(
			(acc, d) => acc + Number(d.amount),
			0,
		);
		const totalFees = validDonations.reduce(
			(acc, d) => acc + (Number(d.fee) || 0),
			0,
		);
		const donors = validDonations.length;
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

		let fundraisers: {
			id: string;
			title: string;
			slug: string;
			target: any;
		}[] = [];
		if ((prisma as any).fundraiser) {
			fundraisers = await (prisma as any).fundraiser.findMany({
				where: { campaignId: campaign.id },
				select: { id: true, title: true, slug: true, target: true },
			});
		}

		const data = {
			id: campaign.id,
			slug: campaign.slug,
			title: campaign.title,
			category: campaign.category.name,
			type:
				campaign.category.name === "Bantuan Medis & Kesehatan"
					? "sakit"
					: "lainnya",
			ownerId: campaign.createdById,
			ownerName: campaign.createdBy.name || "Unknown",
			ownerEmail: campaign.createdBy.email || "-",
			ownerPhone: campaign.createdBy.phone || "-",
			ownerAvatar: campaign.createdBy.image || "",
			ownerVerifiedAt: campaign.createdBy.verifiedAt || null,
			ownerVerifiedAs: (campaign.createdBy as any).verifiedAs || null,
			phone: campaign.phone || "-",
			target: Number(campaign.target),
			start: campaign.start,
			end: campaign.end,
			collected,
			totalFees,
			foundationFee: campaign.foundationFee,
			donors,
			daysLeft: daysLeft > 0 ? daysLeft : 0,
			status:
				campaign.status === "COMPLETED"
					? "ended"
					: campaign.status.toLowerCase(),
			description: campaign.story,
			updatedAt: campaign.updatedAt,
			thumbnail,
			images: campaign.media.map((m) => m.url),
			donations: validDonations.map((d) => ({
				id: d.id,
				name: d.donorName || "Hamba Allah",
				amount: Number(d.amount),
				date: d.createdAt,
				comment: d.message,
			})),
			updates: timeline,
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

		// Allow owner or admin to finish campaign
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

export async function updateCampaignStatus(
	campaignId: string,
	status: "ACTIVE" | "REJECTED" | "COMPLETED" | "PAUSED",
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const prev = await prisma.campaign.findUnique({
			where: { id: campaignId },
			select: { createdById: true, title: true, status: true },
		});

		await prisma.campaign.update({
			where: { id: campaignId },
			data: { status },
		});

		if (status === "ACTIVE" && prev?.createdById && prev.status !== "ACTIVE") {
			await createNotification(
				prev.createdById,
				"Campaign Disetujui",
				`Campaign "${prev.title}" telah disetujui dan sekarang aktif.`,
				NotificationType.KABAR,
			);
		}

		revalidatePath("/admin/campaign");
		revalidatePath(`/admin/campaign/${campaignId}`);
		revalidatePath("/");

		return { success: true };
	} catch (error: any) {
		console.error("Update campaign status error:", error);
		return {
			success: false,
			error: error.message || "Failed to update status",
		};
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
			// Fallback to "Lainnya" if still not found
			category = await prisma.campaignCategory.findFirst({
				where: { name: "Lainnya" },
			});
		}

		if (!category) {
			return { success: false, error: "Invalid category" };
		}

		// File upload
		const coverFile = formData.get("cover") as File;
		if (coverFile && coverFile.size > 0) {
			const uploadFormData = new FormData();
			uploadFormData.append("file", coverFile);
			const uploadRes = await uploadFile(uploadFormData);

			if (uploadRes.success && uploadRes.url) {
				// Unset existing thumbnails
				await prisma.campaignMedia.updateMany({
					where: { campaignId: id },
					data: { isThumbnail: false },
				});

				// Create new thumbnail
				await prisma.campaignMedia.create({
					data: {
						campaignId: id,
						type: "IMAGE",
						url: uploadRes.url,
						isThumbnail: true,
					},
				});
			}
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
				...(metadata ? { metadata } : {}),
				...(status ? { status } : {}),
			},
		});

		revalidatePath("/admin/campaign");
		revalidatePath(`/admin/campaign/${id}`);
		revalidatePath(`/campaign/${slug}`);
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
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		await prisma.campaign.update({
			where: { id },
			data: {
				title,
				story,
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

export async function requestWithdrawal(data: {
	campaignId: string;
	amount: number;
	bankName: string;
	bankAccount: string;
	accountHolder: string;
	notes?: string;
}) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const campaign = await prisma.campaign.findUnique({
			where: { id: data.campaignId },
		});

		if (!campaign) {
			return { success: false, error: "Campaign not found" };
		}

		if (
			campaign.createdById !== session.user.id &&
			session.user.role !== "ADMIN"
		) {
			return { success: false, error: "Forbidden" };
		}

		await prisma.withdrawal.create({
			data: {
				campaignId: data.campaignId,
				amount: data.amount,
				bankName: data.bankName,
				bankAccount: data.bankAccount,
				accountHolder: data.accountHolder,
				notes: data.notes,
				status: "PENDING",
			},
		});

		revalidatePath(`/galang-dana/${campaign.slug || campaign.id}`);
		revalidatePath("/admin/pencairan");

		return { success: true };
	} catch (error) {
		console.error("Request withdrawal error:", error);
		return { success: false, error: "Failed to request withdrawal" };
	}
}

export async function deleteCampaign(id: string) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		// Delete related donations first manually since schema doesn't have cascade
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

export async function createCampaignUpdate(data: {
	campaignId: string;
	title: string;
	content: string;
	amount?: number;
	images?: string[];
}) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const campaign = await prisma.campaign.findUnique({
			where: { id: data.campaignId },
		});

		if (!campaign) return { success: false, error: "Campaign not found" };

		if (
			campaign.createdById !== session.user.id &&
			session.user.role !== "ADMIN"
		) {
			return { success: false, error: "Forbidden" };
		}

		await prisma.campaignUpdate.create({
			data: {
				campaignId: data.campaignId,
				title: data.title,
				content: data.content,
				amount: data.amount,
				media:
					data.images && data.images.length > 0
						? {
								create: data.images.map((url) => ({ url, type: "IMAGE" })),
							}
						: undefined,
			},
		});

		revalidatePath(`/galang-dana/${campaign.slug || campaign.id}`);
		return { success: true };
	} catch (error) {
		console.error("Create update error:", error);
		return { success: false, error: "Failed to create update" };
	}
}

export async function getCampaignUpdates(campaignId: string) {
	try {
		const updates = await prisma.campaignUpdate.findMany({
			where: { campaignId },
			orderBy: { createdAt: "desc" },
			include: { media: true },
		});
		return { success: true, data: updates };
	} catch (error) {
		console.error("Get updates error:", error);
		return { success: false, error: "Failed to fetch updates" };
	}
}

export async function addCampaignMedia(campaignId: string, formData: FormData) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const file = formData.get("file") as File;
		const isThumbnail = formData.get("isThumbnail") === "true";

		if (!file) {
			return { success: false, error: "No file provided" };
		}

		const uploadFormData = new FormData();
		uploadFormData.append("file", file);
		const uploadRes = await uploadFile(uploadFormData);

		if (!uploadRes.success || !uploadRes.url) {
			return { success: false, error: "Failed to upload file" };
		}

		// If isThumbnail, unset other thumbnails
		if (isThumbnail) {
			await prisma.campaignMedia.updateMany({
				where: { campaignId, isThumbnail: true },
				data: { isThumbnail: false },
			});
		}

		const media = await prisma.campaignMedia.create({
			data: {
				campaignId,
				type: "IMAGE",
				url: uploadRes.url,
				isThumbnail,
			},
		});

		revalidatePath(`/admin/campaign/${campaignId}`);
		revalidatePath(`/donasi/${campaignId}`); // Assuming slug might be same as ID or I need to find slug. Revalidating by ID might not work if path uses slug.
		// Better revalidate the path that uses it.
		// But for admin panel it is /admin/campaign/[id]

		return { success: true, data: media };
	} catch (error) {
		console.error("Add campaign media error:", error);
		return { success: false, error: "Failed to add campaign media" };
	}
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
			time: new Date(d.createdAt).toLocaleDateString("id-ID"), // Simplification
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
		const campaigns = await prisma.campaign.findMany({
			where: {
				status: "ACTIVE",
				end: {
					gte: new Date(),
				},
				slug: {
					not: QUICK_DONATION_SLUG,
				},
			},
			orderBy: {
				end: "asc",
			},
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
		// Fetch active campaigns
		const campaigns = await prisma.campaign.findMany({
			where: {
				status: "ACTIVE",
				end: {
					gte: new Date(),
				},
				slug: {
					not: QUICK_DONATION_SLUG,
				},
			},
			orderBy: {
				createdAt: "desc", // Default order if not sorted by donations
			},
			take: limit * 2, // Fetch more to sort in memory if needed
			include: {
				category: true,
				createdBy: true,
				donations: true,
				media: true,
			},
		});

		// Calculate popularity (e.g. number of donations)
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
		// Fetch active campaigns
		const campaigns = await prisma.campaign.findMany({
			where: {
				status: "ACTIVE",
				end: {
					gte: new Date(),
				},
				slug: {
					not: QUICK_DONATION_SLUG,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
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
		const daysLeft = c.end
			? Math.ceil(
					(new Date(c.end).getTime() - new Date().getTime()) /
						(1000 * 60 * 60 * 24),
				)
			: 0;
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
			cover: c.media.find((m) => m.isThumbnail)?.url || "",
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
			// Find an admin user
			const admin = await prisma.user.findFirst({
				where: { role: "ADMIN" },
			});

			if (!admin) {
				return {
					success: false,
					error: "Admin user not found to create quick donation campaign",
				};
			}

			// Find or create category
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
