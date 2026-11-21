import { NextResponse } from "next/server";
import { getTrackingSettings } from "@/lib/tracking-settings";

// Public bits of the tracking settings for the browser (never the CAPI token).
export const dynamic = "force-dynamic";

export async function GET() {
	const s = await getTrackingSettings();
	return NextResponse.json(
		{ pixelId: s.pixelEnabled ? s.pixelId : null },
		{ headers: { "Cache-Control": "public, max-age=60" } },
	);
}
