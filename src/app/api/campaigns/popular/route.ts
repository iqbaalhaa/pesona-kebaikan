import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Campaign } from "@/types";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        category: true,
        createdBy: true,
        media: true,
        donations: {
          where: {
            status: "COMPLETED"
          }
        },
      },
      take: 10,
      orderBy: {
        donations: {
          _count: 'desc'
        }
      },
    });

    console.log("Fetched popular campaigns:", campaigns.length);

    if (campaigns.length === 0) {
      // Return empty array instead of dummy data if no campaigns found
      // Frontend will handle empty state
      return NextResponse.json([]);
    }

    const mappedCampaigns: Campaign[] = campaigns.map((c) => {
      // Calculate collected amount
      const collected = c.donations.reduce((acc, curr) => acc + Number(curr.amount), 0);

      // Calculate days left
      const daysLeft = c.end
        ? Math.ceil((new Date(c.end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: c.id,
        title: c.title,
        organizer: c.createdBy.name || "Anonymous",
        category: c.category.name,
        cover: c.media.find((m) => m.isThumbnail)?.url || c.media[0]?.url || "/defaultimg.webp",
        target: Number(c.target),
        collected: collected,
        donors: c.donations.length,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        latestUpdate: "", 
      };
    });

    return NextResponse.json(mappedCampaigns);
  } catch (error) {
    console.error("Error fetching popular campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
