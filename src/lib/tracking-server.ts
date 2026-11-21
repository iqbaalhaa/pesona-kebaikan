import { cookies, headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import {
	ATTRIBUTION_COOKIE,
	VISITOR_COOKIE,
	clean,
	parseAttributionCookie,
	type Attribution,
} from "@/lib/tracking-source";

export type RequestTracking = {
	visitorId: string | null;
	attribution: Attribution;
	fbp?: string;
	fbc?: string;
	ip?: string;
	ua?: string;
	url?: string;
};

// Reads the visitor/attribution cookies (written by TrackingInit) and Meta's
// _fbp/_fbc cookies from the current request. Server actions + route handlers.
export async function readRequestTracking(): Promise<RequestTracking> {
	const [jar, h] = await Promise.all([cookies(), headers()]);
	const attribution = parseAttributionCookie(jar.get(ATTRIBUTION_COOKIE)?.value);
	const fbclid = attribution.fbclid;
	const fbc =
		clean(jar.get("_fbc")?.value, 300) ||
		(fbclid ? `fb.1.${attribution.ts || Date.now()}.${fbclid}` : undefined);
	const ip = (h.get("x-forwarded-for") || h.get("x-real-ip") || "").split(",")[0].trim();
	return {
		visitorId: clean(jar.get(VISITOR_COOKIE)?.value, 64)?.replace(/[^\w-]/g, "") || null,
		attribution,
		fbp: clean(jar.get("_fbp")?.value, 300),
		fbc,
		ip: ip.slice(0, 64) || undefined,
		ua: h.get("user-agent")?.slice(0, 400) || undefined,
		url: clean(h.get("referer"), 500),
	};
}

/** Donation columns for the attribution captured on this request. */
export function donationTrackingData(t: RequestTracking) {
	const a = t.attribution;
	return {
		source: a.source,
		utmCampaign: a.utmCampaign ?? null,
		utmContent: a.utmContent ?? null,
		tracking: {
			visitorId: t.visitorId,
			utmSource: a.utmSource,
			utmMedium: a.utmMedium,
			fbclid: a.fbclid,
			fbp: t.fbp,
			fbc: t.fbc,
			ip: t.ip,
			ua: t.ua,
			url: t.url,
		} as Prisma.InputJsonObject,
	};
}

export type DonationTracking = {
	visitorId?: string | null;
	fbp?: string;
	fbc?: string;
	ip?: string;
	ua?: string;
	url?: string;
};
