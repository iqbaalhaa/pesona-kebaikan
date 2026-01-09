"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createPayout, approvePayout } from "@/lib/midtrans-iris";

export async function getCampaignsWithFunds() {
	const campaigns = await prisma.campaign.findMany({
		where: {
			status: "ACTIVE",
		},
		include: {
			donations: {
				where: {
					status: {
						in: ["PAID", "paid", "SETTLED", "COMPLETED", "ACTIVE"],
					},
				},
				select: {
					amount: true,
				},
			},
			withdrawals: {
				where: {
					status: {
						in: ["PENDING", "APPROVED", "COMPLETED"],
					},
				},
				select: {
					amount: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return campaigns.map((c) => {
		const collected = c.donations.reduce(
			(acc, curr) => acc + Number(curr.amount),
			0
		);
		const withdrawn = c.withdrawals.reduce(
			(acc, curr) => acc + Number(curr.amount),
			0
		);
		return {
			id: c.id,
			title: c.title,
			collected,
			withdrawn,
			available: collected - withdrawn,
		};
	});
}

export async function getWithdrawals() {
	const withdrawals = await prisma.withdrawal.findMany({
		include: {
			campaign: {
				select: {
					title: true,
					slug: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return withdrawals.map((w) => ({
		id: w.id,
		amount: Number(w.amount),
		status: w.status,
		bankName: w.bankName,
		bankAccount: w.bankAccount,
		accountHolder: w.accountHolder,
		createdAt: w.createdAt.toLocaleString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}),
		campaignTitle: w.campaign.title,
		campaignSlug: w.campaign.slug,
		campaignId: w.campaignId,
		proofUrl: w.proofUrl,
		referenceNo: w.referenceNo,
	}));
}

export async function createWithdrawal(data: {
	campaignId: string;
	amount: number;
	bankName: string;
	bankAccount: string;
	accountHolder: string;
	notes?: string;
}) {
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

	revalidatePath("/admin/pencairan");
}

export async function updateWithdrawalStatus(
	id: string,
	status: "APPROVED" | "REJECTED" | "COMPLETED",
	proofUrl?: string,
	otp?: string,
	rejectReason?: string
) {
	// If approving, trigger Midtrans Iris Payout
	if (status === "APPROVED") {
		if (!otp) {
			return {
				success: false,
				error: "OTP Midtrans diperlukan untuk menyetujui pencairan",
			};
		}
		const withdrawal = await prisma.withdrawal.findUnique({
			where: { id },
			include: {
				campaign: {
					include: {
						createdBy: true,
					},
				},
			},
		});

		if (!withdrawal) return { success: false, error: "Withdrawal not found" };

		// Skip if already has referenceNo (means already processed)
		if (withdrawal.referenceNo) {
			return {
				success: false,
				error: "Pencairan ini sudah diproses sebelumnya",
			};
		}

		try {
			// 1. Create Payout
			const payoutPayload = {
				payouts: [
					{
						beneficiary_name: withdrawal.accountHolder,
						beneficiary_account: withdrawal.bankAccount,
						beneficiary_bank: withdrawal.bankName,
						beneficiary_email: withdrawal.campaign.createdBy.email,
						amount: String(withdrawal.amount),
						notes: `Pencairan ${withdrawal.campaign.title.substring(0, 20)}`,
					},
				],
			};

			const createRes = await createPayout(payoutPayload);
			const referenceNo = createRes.payouts?.[0]?.reference_no;

			if (!referenceNo) {
				return {
					success: false,
					error: "Gagal mendapatkan reference_no dari Midtrans Iris",
				};
			}

			// 2. Approve Payout
			await approvePayout([referenceNo], otp);

			// 3. Update DB
			await prisma.withdrawal.update({
				where: { id },
				data: {
					status,
					proofUrl,
					referenceNo,
				},
			});
		} catch (error: any) {
			console.error("Midtrans Payout Error:", error);
			return {
				success: false,
				error: error.message || "Gagal memproses pencairan ke Midtrans Iris",
			};
		}
	} else {
		// Normal update for other statuses
		await prisma.withdrawal.update({
			where: { id },
			data: {
				status,
				proofUrl,
				notes: status === "REJECTED" ? rejectReason : undefined,
			},
		});
	}

	revalidatePath("/admin/pencairan");

	return { success: true };
}
