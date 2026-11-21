"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PIXEL_ID_RE, getTrackingSettings, maskSecret } from "@/lib/tracking-settings";

async function loadForEditor(campaignId: string) {
	const session = await auth();
	if (!session?.user?.id || typeof campaignId !== "string" || campaignId.length > 40) return null;
	const c = await prisma.campaign.findUnique({
		where: { id: campaignId },
		select: { id: true, slug: true, createdById: true, metaPixelId: true, metaCapiToken: true, metaPixelDisabled: true },
	});
	if (!c) return null;
	const isAdmin = session.user.role === "ADMIN";
	if (!isAdmin && c.createdById !== session.user.id) return null;
	return { c, isAdmin };
}

/** Owner pixel settings for the campaign's owner or an ADMIN (token masked). */
export async function getCampaignPixel(campaignId: string) {
	const r = await loadForEditor(campaignId);
	if (!r) return { success: false as const, error: "Unauthorized" };
	const s = await getTrackingSettings();
	return {
		success: true as const,
		data: {
			pixelId: r.c.metaPixelId || "",
			tokenMask: maskSecret(r.c.metaCapiToken),
			disabled: r.c.metaPixelDisabled,
			featureEnabled: s.ownerPixelEnabled,
			isAdmin: r.isAdmin,
		},
	};
}

export async function updateCampaignPixel(
	campaignId: string,
	input: { pixelId: string; capiToken?: string; disabled?: boolean },
) {
	const r = await loadForEditor(campaignId);
	if (!r) return { success: false, error: "Unauthorized" };

	const pixelId = String(input.pixelId || "").trim();
	if (pixelId && !PIXEL_ID_RE.test(pixelId)) {
		return { success: false, error: "Pixel ID harus berupa angka (10–20 digit)" };
	}
	const token = input.capiToken === undefined ? undefined : String(input.capiToken).trim();
	if (token && (token.length > 500 || /\s/.test(token))) {
		return { success: false, error: "Access token tidak valid" };
	}

	const data: { metaPixelId: string | null; metaCapiToken?: string | null; metaPixelDisabled?: boolean } = {
		metaPixelId: pixelId || null,
	};
	if (token !== undefined) data.metaCapiToken = token || null;
	// Removing the pixel also drops its token.
	if (!pixelId) data.metaCapiToken = null;
	// Only an admin can switch an owner's pixel off/on.
	if (r.isAdmin && typeof input.disabled === "boolean") data.metaPixelDisabled = input.disabled;

	try {
		await prisma.campaign.update({ where: { id: r.c.id }, data });
	} catch (e) {
		console.error("updateCampaignPixel failed:", e);
		return { success: false, error: "Gagal menyimpan" };
	}
	revalidatePath(`/donasi/${r.c.slug || r.c.id}`);
	return { success: true };
}
