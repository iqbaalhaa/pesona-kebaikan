"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  createPayout as createDokuPayout,
  approvePayout as approveDokuPayout,
} from "@/lib/doku-payout";
import { auth } from "@/auth";
import { verifyOtp } from "@/actions/otp";

const DOKU_PAYOUTS_ENABLED = process.env.DOKU_PAYOUTS_ENABLED === "true";
const PAYOUTS_REVIEW_MESSAGE =
  process.env.PAYOUTS_REVIEW_MESSAGE ||
  "Integrasi payout otomatis belum aktif atau masih dalam proses review.";

type PayoutProvider = "DOKU" | null;

function getActivePayoutProvider(): PayoutProvider {
  return DOKU_PAYOUTS_ENABLED ? "DOKU" : null;
}

const DISBURSEMENT_BYPASS_OTP =
  process.env.NEXT_PUBLIC_DISBURSEMENT_BYPASS_OTP === "true";
const DISBURSEMENT_BYPASS_STATUS_UPDATE =
  process.env.NEXT_PUBLIC_DISBURSEMENT_BYPASS_STATUS_UPDATE === "true";

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

export async function getPayoutsCapability() {
  const provider = getActivePayoutProvider();
  return {
    available: !!provider,
    provider,
    message: provider ? "" : PAYOUTS_REVIEW_MESSAGE,
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
    notes: w.notes,
    rejectionReason: w.rejectionReason,
    transferAmount: w.transferAmount ? Number(w.transferAmount) : null,
    senderBank: w.senderBank,
    senderAccount: w.senderAccount,
    createdAt: w.createdAt.toISOString(),
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
  transferDetails?: {
    transferAmount?: number;
    senderBank?: string;
    senderAccount?: string;
  }
) {
  // 0. Verify OTP (Application Level Security)
  // We require OTP for ALL approvals, regardless of DOKU/Manual mode
  if (status === "APPROVED") {
    // Bypass OTP check if configured
    if (!DISBURSEMENT_BYPASS_OTP) {
      if (!otp) {
        return {
          success: false,
          error: "OTP diperlukan untuk menyetujui pencairan",
        };
      }

      const session = await auth();
      // Use provided adminPhone or fallback to session or default
      const phoneToVerify =
        adminPhone || (session?.user as any)?.phone;
      if (!phoneToVerify) {
        return {
          success: false,
          error: "Nomor WA admin belum dikonfigurasi. Silakan atur nomor WA di menu pengaturan.",
        };
      }

      const verifyRes = await verifyOtp(phoneToVerify, otp);
      if (!verifyRes.success) {
        return {
          success: false,
          error: verifyRes.error || "Verifikasi OTP gagal",
        };
      }
    }
  }

  // If approving, trigger the active payout provider (DOKU)
  if (status === "APPROVED") {
    const provider = getActivePayoutProvider();
    if (!provider || DISBURSEMENT_BYPASS_STATUS_UPDATE) {
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

      const createRes = (await createDokuPayout(payoutPayload)) as {
        payouts?: { reference_no?: string }[];
      };
      const referenceNo = createRes.payouts?.[0]?.reference_no;

      if (!referenceNo) {
        return {
          success: false,
          error: "Gagal mendapatkan reference_no dari DOKU Payout",
        };
      }

      // 2. Approve Payout (no-op for DOKU — transfer already executed in step 1)
      await approveDokuPayout([referenceNo], otp || "BYPASSED");

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
      console.error("DOKU Payout Error:", error);
      return {
        success: false,
        error: error.message || "Gagal memproses pencairan ke DOKU Payout",
      };
    }

    revalidatePath("/admin/pencairan");
    return { success: true, payoutMode: "DOKU" as const };
  } else if (status === "REJECTED") {
    await prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectReason || null,
      },
    });
  } else {
    // COMPLETED
    await prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        proofUrl,
        transferAmount: transferDetails?.transferAmount ?? undefined,
        senderBank: transferDetails?.senderBank || undefined,
        senderAccount: transferDetails?.senderAccount || undefined,
      },
    });
  }

  revalidatePath("/admin/pencairan");

  return { success: true };
}
