import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    /* ---------------- query params ---------------- */
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const search = searchParams.get("q") || "";
    const category = searchParams.get("category"); // name atau id
    const skip = (page - 1) * limit;

    /* ---------------- where clause ---------------- */
    const where: any = {
      ...(search && {
        title: {
          contains: search,
          mode: "insensitive",
        },
      }),
      ...(category && {
        category: {
          OR: [
            { id: category },
            { name: { equals: category, mode: "insensitive" } },
          ],
        },
      }),
    };

    /* ---------------- query ---------------- */
    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          gallery: {
            select: {
              id: true,
              type: true,
              url: true,
            },
          },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    /* ---------------- map response ---------------- */
    const data = blogs.map((b) => ({
      id: b.id,
      title: b.title,
      excerpt: b.content.slice(0, 160), // preview admin
      headerImage: b.headerImage,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      category: b.category,
      author: b.createdBy,
      gallery: b.gallery,
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[GET BLOG ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data blog" },
      { status: 500 }
    );
  }
}
