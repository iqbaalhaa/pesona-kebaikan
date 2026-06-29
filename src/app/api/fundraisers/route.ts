import { NextRequest, NextResponse } from "next/server";
import { getActiveFundraisers } from "@/actions/fundraiser";

export async function GET(req: NextRequest) {
	const limit = Number(req.nextUrl.searchParams.get("limit") ?? 50) || 50;
	try {
		const res = await getActiveFundraisers(limit);
		return NextResponse.json(res, {
			headers: {
				"Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
			},
		});
	} catch (error) {
		console.error("GET /api/fundraisers error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch fundraisers" },
			{ status: 500 },
		);
	}
}
