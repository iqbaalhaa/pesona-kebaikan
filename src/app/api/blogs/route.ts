import { getBlogs } from "@/services/blogService";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const categoryId = searchParams.get("categoryId") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const data = await getBlogs(page, limit, categoryId, search);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
