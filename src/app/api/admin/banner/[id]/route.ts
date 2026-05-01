import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    await prisma.banner.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Banner Delete Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const body = await request.json();
    const { title, image, link, isActive, order } = body;

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title,
        image,
        link,
        isActive,
        order,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Banner Update Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
