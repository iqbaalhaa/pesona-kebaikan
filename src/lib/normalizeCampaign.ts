export type RawCampaign = {
	id: string;
	slug?: string | null;
	title?: string | null;
	category?: string | null;
	createdBy?: { name?: string | null } | null;
	ownerName?: string | null;
	target?: number | null;
	collected?: number | null;
	daysLeft?: number | null;
	thumbnail?: string | null;
	verifiedAt?: string | Date | null;
};

export type CardData = {
	id: string;
	slug?: string;
	title: string;
	category: string;
	ownerName: string;
	target: number;
	collected: number;
	daysLeft: number;
	thumbnail?: string;
	verifiedAt?: string | Date | null;
};

export function normalizeCampaignToCard(input: RawCampaign): CardData {
	return {
		id: input.id,
		slug: input.slug || undefined,
		title: (input.title || "").trim() || "Tanpa Judul",
		category: (input.category || "Lainnya").trim(),
		ownerName: input.ownerName || input.createdBy?.name?.trim() || "Unknown",
		target: Math.max(0, Number(input.target || 0)),
		collected: Math.max(0, Number(input.collected || 0)),
		daysLeft: Math.max(0, Number(input.daysLeft || 0)),
		thumbnail: input.thumbnail || "/defaultimg.webp",
		verifiedAt: input.verifiedAt ?? null,
	};
}
