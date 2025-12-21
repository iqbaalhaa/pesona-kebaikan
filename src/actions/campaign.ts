"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/actions/upload";
import { CampaignStatus, Prisma } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { CATEGORY_TITLE } from "@/lib/constants";

export async function createCampaign(formData: FormData) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const title = formData.get("title") as string;
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
		const type = formData.get("type") as string; // 'sakit' or 'lainnya'
		const targetStr = formData.get("target") as string;
		const duration = formData.get("duration") as string;
		const story = formData.get("story") as string;
		const phone = formData.get("phone") as string;

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
		const categoryName = CATEGORY_TITLE[categoryKey] || "Lainnya";
		let category = await prisma.campaignCategory.findUnique({
			where: { name: categoryName },
		});

		if (!category) {
			category = await prisma.campaignCategory.create({
				data: { name: categoryName },
			});
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
				status: "PENDING", // Default status
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
	} catch (error) {
		console.error("Create campaign error:", error);
		return { success: false, error: "Failed to create campaign" };
	}
}

export async function getMyCampaigns(
	page: number = 1,
	limit: number = 9,
	filter: string = "all",
	search: string = ""
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
	categoryName?: string
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

	if (search) {
		where.OR = [
			{ title: { contains: search, mode: "insensitive" } },
			{ createdBy: { name: { contains: search, mode: "insensitive" } } },
		];
	}

	if (userId) {
		where.createdById = userId;
	}

	if (categoryName) {
		where.category = { name: categoryName };
	}

	try {
		const [campaigns, total] = await Promise.all([
			prisma.campaign.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					category: true,
					createdBy: true,
					donations: true,
					media: true,
				},
			}),
			prisma.campaign.count({ where }),
		]);

		// Map to simplified structure if needed, or return as is.
		// UI expects: id, title, category, type, ownerName, target, collected, donors, status, updatedAt
		const rows = campaigns.map((c) => {
			const collected = c.donations.reduce(
				(acc, d) => acc + Number(d.amount),
				0
			);
			const donors = c.donations.length;
			const thumbnail =
				c.media.find((m) => m.isThumbnail)?.url || c.media[0]?.url || "";
			const daysLeft = c.end
				? Math.ceil(
						(new Date(c.end).getTime() - new Date().getTime()) /
							(1000 * 60 * 60 * 24)
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
			},
		});

		if (!campaign) {
			// Fallback to ID check if slug not found (in case slug param is actually an ID)
			return getCampaignById(slug);
		}

		const collected = campaign.donations.reduce(
			(acc, d) => acc + Number(d.amount),
			0
		);
		const donors = campaign.donations.length;
		const thumbnail =
			campaign.media.find((m) => m.isThumbnail)?.url ||
			campaign.media[0]?.url ||
			"";
		const daysLeft = campaign.end
			? Math.ceil(
					(new Date(campaign.end).getTime() - new Date().getTime()) /
						(1000 * 60 * 60 * 24)
			  )
			: 0;

		const data = {
			id: campaign.id,
			slug: campaign.slug,
			title: campaign.title,
			category: campaign.category.name,
			type:
				campaign.category.name === "Bantuan Medis & Kesehatan"
					? "sakit"
					: "lainnya",
			ownerName: campaign.createdBy.name || "Unknown",
			ownerEmail: campaign.createdBy.email || "-",
			ownerPhone: campaign.createdBy.phone || "-",
			phone: campaign.phone || "-",
			target: Number(campaign.target),
			collected,
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
			donations: campaign.donations.map((d) => ({
				id: d.id,
				name: d.donorName || "Hamba Allah",
				amount: Number(d.amount),
				date: d.createdAt,
				comment: d.message,
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
			},
		});

		if (!campaign) {
			return { success: false, error: "Campaign not found" };
		}

		const collected = campaign.donations.reduce(
			(acc, d) => acc + Number(d.amount),
			0
		);
		const donors = campaign.donations.length;
		const thumbnail =
			campaign.media.find((m) => m.isThumbnail)?.url ||
			campaign.media[0]?.url ||
			"";
		const daysLeft = campaign.end
			? Math.ceil(
					(new Date(campaign.end).getTime() - new Date().getTime()) /
						(1000 * 60 * 60 * 24)
			  )
			: 0;

		const data = {
			id: campaign.id,
			slug: campaign.slug,
			title: campaign.title,
			category: campaign.category.name,
			type:
				campaign.category.name === "Bantuan Medis & Kesehatan"
					? "sakit"
					: "lainnya",
			ownerName: campaign.createdBy.name || "Unknown",
			ownerEmail: campaign.createdBy.email || "-",
			ownerPhone: campaign.createdBy.phone || "-",
			phone: campaign.phone || "-",
			target: Number(campaign.target),
			collected,
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
			donations: campaign.donations.map((d) => ({
				id: d.id,
				name: d.donorName || "Hamba Allah",
				amount: Number(d.amount),
				date: d.createdAt,
				comment: d.message,
			})),
		};

		return { success: true, data };
	} catch (error) {
		console.error("Get campaign by id error:", error);
		return { success: false, error: "Failed to fetch campaign" };
	}
}

export async function updateCampaignStatus(
	campaignId: string,
	status: "ACTIVE" | "REJECTED" | "COMPLETED"
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		await prisma.campaign.update({
			where: { id: campaignId },
			data: { status },
		});

		revalidatePath("/admin/campaign");
		revalidatePath(`/admin/campaign/${campaignId}`);
		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Update campaign status error:", error);
		return { success: false, error: "Failed to update status" };
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

		const target = parseFloat(targetStr);

		const category = await prisma.category.findFirst({
			where: { name: CATEGORY_TITLE[categoryKey] },
		});

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
				categoryId: category.id,
			},
		});

		revalidatePath("/admin/campaign");
		revalidatePath(`/admin/campaign/${id}`);
		revalidatePath(`/campaign/${slug}`);
		revalidatePath("/");

		return { success: true };
	} catch (error) {
		console.error("Update campaign error:", error);
		return { success: false, error: "Failed to update campaign" };
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
			amiinCount: 0,
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
				return b.donations.length - a.donations.length;
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

function mapCampaignsToTypes(campaigns: any[]) {
	return campaigns.map((c) => {
		const collected = c.donations.reduce(
			(acc: number, d: any) => acc + Number(d.amount),
			0
		);
		const daysLeft = c.end
			? Math.ceil(
					(new Date(c.end).getTime() - new Date().getTime()) /
						(1000 * 60 * 60 * 24)
			  )
			: 0;

		return {
			id: c.id,
			title: c.title,
			organizer: c.createdBy.name || "Unknown",
			category: c.category.name,
			cover: c.media.find((m: any) => m.isThumbnail)?.url || "",
			target: Number(c.target),
			collected,
			donors: c.donations.length,
			daysLeft: daysLeft > 0 ? daysLeft : 0,
			tag: c.category.name === "Bantuan Medis & Kesehatan" ? "VERIFIED" : "ORG",
			slug: c.slug || c.id,
		};
	});
}
