"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createPayout, approvePayout } from "@/lib/midtrans-iris";
import { auth } from "@/auth";
import { verifyOtp } from "@/actions/otp";

const MIDTRANS_PAYOUTS_ENABLED =
	process.env.MIDTRANS_PAYOUTS_ENABLED === "true";
const MIDTRANS_PAYOUTS_REVIEW_MESSAGE =
	process.env.MIDTRANS_PAYOUTS_REVIEW_MESSAGE ||
	"Integrasi Midtrans Payouts belum aktif atau masih dalam proses review.";

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
			0,
		);
		const withdrawn = c.withdrawals.reduce(
			(acc, curr) => acc + Number(curr.amount),
			0,
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

export async function getPayoutsCapability() {
	const available = MIDTRANS_PAYOUTS_ENABLED;
	return {
		available,
		message: available ? "" : MIDTRANS_PAYOUTS_REVIEW_MESSAGE,
	};
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
	rejectReason?: string,
	adminPhone?: string,
) {
	// 0. Verify OTP (Application Level Security)
	// We require OTP for ALL approvals, regardless of Midtrans/Manual mode
	if (status === "APPROVED") {
		if (!otp) {
			return {
				success: false,
				error: "OTP diperlukan untuk menyetujui pencairan",
			};
		}

		const session = await auth();
		// Use provided adminPhone or fallback to session or default
		const phoneToVerify = adminPhone || session?.user?.phone || "085382055598";

		const verifyRes = await verifyOtp(phoneToVerify, otp);
		if (!verifyRes.success) {
			return {
				success: false,
				error: verifyRes.error || "Verifikasi OTP gagal",
			};
		}
	}

	// If approving, trigger Midtrans Iris Payout
	if (status === "APPROVED") {
		if (!MIDTRANS_PAYOUTS_ENABLED) {
			await prisma.withdrawal.update({
				where: { id },
				data: {
					status,
					proofUrl,
				},
			});

			revalidatePath("/admin/pencairan");
			return { success: true, payoutMode: "MANUAL" as const };
		}

		// OTP already verified above

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
						beneficiary_email: withdrawal.campaign.createdBy.email || undefined,
						amount: String(Math.floor(Number(withdrawal.amount))),
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

		revalidatePath("/admin/pencairan");
		return { success: true, payoutMode: "IRIS" as const };
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
