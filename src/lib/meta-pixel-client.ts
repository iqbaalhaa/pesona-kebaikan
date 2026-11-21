"use client";

import {
	ATTRIBUTION_COOKIE,
	ATTRIBUTION_DAYS,
	VISITOR_COOKIE,
	attributionFromLanding,
} from "@/lib/tracking-source";

type Fbq = ((...args: unknown[]) => void) & {
	callMethod?: (...args: unknown[]) => void;
	queue: unknown[];
	push: Fbq;
	loaded: boolean;
	version: string;
};

declare global {
	interface Window {
		fbq?: Fbq;
		_fbq?: Fbq;
		__pkPixels?: Set<string>;
	}
}

function setCookie(name: string, value: string, days: number) {
	const secure = location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${name}=${value}; path=/; max-age=${days * 86400}; SameSite=Lax${secure}`;
}

function getCookie(name: string) {
	return document.cookie
		.split("; ")
		.find((c) => c.startsWith(`${name}=`))
		?.slice(name.length + 1);
}

/** pk_vid (anonymous visitor id) + pk_src (last non-direct source, 30 days). Idempotent. */
export function ensureVisitorCookies() {
	if (typeof document === "undefined") return;
	if (!getCookie(VISITOR_COOKIE)) {
		const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		setCookie(VISITOR_COOKIE, id, 365);
	}
	const w = window as Window & { __pkAttrDone?: boolean };
	if (w.__pkAttrDone) return;
	w.__pkAttrDone = true;
	const attr = attributionFromLanding(new URL(location.href), document.referrer);
	if (attr) setCookie(ATTRIBUTION_COOKIE, encodeURIComponent(JSON.stringify(attr)), ATTRIBUTION_DAYS);
}

/** Sends a funnel event to /api/track (keepalive so it survives navigation). */
export function trackCampaignEvent(campaignId: string, type: "VIEW" | "DONATE_CLICK", fundraiserId?: string | null) {
	ensureVisitorCookies();
	fetch("/api/track", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ campaignId, fundraiserId, type }),
		keepalive: true,
	}).catch(() => {});
}

let configPromise: Promise<string | null> | null = null;

/** Pesona's pixel id from /admin/settings (null when off). Fetched once per page load. */
export function getGlobalPixelId(): Promise<string | null> {
	if (!configPromise) {
		configPromise = fetch("/api/track/config")
			.then((r) => (r.ok ? r.json() : null))
			.then((j) => (j?.pixelId as string) || null)
			.catch(() => null);
	}
	return configPromise;
}

function loadFbq(): Fbq {
	if (window.fbq) return window.fbq;
	// Meta's standard base snippet, unminified.
	const n = function (...args: unknown[]) {
		if (n.callMethod) n.callMethod(...args);
		else n.queue.push(args);
	} as Fbq;
	n.push = n;
	n.loaded = true;
	n.version = "2.0";
	n.queue = [];
	window.fbq = n;
	window._fbq = n;
	const s = document.createElement("script");
	s.async = true;
	s.src = "https://connect.facebook.net/en_US/fbevents.js";
	document.head.appendChild(s);
	return n;
}

/**
 * Inits a pixel once. Owner (campaign) pixels get autoConfig off so Meta's
 * automatic button/metadata events don't flow to them from other pages; every
 * event is sent with trackSingle so a pixel only gets what we address to it.
 */
export function ensurePixel(pixelId: string, opts: { autoConfig?: boolean } = {}) {
	if (typeof window === "undefined") return;
	const fbq = loadFbq();
	const inited = (window.__pkPixels ||= new Set());
	if (inited.has(pixelId)) return;
	if (opts.autoConfig === false) fbq("set", "autoConfig", false, pixelId);
	fbq("init", pixelId);
	inited.add(pixelId);
}

export function trackPixel(
	pixelIds: (string | null | undefined)[],
	event: string,
	params?: Record<string, unknown>,
	eventId?: string,
) {
	if (typeof window === "undefined" || !window.fbq) return;
	for (const id of new Set(pixelIds.filter(Boolean) as string[])) {
		window.fbq("trackSingle", id, event, params || {}, eventId ? { eventID: eventId } : undefined);
	}
}
