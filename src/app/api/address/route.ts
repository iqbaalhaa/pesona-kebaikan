import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "province") {
      const provinces = await prisma.province.findMany({
        orderBy: { name: "asc" },
      });
      return NextResponse.json(provinces);
    }

    if (type === "regency") {
      const provinceId = searchParams.get("provinceId");
      if (!provinceId) {
        return NextResponse.json(
          { error: "Province ID is required" },
          { status: 400 }
        );
      }
      const regencies = await prisma.regency.findMany({
        where: { provinceId },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(regencies);
    }

    return NextResponse.json(
      { error: "Invalid type parameter" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Address API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
