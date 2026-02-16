"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VerifiedAs, VerificationStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

function normalizePhone(phone: string): string | null {
	const digits = phone.replace(/\D/g, "");
	return digits || null;
}

export async function markPhoneVerified(phone: string) {
	const session = await auth();
	if (!session?.user?.id) return { success: false, error: "Unauthorized" };

	const normalizedPhone = normalizePhone(phone);
	if (!normalizedPhone) {
		return { success: false, error: "Nomor WhatsApp tidak boleh kosong" };
	}

	const existing = await prisma.user.findFirst({
		where: {
			phone: normalizedPhone,
			id: { not: session.user.id },
		},
		select: { id: true },
	});

	if (existing) {
		return {
			success: false,
			error: "Nomor WhatsApp sudah digunakan oleh pengguna lain",
		};
	}

	await prisma.user.update({
		where: { id: session.user.id },
		data: {
			phone: normalizedPhone,
			phoneVerified: new Date(),
		},
	});
	revalidatePath("/profil/akun");
	return { success: true };
}

export async function getVerificationStatus() {
	const session = await auth();
	if (!session?.user?.email) return { success: false, error: "Unauthorized" };

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
		select: { phoneVerified: true, emailVerified: true },
	});

	return {
		success: true,
		data: {
			phoneVerified: user?.phoneVerified,
			emailVerified: user?.emailVerified,
		},
	};
}

type SubmitVerificationInput = {
	type: "individu" | "organisasi";
	ktpNumber?: string;
	organizationNumber?: string;
	ktpPhotoUrl?: string | null;
	organizationDocUrl?: string | null;
	notes?: string | null;
};

export async function submitVerificationRequest(
	input: SubmitVerificationInput,
) {
	const session = await auth();
	if (!session?.user?.email) return { success: false, error: "Unauthorized" };

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
		select: { id: true },
	});
	if (!user) return { success: false, error: "User not found" };

	const type =
		input.type === "organisasi" ? VerifiedAs.organization : VerifiedAs.personal;

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
