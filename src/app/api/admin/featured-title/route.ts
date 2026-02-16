import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const key = await prisma.notifyKey.findUnique({
      where: { key: "home_featured_title" },
    });
    return NextResponse.json({ title: key?.value || "Pilihan Kitabisa" });
  } catch (error) {
    console.error("Featured Title API Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
