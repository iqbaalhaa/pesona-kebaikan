import { NextRequest, NextResponse } from "next/server";
import { getFeaturedCampaigns } from "@/actions/campaign-public";

export async function GET(req: NextRequest) {
	const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10) || 10;
	try {
		const res = await getFeaturedCampaigns(limit);
		return NextResponse.json(res, {
			headers: {
				"Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
			},
		});
	} catch (error) {
		console.error("GET /api/campaigns/featured error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch featured campaigns" },
			{ status: 500 },
		);
	}
}
