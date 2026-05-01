import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.error("Banner GET Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, image, link, isActive } = body;

    const banner = await prisma.banner.create({
      data: {
        title,
        image,
        link,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Banner Create Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
