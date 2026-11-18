import { NextResponse } from "next/server";
import { getHomeFeed } from "@/lib/home-feed";

export async function GET() {
	try {
		return NextResponse.json(await getHomeFeed(), {
			headers: {
				"Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
			},
		});
	} catch (error) {
		console.error("GET /api/home error:", error);
		return NextResponse.json(
			{ error: "Failed to load home feed" },
			{ status: 500 },
		);
	}
}
