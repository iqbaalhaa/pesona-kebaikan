import { getBlogCategories } from "@/services/blogService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await getBlogCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog categories" },
      { status: 500 }
    );
  }
}
