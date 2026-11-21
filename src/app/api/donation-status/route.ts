import { NextResponse } from "next/server";
import { getDonationStatus } from "@/actions/donation";

// Plain GET for the "back from DOKU" screen. A server action can't be used
// there: that screen also calls router.replace/push, and an App Router
// navigation while a server action is in flight drops the action's result —
// so the browser Purchase event never fired.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	const id = new URL(req.url).searchParams.get("id") || "";
	const res = await getDonationStatus(id);
	return NextResponse.json(res, {
		status: res.success ? 200 : 404,
		headers: { "Cache-Control": "no-store" },
	});
}
