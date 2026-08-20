import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const campaigns = await prisma.campaign.findMany({
			// Same as campaign-list/featured-campaigns: status alone doesn't
			// guarantee not-expired, so a pinned-but-ended campaign would
			// otherwise keep showing here forever.
			where: {
				isEmergency: true,
				status: "ACTIVE",
				OR: [{ end: null }, { end: { gte: new Date() } }],
			},
			select: {
				id: true,
				title: true,
				slug: true,
				end: true,
				media: { where: { isThumbnail: true }, take: 1 },
			},
			orderBy: { end: "asc" },
		});

		const now = Date.now();
		const formatted = campaigns.map((c) => ({
			id: c.id,
			title: c.title,
			slug: c.slug,
			cover: c.media[0]?.url || "",
			daysLeft: c.end
				? Math.max(0, Math.ceil((new Date(c.end).getTime() - now) / 86400000))
				: null,
		}));

		return NextResponse.json(formatted);
	} catch (error) {
		console.error("Emergency Campaigns Error:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
