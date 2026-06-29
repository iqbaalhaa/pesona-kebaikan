import { NextRequest, NextResponse } from "next/server";
import { getLatestDonations } from "@/actions/campaign-public";

// Prayer/donation feed (home + campaign detail). Safe to poll client-side.
export async function GET(req: NextRequest) {
	const limit = Number(req.nextUrl.searchParams.get("limit") ?? 10) || 10;
	try {
		const res = await getLatestDonations(limit);
		return NextResponse.json(res, {
			headers: {
				// shorter TTL: feed updates frequently
				"Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
			},
		});
	} catch (error) {
		console.error("GET /api/donations/latest error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch donations" },
			{ status: 500 },
		);
	}
}
