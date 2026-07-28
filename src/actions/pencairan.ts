"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { createNotification } from "@/actions/notification";
import { sendWithdrawalStatusEmail } from "@/lib/mail";
import { idr } from "@/lib/currency";
import { NotificationType } from "@prisma/client";

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
  return { allowed, isAdmin: role === "ADMIN", session };
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
          createdBy: {
            select: { name: true, verifiedAt: true },
          },
        },
      },
      processedBy: {
        select: { name: true, email: true },
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
    ownerName: w.campaign.createdBy?.name || null,
    ownerVerified: !!w.campaign.createdBy?.verifiedAt,
    processedByName: w.processedBy?.name || w.processedBy?.email || null,
    processedAt: w.processedAt ? w.processedAt.toISOString() : null,
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
  // Maker-checker: manual (admin-initiated) withdrawals may only be CREATED
  // by ADMIN. STAFF with MANAGE_WITHDRAWALS may only process/approve what's
  // already in the queue (from here or from a fundraiser's own request in
  // requestWithdrawal()) — never create and approve the same withdrawal.
  const { isAdmin, session } = await assertWithdrawalAccess();
  if (!isAdmin) throw new Error("Hanya ADMIN yang dapat membuat pencairan manual");

  await prisma.withdrawal.create({
    data: {
      campaignId: data.campaignId,
      amount: data.amount,
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      accountHolder: data.accountHolder,
      notes: data.notes,
      status: "PENDING",
      createdById: session?.user?.id,
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
  const { allowed, session } = await assertWithdrawalAccess();
  if (!allowed) return { success: false, error: "Unauthorized" };

  // A completed withdrawal means real money has left Pesona's account —
  // proof of transfer is mandatory, not optional, for accountability.
  if (status === "COMPLETED" && !proofUrl) {
    return {
      success: false,
      error: "Bukti transfer wajib diunggah sebelum menyelesaikan pencairan",
    };
  }

  const processedById = session?.user?.id;
  const processedAt = new Date();

  let updated;
  if (status === "REJECTED") {
    updated = await prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectReason || null,
        processedById,
        processedAt,
      },
      include: { campaign: { include: { createdBy: true } } },
    });
  } else if (status === "COMPLETED") {
    // Manual disbursement: admin has already transferred the funds from
    // Pesona's bank account to the beneficiary's account; this just records it.
    updated = await prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        proofUrl,
        transferAmount: transferDetails?.transferAmount ?? undefined,
        senderBank: transferDetails?.senderBank || undefined,
        senderAccount: transferDetails?.senderAccount || undefined,
        processedById,
        processedAt,
      },
      include: { campaign: { include: { createdBy: true } } },
    });
  } else {
    // APPROVED
    updated = await prisma.withdrawal.update({
      where: { id },
      data: {
        status,
        proofUrl,
        processedById,
        processedAt,
      },
      include: { campaign: { include: { createdBy: true } } },
    });
  }

  revalidatePath("/admin/pencairan");

  // Notify the campaign owner — best-effort: a notification/email failure
  // must not fail the withdrawal update that already succeeded.
  try {
    const owner = updated.campaign.createdBy;
    const amountFormatted = idr(Number(updated.amount));
    const statusText: Record<typeof status, string> = {
      APPROVED: "disetujui dan sedang diproses",
      REJECTED: `ditolak${rejectReason ? `. Alasan: ${rejectReason}` : ""}`,
      COMPLETED: "selesai ditransfer ke rekening tujuan",
    };
    await createNotification(
      owner.id,
      status === "REJECTED" ? "Pencairan Ditolak" : status === "COMPLETED" ? "Pencairan Selesai" : "Pencairan Disetujui",
      `Pencairan dana campaign "${updated.campaign.title}" sejumlah ${amountFormatted} ${statusText[status]}.`,
      NotificationType.KABAR,
    );
    if (owner.email) {
      await sendWithdrawalStatusEmail(owner.email, {
        campaignTitle: updated.campaign.title,
        amountFormatted,
        status,
        rejectionReason: status === "REJECTED" ? rejectReason : undefined,
      });
    }
  } catch (error) {
    console.error("Failed to notify campaign owner of withdrawal status change:", error);
  }

  return { success: true };
}
