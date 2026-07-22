import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const items: { id: string; order: number }[] = body;
    await Promise.all(
      items.map((item) =>
        prisma.carousel.update({ where: { id: item.id }, data: { order: item.order } })
      )
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Carousel PATCH Order Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const carousels = await prisma.carousel.findMany({
      orderBy: { order: "asc" },
      include: {
        campaign: {
          select: {
            title: true,
            slug: true,
            media: {
              where: { isThumbnail: true },
              take: 1,
            },
          },
        },
      },
    });
    return NextResponse.json(carousels);
  } catch (error) {
    console.error("Carousel GET Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, image, link, campaignId, isActive } = body;

    const carousel = await prisma.carousel.create({
      data: {
        title,
        image,
        link,
        campaignId: campaignId || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(carousel);
  } catch (error) {
    console.error("Carousel Create Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
