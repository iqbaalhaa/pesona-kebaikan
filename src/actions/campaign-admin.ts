"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/actions/upload";
import { CampaignStatus, Prisma, NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notification";

const QUICK_DONATION_SLUG = "donasi-cepat";

export async function updateCampaignStatus(
	campaignId: string,
	status: "ACTIVE" | "REJECTED" | "COMPLETED" | "PAUSED",
	reason?: string,
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		if (status === "REJECTED") {
			if (!reason || reason.trim().length < 10) {
				return {
					success: false,
					error: "Alasan penolakan wajib diisi (minimal 10 karakter)",
				};
			}
		}

		const prev = await prisma.campaign.findUnique({
			where: { id: campaignId },
			select: {
				createdById: true,
				title: true,
				status: true,
				slug: true,
				start: true,
				end: true,
				metadata: true,
			},
		});

		if (status === "COMPLETED" && prev?.slug === QUICK_DONATION_SLUG) {
			return {
				success: false,
				error: "Quick donation campaign cannot be completed",
			};
		}

		const updateData: Prisma.CampaignUpdateInput = { status };

		if (status === "REJECTED") {
			updateData.rejectionReason = reason;
			updateData.rejectedAt = new Date();
			updateData.rejectedBy = { connect: { id: session.user.id } };
		}

		if (
			status === "ACTIVE" &&
			prev?.status === "COMPLETED" &&
			prev.slug !== QUICK_DONATION_SLUG
		) {
			const now = new Date();
			const dayMs = 24 * 60 * 60 * 1000;
			const extensionDays = 30;
			const newEnd = new Date(now.getTime() + extensionDays * dayMs);

			updateData.end = newEnd;

			const prevMeta = (prev as any).metadata || {};
			const existingRestartInfo = (prevMeta as any).restartInfo || {};

			let initialDurationDays = existingRestartInfo.initialDurationDays || 0;

			if (!initialDurationDays && prev.start && prev.end) {
				const diffMs =
					new Date(prev.end).getTime() - new Date(prev.start).getTime();
				initialDurationDays = Math.max(1, Math.ceil(diffMs / dayMs));
			}

			if (!initialDurationDays) {
				initialDurationDays = extensionDays;
			}

			const restartInfo = {
				initialDurationDays,
				restartCount: (existingRestartInfo.restartCount || 0) + 1,
				extensionDays,
			};

			updateData.metadata = {
				...(prevMeta || {}),
				restartInfo,
			} as any;
		}

		await prisma.campaign.update({
			where: { id: campaignId },
			data: updateData,
		});

		if (status === "ACTIVE" && prev?.createdById && prev.status !== "ACTIVE") {
			await createNotification(
				prev.createdById,
				"Campaign Disetujui",
				`Campaign "${prev.title}" telah disetujui dan sekarang aktif.`,
				NotificationType.KABAR,
			);
		}

		if (status === "REJECTED" && prev?.createdById) {
			await createNotification(
				prev.createdById,
				"Campaign Ditolak",
				`Campaign "${prev.title}" ditolak. Alasan: ${reason}`,
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

export async function updateCampaignFee(
	campaignId: string,
	foundationFee: number,
) {
	try {
		const session = await auth();
		if (!session?.user || session.user.role !== "ADMIN") {
			return { success: false, error: "Unauthorized" };
		}

		if (foundationFee < 0 || foundationFee > 100) {
			return {
				success: false,
				error: "Fee yayasan harus di antara 0% dan 100%",
			};
		}

		const updated = await prisma.campaign.update({
			where: { id: campaignId },
			data: { foundationFee },
			select: { slug: true },
		});

		revalidatePath("/admin/campaign");
		revalidatePath(`/admin/campaign/${campaignId}`);
		if (updated.slug) {
			revalidatePath(`/galang-dana/${updated.slug}`);
		}
		revalidatePath("/galang-dana");
		revalidatePath("/");

		return { success: true };
	} catch (error: any) {
		console.error("Update campaign fee error:", error);
		return {
			success: false,
			error: error.message || "Failed to update campaign fee",
		};
	}
}

export async function requestCampaignChange(
	campaignId: string,
	extraDays: number | null,
	extraTarget: number | null,
	reason?: string,
) {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const campaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
			select: { id: true, title: true, createdById: true },
		});

		if (!campaign) {
			return { success: false, error: "Campaign not found" };
		}

		if (campaign.createdById !== session.user.id) {
			return { success: false, error: "Forbidden" };
		}

		const safeExtraDays = extraDays && extraDays > 0 ? extraDays : null;
		const safeExtraTarget = extraTarget && extraTarget > 0 ? extraTarget : null;

		await prisma.campaignChangeRequest.create({
			data: {
				campaignId: campaign.id,
				userId: session.user.id,
				extraDays: safeExtraDays ?? undefined,
				extraTarget: safeExtraTarget
					? new Prisma.Decimal(safeExtraTarget)
					: undefined,
				note: reason && reason.trim() ? reason.trim() : undefined,
			},
		});

		const admins = await prisma.user.findMany({
			where: { role: "ADMIN" },
			select: { id: true },
		});

		if (admins.length > 0) {
			let changeSummary = "";

			if (safeExtraDays && safeExtraTarget) {
				changeSummary = `Perpanjangan ${safeExtraDays} hari dan penambahan target Rp${safeExtraTarget.toLocaleString(
					"id-ID",
				)}`;
			} else if (safeExtraDays) {
				changeSummary = `Perpanjangan ${safeExtraDays} hari`;
			} else if (safeExtraTarget) {
				changeSummary = `Penambahan target Rp${safeExtraTarget.toLocaleString(
					"id-ID",
				)}`;
			} else {
				changeSummary = "Perubahan campaign";
			}

			const message = `Pengajuan perubahan campaign "${campaign.title}" oleh fundraiser. ${changeSummary}. CAMPAIGN_CHANGE_REQUEST:${campaign.id}`;

			await prisma.notification.createMany({
				data: admins.map((admin) => ({
					userId: admin.id,
					title: "Pengajuan Perubahan Campaign",
					message,
					type: NotificationType.KABAR,
				})),
			});
		}

		return { success: true };
	} catch (error) {
		console.error("Request campaign change error:", error);
		return { success: false, error: "Failed to create request" };
	}
}

export async function getCampaignChangeRequests(
	page = 1,
	limit = 20,
	status: "all" | "PENDING" | "APPROVED" | "REJECTED" = "all",
) {
	try {
		const where: any = {};
		if (status !== "all") {
			where.status = status;
		}

		const [requests, total] = await Promise.all([
			prisma.campaignChangeRequest.findMany({
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
				where,
				include: {
					campaign: { select: { id: true, title: true, slug: true } },
					user: { select: { id: true, name: true, email: true } },
				},
			}),
			prisma.campaignChangeRequest.count({ where }),
		]);

		const plainRequests = requests.map((r) => ({
			...r,
			extraTarget: r.extraTarget ? Number(r.extraTarget) : null,
		}));

		return {
			requests: plainRequests,
			total,
			totalPages: Math.ceil(total / limit),
		};
	} catch (error) {
		console.error("Get campaign change requests error:", error);
		return { requests: [], total: 0, totalPages: 0 };
	}
}

export async function resolveCampaignChangeRequest(
	requestId: string,
	decision: "APPROVE" | "REJECT",
	options?: {
		applyDays?: boolean;
		applyTarget?: boolean;
		extraDaysOverride?: number | null;
		extraTargetOverride?: number | null;
		note?: string | null;
	},
) {
	try {
		const session = await auth();
		if (!session?.user || session.user.role !== "ADMIN") {
			return { success: false, error: "Unauthorized" };
		}

		const req = await prisma.campaignChangeRequest.findUnique({
			where: { id: requestId },
			include: {
				campaign: {
					select: {
						id: true,
						title: true,
						slug: true,
						target: true,
						end: true,
						createdById: true,
					},
				},
			},
		});

		if (!req) {
			return { success: false, error: "Request not found" };
		}

		if (req.status !== "PENDING") {
			return { success: false, error: "Request already processed" };
		}

		if (decision === "REJECT") {
			await prisma.campaignChangeRequest.update({
				where: { id: requestId },
				data: {
					status: "REJECTED",
					note: options?.note || null,
					processedAt: new Date(),
					processedById: session.user.id,
				},
			});

			if (req.campaign?.createdById) {
				await createNotification(
					req.campaign.createdById,
					"Pengajuan Perubahan Ditolak",
					`Pengajuan perubahan untuk campaign "${req.campaign.title}" ditolak admin.`,
					NotificationType.KABAR,
				);
			}

			revalidatePath("/admin/pengajuan-campaign");
			if (req.campaign) {
				revalidatePath("/admin/campaign");
				revalidatePath(`/admin/campaign/${req.campaign.id}`);
				if (req.campaign.slug) {
					revalidatePath(`/galang-dana/${req.campaign.slug}`);
				}
			}

			return { success: true };
		}

		const campaign = req.campaign;
		if (!campaign) {
			return { success: false, error: "Campaign not found for request" };
		}

		const updates: Prisma.CampaignUpdateInput = {};

		const useDays =
			typeof options?.applyDays === "boolean"
				? options.applyDays
				: !!req.extraDays;
		const useTarget =
			typeof options?.applyTarget === "boolean"
				? options.applyTarget
				: !!req.extraTarget;

		const daysValue =
			typeof options?.extraDaysOverride === "number"
				? options.extraDaysOverride
				: req.extraDays || 0;
		const targetValueRaw =
			typeof options?.extraTargetOverride === "number"
				? options.extraTargetOverride
				: req.extraTarget
					? Number(req.extraTarget)
					: 0;

		if (useDays && daysValue && daysValue > 0) {
			const baseEnd = campaign.end ? new Date(campaign.end) : new Date();
			baseEnd.setDate(baseEnd.getDate() + daysValue);
			updates.end = baseEnd;
		}

		if (useTarget && targetValueRaw && targetValueRaw > 0) {
			const currentTarget = Number(campaign.target || 0);
			const extra = Number(targetValueRaw);
			const nextTarget = currentTarget + (Number.isNaN(extra) ? 0 : extra);
			updates.target = nextTarget;
		}

		if (Object.keys(updates).length > 0) {
			await prisma.campaign.update({
				where: { id: campaign.id },
				data: updates,
			});
		}

		let summary = "";
		const days = useDays ? daysValue || 0 : 0;
		const extraTarget = useTarget ? targetValueRaw || 0 : 0;

		if (days && extraTarget) {
			summary = `Perpanjangan ${days} hari dan penambahan target Rp${extraTarget.toLocaleString(
				"id-ID",
			)}`;
		} else if (days) {
			summary = `Perpanjangan ${days} hari`;
		} else if (extraTarget) {
			summary = `Penambahan target Rp${extraTarget.toLocaleString("id-ID")}`;
		}

		await prisma.campaignChangeRequest.update({
			where: { id: requestId },
			data: {
				status: "APPROVED",
				note: summary || null,
				processedAt: new Date(),
				processedById: session.user.id,
			},
		});

		if (campaign.createdById) {
			await createNotification(
				campaign.createdById,
				"Pengajuan Perubahan Disetujui",
				`Pengajuan perubahan untuk campaign "${campaign.title}" disetujui. ${summary}`,
				NotificationType.KABAR,
			);
		}

		revalidatePath("/admin/pengajuan-campaign");
		revalidatePath("/admin/campaign");
		revalidatePath(`/admin/campaign/${campaign.id}`);
		if (campaign.slug) {
			revalidatePath(`/galang-dana/${campaign.slug}`);
		}

		return { success: true };
	} catch (error) {
		console.error("Resolve campaign change request error:", error);
		return { success: false, error: "Failed to process request" };
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
		revalidatePath(`/donasi/${campaignId}`);

		return { success: true, data: media, url: uploadRes.url };
	} catch (error) {
		console.error("Add campaign media error:", error);
		return { success: false, error: "Failed to add campaign media" };
	}
}

export async function updateCampaignMedicalDocs(
	campaignId: string,
	docs: { resume_medis?: string | null; surat_rs?: string | null },
) {
	const session = await auth();
	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const campaign = await prisma.campaign.findUnique({
			where: { id: campaignId },
			select: { metadata: true },
		});

		let metadata: any = campaign?.metadata || {};
		let medicalDocs: any = metadata.medicalDocs || {};

		if ("resume_medis" in docs) {
			if (docs.resume_medis) {
				medicalDocs = { ...medicalDocs, resume_medis: docs.resume_medis };
			} else {
				delete medicalDocs.resume_medis;
			}
		}

		if ("surat_rs" in docs) {
			if (docs.surat_rs) {
				medicalDocs = { ...medicalDocs, surat_rs: docs.surat_rs };
			} else {
				delete medicalDocs.surat_rs;
			}
		}

		if (Object.keys(medicalDocs).length > 0) {
			metadata = { ...metadata, medicalDocs };
		} else if (metadata.medicalDocs) {
			const { medicalDocs: _removed, ...rest } = metadata;
			metadata = rest;
		}

		await prisma.campaign.update({
			where: { id: campaignId },
			data: { metadata },
		});

		revalidatePath(`/admin/campaign/${campaignId}`);
		revalidatePath("/admin/campaign/verifikasi");

		return { success: true };
	} catch (error) {
		console.error("Update medical docs error:", error);
		return { success: false, error: "Failed to update medical docs" };
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
