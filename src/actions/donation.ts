"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
	checkMidtransStatus,
	mapMidtransToInternal,
} from "@/lib/midtrans-status";

export type CreateDonationInput = {
	campaignId: string;
	fundraiserId?: string;
	amount: number;
	donorName: string;
	donorPhone: string;
	message?: string;
	isAnonymous?: boolean;
	paymentMethod: "EWALLET" | "VIRTUAL_ACCOUNT" | "TRANSFER" | "CARD";
};

export async function createDonation(input: CreateDonationInput) {
	let userId: string | undefined = undefined;

	try {
		const session = await auth();
		if (session?.user?.id) {
			userId = session.user.id;
		}
	} catch (e) {
		console.warn("Auth check failed during donation creation:", e);
		// Proceed without linking to user
	}

	try {
		const campaign = await prisma.campaign.findUnique({
			where: { id: input.campaignId },
			select: { status: true },
		});

		if (!campaign) {
			return { success: false, error: "Campaign tidak ditemukan" };
		}

		if (campaign.status === "PAUSED") {
			return { success: false, error: "Campaign sedang dijeda" };
		}

		if (campaign.status === "COMPLETED") {
			return { success: false, error: "Campaign sudah berakhir" };
		}

		if (campaign.status === "REJECTED") {
			return { success: false, error: "Campaign ditolak" };
		}

		const donation = await prisma.donation.create({
			data: {
				campaignId: input.campaignId,
				fundraiserId: input.fundraiserId,
				amount: input.amount,
				donorName: input.donorName,
				donorPhone: input.donorPhone,
				message: input.message,
				isAnonymous: input.isAnonymous || false,
				paymentMethod: input.paymentMethod,
				status: "PENDING",
				userId: userId, // Link to user if logged in
			},
		});

		revalidatePath(`/donasi`);
		revalidatePath(`/donasi-saya`);

		// Convert Decimal to number/string for client serialization
		const serializedDonation = {
			...donation,
			amount: Number(donation.amount),
		};

		return { success: true, data: serializedDonation };
	} catch (error) {
		console.error("Error creating donation:", error);
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Gagal membuat donasi. Silakan coba lagi.",
		};
	}
}

export async function checkPendingDonations(campaignId?: string) {
	try {
		// Find pending donations
		// If campaignId is provided, filter by it and take latest 5
		// Otherwise take latest 10 overall (or just don't support global check here to be safe)
		const whereClause = campaignId
			? { campaignId, status: "PENDING" }
			: { status: "PENDING" };

		const pendingDonations = await prisma.donation.findMany({
			where: whereClause,
			orderBy: { createdAt: "desc" },
			take: 5, // Limit to 5 recent pending transactions to check
		});

		if (pendingDonations.length === 0) {
			return { success: true, updated: 0 };
		}

		let updatedCount = 0;

		await Promise.all(
			pendingDonations.map(async (d) => {
				const midtransData = await checkMidtransStatus(d.id);
				if (midtransData && midtransData.transaction_status) {
					const newStatus = mapMidtransToInternal(
						midtransData.transaction_status,
						midtransData.fraud_status
					);

					if (newStatus !== "PENDING" && newStatus !== d.status) {
						// Update DB
						await prisma.donation.update({
							where: { id: d.id },
							data: { status: newStatus },
						});
						updatedCount++;
					}
				}
			})
		);

		if (updatedCount > 0) {
			revalidatePath("/donasi");
			revalidatePath("/donasi-saya");
			if (campaignId) {
				const campaign = await prisma.campaign.findUnique({
					where: { id: campaignId },
					select: { slug: true },
				});
				if (campaign?.slug) {
					revalidatePath(`/donasi/${campaign.slug}`);
				}
			}
		}

		return { success: true, updated: updatedCount };
	} catch (error) {
		console.error("Error checking pending donations:", error);
		return { success: false, error: "Gagal memverifikasi status donasi" };
	}
}
