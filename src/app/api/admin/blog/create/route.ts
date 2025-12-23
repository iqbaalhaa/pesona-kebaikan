import { NextRequest, NextResponse } from "next/server";
// Ganti import prisma agar pasti dari output prisma generate
import { prisma } from "@/lib/prisma";
import { JSDOM } from "jsdom";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, categoryId, heroImage, content, createdById } = body;

    // Logging untuk debug input
    console.log("POST /api/admin/blog/create", { title, categoryId, heroImage, createdById, contentLength: content?.length });
    // Tambahkan log user
    const user = await prisma.user.findUnique({ where: { id: createdById } });
    console.log("User found:", user);

    // Validasi
    if (!title || !categoryId || !heroImage || !content || !createdById) {
      return NextResponse.json({ success: false, error: "Semua field wajib diisi" }, { status: 400 });
    }

    // Pastikan user dengan id createdById ada
    if (!user) {
      return NextResponse.json({ success: false, error: `User dengan id '${createdById}' tidak ditemukan.` }, { status: 400 });
    }

    // Parse gallery dari konten (ambil semua <img> dan <iframe>)
    const dom = new JSDOM(content);
    const imgs = Array.from(dom.window.document.querySelectorAll("img"))
      .map((img) => {
        const el = img as HTMLImageElement;
        return {
          type: "image" as const,
          url: el.getAttribute("src")?.replace(/^\//, "") || "",
        };
      })
      .filter((m) => m.url);
    const iframes = Array.from(dom.window.document.querySelectorAll("iframe"))
      .map((el) => {
        const iframe = el as HTMLIFrameElement;
        return {
          type: "video" as const,
          url: iframe.getAttribute("src") || "",
        };
      })
      .filter((m) => m.url);

    const gallery: { type: "image" | "video"; url: string }[] = [...imgs, ...iframes];

    // Simpan Blog
    const blog = await prisma.blog.create({
      data: {
        title,
        content, // pastikan field ini ada di schema
        heroImage,
        category: { connect: { id: categoryId } },
        createdBy: { connect: { id: createdById } },
        gallery: {
          create: gallery.map((m) => ({
            type: m.type,
            url: m.url,
          })),
        },
      },
    });

    // Logging hasil simpan
    console.log("Blog created:", blog.id);

    return NextResponse.json({ success: true, id: blog.id });
  } catch (e: any) {
    console.error("Error in POST /api/admin/blog/create:", e);
    return NextResponse.json({ success: false, error: e.message || "Terjadi kesalahan" }, { status: 500 });
  }
}

// Endpoint GET untuk uji API (ambil 5 blog terakhir, lengkap dengan relasi)
export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        content: true,
        heroImage: true,
        createdAt: true,
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
          },
        },
      },
    });
    return NextResponse.json({ success: true, blogs });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Terjadi kesalahan" }, { status: 500 });
  }
}

// Endpoint untuk membuat user dummy (khusus development/testing)
export async function PUT(req: NextRequest) {
  try {
    const id = "ADMIN_ID";
    const email = "admin_id@dummy.local";
    // Cek jika sudah ada
    let user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id,
          name: "Admin Dummy",
          email,
        },
      });
    }
    return NextResponse.json({ success: true, user });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message || "Gagal membuat user dummy" }, { status: 500 });
  }
}
