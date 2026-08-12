"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VerifiedAs, VerificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { canonicalPhone } from "@/lib/phone";

function normalizePhone(phone: string): string | null {
	const digits = phone.replace(/\D/g, "");
	return digits || null;
}

// Statuses that count as an actual completed donation — matches the
// "successful donation" check used elsewhere (e.g. admin.ts's getCampaignTransactions).
const SUCCESSFUL_DONATION_STATUSES = ["PAID", "paid", "SETTLED", "COMPLETED"];

/**
 * Claim any guest (userId-less) successful donations that were made with
 * this same phone number before the donor had an account, so they show up
 * in the donor's own history. Only ever attaches donations that have no
 * owner yet — never reassigns a donation already linked to another user.
 */
async function claimGuestDonationsByPhone(userId: string, phone: string) {
	const target = canonicalPhone(phone);
	if (!target) return 0;

	const candidates = await prisma.donation.findMany({
		where: {
			userId: null,
			status: { in: SUCCESSFUL_DONATION_STATUSES },
			donorPhone: { not: null },
		},
		select: { id: true, donorPhone: true },
	});

	const matchingIds = candidates
		.filter((d) => canonicalPhone(d.donorPhone) === target)
		.map((d) => d.id);

	if (matchingIds.length === 0) return 0;

	await prisma.donation.updateMany({
		where: { id: { in: matchingIds } },
		data: { userId },
	});

	return matchingIds.length;
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

	const claimedCount = await claimGuestDonationsByPhone(session.user.id, normalizedPhone);

	revalidatePath("/profil/akun");
	revalidatePath("/donasi-saya");
	return { success: true, claimedCount };
}

export async function getVerificationStatus() {
	const session = await auth();
	if (!session?.user?.email) return { success: false, error: "Unauthorized" };

	const user = await prisma.user.findUnique({
		where: { email: session.user.email },
		select: {
			phoneVerified: true,
			emailVerified: true,
			verificationRequests: {
				orderBy: { createdAt: "desc" },
				take: 1,
				select: { type: true },
			},
		},
	});

	const latestType = user?.verificationRequests?.[0]?.type;

	return {
		success: true,
		data: {
			phoneVerified: user?.phoneVerified,
			emailVerified: user?.emailVerified,
			verificationType:
				latestType === VerifiedAs.organization
					? ("organisasi" as const)
					: latestType === VerifiedAs.personal
						? ("individu" as const)
						: null,
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
	// Organisasi only — data penanggung jawab (PIC) yang mengajukan.
	picName?: string;
	picPhone?: string;
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
			// The schema only has one "document number" column (ktpNumber) —
			// reused here for the org's SK Kemenkumham number too, since it was
			// previously being collected from the form and silently dropped.
			ktpNumber: input.type === "organisasi" ? input.organizationNumber : input.ktpNumber,
			ktpPhotoUrl: input.ktpPhotoUrl ?? null,
			organizationDocUrl: input.organizationDocUrl ?? null,
			notes: input.notes ?? null,
			// ktpName/ktpPhotoUrl double as "nama & foto KTP penanggung jawab"
			// when type is organisasi — see SubmitVerificationInput comment above.
			ktpName: input.type === "organisasi" ? input.picName ?? null : null,
			picPhone: input.type === "organisasi" ? normalizePhone(input.picPhone || "") : null,
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
