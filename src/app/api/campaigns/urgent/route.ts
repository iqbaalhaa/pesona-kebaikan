import { NextRequest, NextResponse } from "next/server";
import { getUrgentCampaigns } from "@/actions/campaign-public";

export async function GET(req: NextRequest) {
	const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10) || 10;
	try {
		const res = await getUrgentCampaigns(limit);
		return NextResponse.json(res, {
			headers: {
				"Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
			},
		});
	} catch (error) {
		console.error("GET /api/campaigns/urgent error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch urgent campaigns" },
			{ status: 500 },
		);
	}
}
