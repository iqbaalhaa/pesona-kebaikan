import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
	try {
		const campaigns = await prisma.campaign.findMany({
			where: { isEmergency: true, status: "ACTIVE" },
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
			cover: c.media[0]?.url || "/defaultimg.webp",
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
