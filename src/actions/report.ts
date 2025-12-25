"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReportReason } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

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

export async function updateReportStatus(
	reportId: string,
	status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED"
) {
	const session = await auth();
	if (!session?.user || session.user.role !== "ADMIN") {
		return { success: false, error: "Unauthorized" };
	}

	try {
		await prisma.report.update({
			where: { id: reportId },
			data: { status },
		});

		revalidatePath("/admin/pengaduan");
		return { success: true };
	} catch (error) {
		console.error("Update report status error:", error);
		return { success: false, error: "Failed to update report status" };
	}
}
