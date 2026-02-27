
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = (formData.get("name") as string) || "Untitled";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "image/x-icon"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Supported: JPG, PNG, SVG, WEBP, ICO" },
        { status: 400 }
      );
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 2MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create directory if not exists
    const uploadDir = path.join(process.cwd(), "public/uploads/icons");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const publicUrl = `/uploads/icons/${filename}`;

    await writeFile(filePath, buffer);

    const icon = await prisma.categoryIcon.create({
      data: {
        name,
        url: publicUrl,
      },
    });

    return NextResponse.json({ success: true, icon });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload icon" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const icons = await prisma.categoryIcon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, icons });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch icons" },
      { status: 500 }
    );
  }
}
