import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const campaigns = await prisma.campaign.findMany({
			// `status` doesn't auto-flip when `end` passes (no cron job for that),
			// so an ended campaign can still read status:"ACTIVE" — always pair
			// the two, same convention as the public-facing campaign queries.
			where: {
				status: "ACTIVE",
				OR: [{ end: null }, { end: { gte: new Date() } }],
			},
			select: {
				id: true,
				title: true,
				slug: true,
				media: {
					where: { isThumbnail: true },
					take: 1,
				},
			},
			orderBy: { createdAt: "desc" },
		});

		const formatted = campaigns.map((c) => ({
			id: c.id,
			title: c.title,
			slug: c.slug,
			cover: c.media[0]?.url || "",
		}));

		return NextResponse.json(formatted);
	} catch (error) {
		console.error("Campaign List Error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
