import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { blogService } from "@/services/blogService";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!["ADMIN", "BLOGGER"].includes(session?.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;

  try {
    const result = await blogService.getBlogs({ page, limit, search, categoryId });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!["ADMIN", "BLOGGER"].includes(session?.user?.role || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, content, categoryId, heroImage } = body;

    if (!title || !content || !categoryId) {
        return NextResponse.json({ error: "Title, content, and categoryId are required" }, { status: 400 });
    }

    const blog = await blogService.createBlog({
      title,
      content,
      categoryId,
      createdById: session.user.id,
      heroImage,
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
