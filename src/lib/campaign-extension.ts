const DAY_MS = 24 * 60 * 60 * 1000;

// Extending counts from the current end, or from today if the campaign already
// ended — otherwise an expired campaign stays expired. An auto-ended campaign
// (COMPLETED) goes back to ACTIVE so admin doesn't have to Akhiri → Mulai.
export function extensionUpdate(
	campaign: { end: Date | null; status: string },
	days: number,
	now = Date.now(),
): { end: Date; status?: "ACTIVE" } {
	const base = campaign.end ? Math.max(campaign.end.getTime(), now) : now;
	const data: { end: Date; status?: "ACTIVE" } = { end: new Date(base + days * DAY_MS) };
	if (campaign.status === "COMPLETED") data.status = "ACTIVE";
	return data;
}
