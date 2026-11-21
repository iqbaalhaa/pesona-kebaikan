// Pure helpers shared by the browser (cookie writer) and the server (event /
// donation attribution). No framework imports.

export const VISITOR_COOKIE = "pk_vid";
export const ATTRIBUTION_COOKIE = "pk_src";
export const ATTRIBUTION_DAYS = 30;

export type Attribution = {
	source: string;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
	utmContent?: string;
	fbclid?: string;
	ts?: number;
};

export const SOURCE_LABELS: Record<string, string> = {
	facebook: "Facebook",
	instagram: "Instagram",
	whatsapp: "WhatsApp",
	google: "Google",
	tiktok: "TikTok",
	twitter: "X / Twitter",
	youtube: "YouTube",
	referral: "Situs lain",
	direct: "Langsung",
};

export function sourceLabel(source: string | null | undefined) {
	if (!source) return "Tidak diketahui";
	return SOURCE_LABELS[source] || source;
}

const ALIASES: [RegExp, string][] = [
	[/^(fb|facebook|meta)/, "facebook"],
	[/^(ig|instagram)/, "instagram"],
	[/^(wa|whatsapp)/, "whatsapp"],
	[/^google/, "google"],
	[/^tiktok/, "tiktok"],
	[/^(x|twitter|tw)$/, "twitter"],
	[/^(yt|youtube)/, "youtube"],
];

const REFERRER_HOSTS: [RegExp, string][] = [
	[/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
	[/(^|\.)instagram\.com$/, "instagram"],
	[/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"],
	[/(^|\.)google\.[a-z.]+$/, "google"],
	[/(^|\.)tiktok\.com$/, "tiktok"],
	[/(^|\.)(t\.co|twitter\.com|x\.com)$/, "twitter"],
	[/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
];

/** Trim and keep a safe charset; external input (URL params, cookies). */
export function clean(v: unknown, max = 100): string | undefined {
	if (typeof v !== "string") return undefined;
	const s = v.trim().replace(/[^\p{L}\p{N} _.\-:|/]/gu, "").slice(0, max);
	return s || undefined;
}

export function classifySource(input: {
	utmSource?: string | null;
	fbclid?: string | null;
	referrer?: string | null;
	selfHost?: string | null;
}): string {
	const utm = (input.utmSource || "").trim().toLowerCase();
	if (utm) {
		for (const [re, name] of ALIASES) if (re.test(utm)) return name;
		return utm.replace(/[^a-z0-9_-]/g, "").slice(0, 30) || "referral";
	}
	if (input.fbclid) return "facebook";
	if (input.referrer) {
		let host = "";
		try {
			host = new URL(input.referrer).hostname.toLowerCase();
		} catch {
			return "direct";
		}
		if (!host || host === input.selfHost) return "direct";
		for (const [re, name] of REFERRER_HOSTS) if (re.test(host)) return name;
		return "referral";
	}
	return "direct";
}

/** Attribution from a landing URL + referrer, or null when nothing new (keep old cookie). */
export function attributionFromLanding(url: URL, referrer: string): Attribution | null {
	const p = url.searchParams;
	const utmSource = clean(p.get("utm_source"));
	const fbclid = clean(p.get("fbclid"), 255);
	const source = classifySource({ utmSource, fbclid, referrer, selfHost: url.hostname });
	if (!utmSource && !fbclid && source === "direct") return null;
	return {
		source,
		utmSource,
		utmMedium: clean(p.get("utm_medium")),
		utmCampaign: clean(p.get("utm_campaign")),
		utmContent: clean(p.get("utm_content")),
		fbclid,
		ts: Date.now(),
	};
}

export function parseAttributionCookie(raw: string | undefined | null): Attribution {
	if (!raw) return { source: "direct" };
	try {
		const j = JSON.parse(decodeURIComponent(raw));
		return {
			source: clean(j.source, 30) || "direct",
			utmSource: clean(j.utmSource),
			utmMedium: clean(j.utmMedium),
			utmCampaign: clean(j.utmCampaign),
			utmContent: clean(j.utmContent),
			fbclid: clean(j.fbclid, 255),
			ts: Number.isFinite(j.ts) ? j.ts : undefined,
		};
	} catch {
		return { source: "direct" };
	}
}

const BOT_RE =
	/bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|whatsapp\/|preview|headless|lighthouse|pingdom|curl\/|wget|python|axios|node-fetch|go-http/i;

export function isBotUserAgent(ua: string | null | undefined) {
	return !ua || BOT_RE.test(ua);
}
