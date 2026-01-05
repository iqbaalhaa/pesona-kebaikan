"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VerifiedAs, VerificationStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export async function markPhoneVerified(phone: string) {
  const session = await auth();
  if (!session?.user?.email) return { success: false, error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { success: false, error: "User not found" };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      phone,
      phoneVerified: new Date(),
    },
  });
  revalidatePath("/profil/akun");
  return { success: true };
}

type SubmitVerificationInput = {
  type: "individu" | "organisasi";
  ktpNumber?: string;
  organizationNumber?: string;
  ktpPhotoUrl?: string | null;
  organizationDocUrl?: string | null;
  notes?: string | null;
};

export async function submitVerificationRequest(input: SubmitVerificationInput) {
  const session = await auth();
  if (!session?.user?.email) return { success: false, error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { success: false, error: "User not found" };

  const type = input.type === "organisasi" ? VerifiedAs.organization : VerifiedAs.personal;

  await prisma.verificationRequest.create({
    data: {
      userId: user.id,
      type,
      status: VerificationStatus.PENDING,
      ktpNumber: input.ktpNumber,
      ktpPhotoUrl: input.ktpPhotoUrl ?? null,
      organizationDocUrl: input.organizationDocUrl ?? null,
      notes: input.notes ?? null,
    },
  });
  // No page to revalidate specifically; keep it simple
  return { success: true };
}

export async function updateMyAddress(provinceId: string, regencyId: string) {
  const session = await auth();
  if (!session?.user?.email) return { success: false, error: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { success: false, error: "User not found" };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      provinceId,
      regencyId,
    },
  });
  revalidatePath("/profil/akun");
  return { success: true };
}
