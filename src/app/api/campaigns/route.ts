import { NextRequest, NextResponse } from "next/server";
import { getCampaigns } from "@/actions/campaign";

// Public, filterable campaign list. Mirrors the params DonationPage builds from
// searchParams so the client can drive the same filters via query string.
export async function GET(req: NextRequest) {
	const sp = req.nextUrl.searchParams;

	const page = Number(sp.get("page") ?? 1) || 1;
	const limit = Number(sp.get("limit") ?? 50) || 50;
	const filter = sp.get("filter") ?? "all";
	const search = sp.get("q") ?? sp.get("search") ?? "";
	// support legacy `kategori` alias
	const categoryName =
		sp.get("category") ?? sp.get("kategori") ?? undefined;
	const isEmergency = sp.get("urgent") === "true";
	const isVerified = sp.get("verified") === "true";
	const sort = sp.get("sort") ?? "newest";
	const startDate = sp.get("startDate") ?? undefined;
	const endDate = sp.get("endDate") ?? undefined;
	const provinceId = sp.get("provinceId") ?? undefined;
	const userId = sp.get("userId") ?? undefined;

	try {
		const res = await getCampaigns(
			page,
			limit,
			filter,
			search,
			userId,
			categoryName,
			isEmergency,
			isVerified,
			sort,
			false,
			startDate,
			endDate,
			provinceId,
		);

		return NextResponse.json(res, {
			headers: {
				"Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
			},
		});
	} catch (error) {
		console.error("GET /api/campaigns error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch campaigns" },
			{ status: 500 },
		);
	}
}
