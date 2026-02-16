"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReportReason } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/actions/notification";
import { NotificationType } from "@prisma/client";

export type ReportData = {
	campaignId: string;
	reason: ReportReason;
	details: string;
	reporterName: string;
	reporterPhone: string;
	reporterEmail: string;
};

export async function createReport(data: ReportData) {
	try {
		await prisma.report.create({
			data: {
				campaignId: data.campaignId,
				reason: data.reason,
				details: data.details,
				reporterName: data.reporterName,
				reporterPhone: data.reporterPhone,
				reporterEmail: data.reporterEmail,
				status: "PENDING",
			},
		});

		// Notify admins? (Optional)

		return { success: true };
	} catch (error: any) {
		console.error("Create report error:", error);
		return {
			success: false,
			error: error.message || "Failed to submit report",
		};
	}
}

export async function getReports(
	page: number = 1,
	limit: number = 10,
	status: string = "all"
) {
	const session = await auth();
	if (!session?.user || session.user.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

	const skip = (page - 1) * limit;
	const where: any = {};

	if (status !== "all") {
		where.status = status.toUpperCase();
	}

	try {
		const [reports, total] = await Promise.all([
			prisma.report.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: {
					campaign: {
						select: {
							id: true,
							title: true,
							slug: true,
						},
					},
				},
			}),
			prisma.report.count({ where }),
		]);

		return {
			success: true,
			data: reports,
			pagination: {
				total,
				pages: Math.ceil(total / limit),
				page,
				limit,
			},
		};
	} catch (error) {
		console.error("Get reports error:", error);
		return { success: false, error: "Failed to fetch reports" };
	}
}

const REASON_LABELS: Record<ReportReason, string> = {
	FRAUD: "Penipuan/Penyalahgunaan dana",
	COVERED: "Sudah di cover pihak lain (BPJS, Asuransi)",
	FAKE_INFO: "Memberikan Informasi Palsu",
	DECEASED: "Beneficiary sudah meninggal",
	NO_PERMISSION: "Tidak izin kepada keluarga penerima manfaat",
	IRRELEVANT: "Galang dana tidak relevan",
	INAPPROPRIATE: "Konten tidak pantas",
	SPAM: "Spamming",
	OTHER: "Lainnya",
};

export async function updateReportStatus(
	reportId: string,
	status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED"
) {
	const session = await auth();
	if (!session?.user || session.user.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

	try {
		const updated = await prisma.report.update({
			where: { id: reportId },
			data: { status },
		});

		if (status === "REVIEWED") {
			const report = await prisma.report.findUnique({
				where: { id: reportId },
				include: {
					campaign: {
						select: {
							id: true,
							title: true,
							createdById: true,
						},
					},
				},
			});

			if (report?.campaign) {
				const campaignTitle = report.campaign.title || "Tanpa judul";

				// Cari user reporter dengan email case-insensitive
				const reporterUser = report.reporterEmail
					? await prisma.user.findFirst({
							where: {
								email: {
									equals: report.reporterEmail,
									mode: "insensitive",
								},
							},
							select: { id: true },
					  })
					: null;

				if (reporterUser?.id) {
					await createNotification(
						reporterUser.id,
						"Terima kasih atas laporan Anda",
						`Terima kasih atas laporan untuk campaign "${campaignTitle}". Laporan Anda akan segera ditinjau dan dipelajari oleh admin.`,
						NotificationType.PESAN
					);
				}

				if (report.campaign.createdById) {
					const reasonLabel = REASON_LABELS[report.reason] || "Lainnya";
					// Format pesan: Alasan (Label) - Detail
					const reasonText = `${reasonLabel} - ${updated.details}`;

					await createNotification(
						report.campaign.createdById,
						"Campaign sedang ditinjau",
						`Campaign Anda "${campaignTitle}" sedang ditinjau oleh admin dikarenakan: ${reasonText}. Oleh karena itu untuk sementara waktu campaign Anda dinonaktifkan, mohon menunggu informasi kelanjutannya.`,
						NotificationType.PESAN
					);
				}
			}
		}

		revalidatePath("/admin/pengaduan");
		return { success: true };
	} catch (error) {
		console.error("Update report status error:", error);
		return { success: false, error: "Failed to update report status" };
	}
}
