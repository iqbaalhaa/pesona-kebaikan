"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

/**
 * Withdrawal disbursement is manual only: an admin transfers funds from
 * Pesona's bank account to the beneficiary's account outside this system,
 * then records the transfer details/proof here. There is no automated
 * payout provider integration.
 *
 * SECURITY: none of the functions in this file had any caller-authorization
 * check before — anyone (even logged out) could approve/reject a real
 * withdrawal via direct server-action call. Every exported function below
 * must go through this guard.
 */
async function assertWithdrawalAccess() {
  const session = await auth();
  const role = session?.user?.role;
  const permissions = session?.user?.permissions || [];
  const allowed = role === "ADMIN" || (role === "STAFF" && permissions.includes("MANAGE_WITHDRAWALS"));
  return { allowed, session };
}

export async function getCampaignsWithFunds() {
  const { allowed } = await assertWithdrawalAccess();
  if (!allowed) return [];

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
  const { allowed } = await assertWithdrawalAccess();
  if (!allowed) return [];

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
  const { allowed } = await assertWithdrawalAccess();
  if (!allowed) throw new Error("Unauthorized");

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
  rejectReason?: string,
  transferDetails?: {
    transferAmount?: number;
    senderBank?: string;
    senderAccount?: string;
  }
) {
  const { allowed } = await assertWithdrawalAccess();
  if (!allowed) return { success: false, error: "Unauthorized" };

  if (status === "REJECTED") {
    await prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectReason || null,
      },
    });
  } else if (status === "COMPLETED") {
    // Manual disbursement: admin has already transferred the funds from
    // Pesona's bank account to the beneficiary's account; this just records it.
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
  } else {
    // APPROVED
    await prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        proofUrl,
      },
    });
  }

  revalidatePath("/admin/pencairan");

  return { success: true };
}
