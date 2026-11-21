import { prisma } from "@/lib/prisma";

// Meta Pixel / CAPI and funnel-stats settings, edited in /admin/settings and
// stored in NotifyKey (no env vars). Server-only (holds the CAPI token) —
// never import from a "use client" file.
export const TRACKING_KEYS = {
	pixelEnabled: "meta_pixel_enabled",
	pixelId: "meta_pixel_id",
	capiEnabled: "meta_capi_enabled",
	capiToken: "meta_capi_token",
	testEventCode: "meta_test_event_code",
	ownerPixelEnabled: "meta_owner_pixel_enabled",
	statsEnabled: "stats_tracking_enabled",
	viewDedupMinutes: "stats_view_dedup_minutes",
	ownerSourcesEnabled: "stats_owner_sources_enabled",
} as const;

export type TrackingSettings = {
	pixelEnabled: boolean;
	pixelId: string;
	capiEnabled: boolean;
	capiToken: string;
	testEventCode: string;
	ownerPixelEnabled: boolean;
	statsEnabled: boolean;
	viewDedupMinutes: number;
	ownerSourcesEnabled: boolean;
};

export const PIXEL_ID_RE = /^\d{10,20}$/;

let cached: { at: number; value: TrackingSettings } | null = null;
const TTL_MS = 60_000;

export function parseTrackingSettings(raw: Record<string, string | undefined>): TrackingSettings {
	const on = (k: string, def: boolean) => (raw[k] === undefined ? def : raw[k] === "true");
	const pixelId = (raw[TRACKING_KEYS.pixelId] || "").trim();
	const minutes = Number(raw[TRACKING_KEYS.viewDedupMinutes]);
	return {
		pixelEnabled: on(TRACKING_KEYS.pixelEnabled, false) && PIXEL_ID_RE.test(pixelId),
		pixelId,
		capiEnabled: on(TRACKING_KEYS.capiEnabled, false),
		capiToken: (raw[TRACKING_KEYS.capiToken] || "").trim(),
		testEventCode: (raw[TRACKING_KEYS.testEventCode] || "").trim(),
		ownerPixelEnabled: on(TRACKING_KEYS.ownerPixelEnabled, true),
		statsEnabled: on(TRACKING_KEYS.statsEnabled, true),
		viewDedupMinutes: Number.isFinite(minutes) && minutes >= 0 ? minutes : 30,
		ownerSourcesEnabled: on(TRACKING_KEYS.ownerSourcesEnabled, true),
	};
}

// Cached per server process for 60s so page views don't hit the DB each time.
export async function getTrackingSettings(fresh = false): Promise<TrackingSettings> {
	if (!fresh && cached && Date.now() - cached.at < TTL_MS) return cached.value;
	let raw: Record<string, string> = {};
	try {
		const rows = await prisma.notifyKey.findMany({
			where: { key: { in: Object.values(TRACKING_KEYS) } },
		});
		raw = Object.fromEntries(rows.map((r) => [r.key, r.value]));
	} catch (e) {
		console.error("tracking settings load failed:", e);
		if (cached) return cached.value;
	}
	const value = parseTrackingSettings(raw);
	cached = { at: Date.now(), value };
	return value;
}

export function clearTrackingSettingsCache() {
	cached = null;
}

export function maskSecret(v: string | null | undefined) {
	if (!v) return "";
	return `••••${v.slice(-4)}`;
}

/** The owner's pixel id if it may run on this campaign's pages, else null. */
export function activeCampaignPixelId(
	c: { metaPixelId: string | null; metaPixelDisabled: boolean } | null | undefined,
	s: TrackingSettings,
): string | null {
	if (!c || !s.ownerPixelEnabled || c.metaPixelDisabled) return null;
	const id = (c.metaPixelId || "").trim();
	return PIXEL_ID_RE.test(id) ? id : null;
}

/** Owner pixel id to load on a public campaign page (null when none/off). */
export async function getCampaignPagePixelId(campaignId: string): Promise<string | null> {
	const [s, c] = await Promise.all([
		getTrackingSettings(),
		prisma.campaign
			.findUnique({ where: { id: campaignId }, select: { metaPixelId: true, metaPixelDisabled: true } })
			.catch(() => null),
	]);
	return activeCampaignPixelId(c, s);
}
