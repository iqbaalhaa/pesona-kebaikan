"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ensurePixel, ensureVisitorCookies, getGlobalPixelId, trackPixel } from "@/lib/meta-pixel-client";

// Root-layout tracker: visitor/attribution cookies + Pesona pixel PageView on
// every App Router navigation. Admin pages are not tracked.
export default function TrackingInit() {
	const pathname = usePathname();

	useEffect(() => {
		ensureVisitorCookies();
	}, []);

	useEffect(() => {
		if (!pathname || pathname.startsWith("/admin")) return;
		let cancelled = false;
		getGlobalPixelId().then((id) => {
			if (cancelled || !id) return;
			ensurePixel(id);
			trackPixel([id], "PageView");
		});
		return () => {
			cancelled = true;
		};
	}, [pathname]);

	return null;
}
