import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAID = ["PAID", "paid", "SETTLED", "COMPLETED"];

// Cheap, pollable stats for a campaign card/detail. Uses DB aggregate instead
// of loading every donation row into the app to sum in JS.
export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	try {
		const campaign = await prisma.campaign.findFirst({
			where: { OR: [{ slug }, { id: slug }] },
			select: { id: true, target: true, end: true, status: true },
		});

		if (!campaign) {
			return NextResponse.json(
				{ error: "Campaign not found" },
				{ status: 404 },
			);
		}

		const agg = await prisma.donation.aggregate({
			where: { campaignId: campaign.id, status: { in: PAID } },
			_sum: { amount: true },
			_count: { _all: true },
		});

		const daysLeft = campaign.end
			? Math.max(
					0,
					Math.ceil(
						(new Date(campaign.end).getTime() - Date.now()) /
							(1000 * 60 * 60 * 24),
					),
				)
			: 0;

		return NextResponse.json(
			{
				success: true,
				data: {
					target: Number(campaign.target),
					collected: Number(agg._sum.amount ?? 0),
					donors: agg._count._all,
					daysLeft,
					status: campaign.status,
				},
			},
			{
				headers: {
					"Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
				},
			},
		);
	} catch (error) {
		console.error("GET /api/campaigns/[slug]/stats error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch stats" },
			{ status: 500 },
		);
	}
}
