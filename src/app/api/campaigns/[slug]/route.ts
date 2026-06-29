import { NextResponse } from "next/server";
import { getCampaignBySlug } from "@/actions/campaign";

// Single campaign by slug (falls back to id inside the action).
// Static siblings (popular, categories, check-slug) take priority over this
// dynamic segment, so they are unaffected.
export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	try {
		const res = await getCampaignBySlug(slug);
		if (!res.success || !res.data) {
			return NextResponse.json(
				{ error: "Campaign not found" },
				{ status: 404 },
			);
		}
		return NextResponse.json(res, {
			headers: {
				"Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
			},
		});
	} catch (error) {
		console.error("GET /api/campaigns/[slug] error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch campaign" },
			{ status: 500 },
		);
	}
}
