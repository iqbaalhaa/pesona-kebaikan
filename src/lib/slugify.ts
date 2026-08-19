/**
 * Matches the slug style already used for Campaign/CampaignCategory (see
 * src/actions/campaign.ts) — lowercased, punctuation stripped, whitespace
 * collapsed away entirely (no dashes), for consistency across the app.
 */
export function slugify(value: string): string {
	return (value || "")
		.toLowerCase()
		.trim()
		.replace(/[^\w\s]/g, "")
		.replace(/[\s_]+/g, "");
}

/**
 * Slug + a short uniqueness suffix — same pattern campaign creation uses to
 * avoid a slug-uniqueness DB round-trip loop at write time.
 */
export function makeUniqueSlug(title: string): string {
	return `${slugify(title)}-${Date.now().toString().slice(-4)}`;
}
