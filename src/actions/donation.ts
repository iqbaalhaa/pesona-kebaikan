"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export type CreateDonationInput = {
	campaignId: string;
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
