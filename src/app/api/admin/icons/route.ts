
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/actions/upload";

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

    const validTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp", "image/x-icon"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Supported: JPG, PNG, SVG, WEBP, ICO" },
        { status: 400 }
      );
    }

    if (file.size > 3 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size exceeds 3MB" },
        { status: 400 }
      );
    }

    const uploadForm = new FormData();
    uploadForm.set("file", file);
    const result = await uploadFile(uploadForm);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || "Upload failed" },
        { status: 500 }
      );
    }

    const icon = await prisma.categoryIcon.create({
      data: {
        name,
        url: result.url!,
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
