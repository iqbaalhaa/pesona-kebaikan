import { getBlogs, getBlogCategories } from "@/services/blogService";
import BlogListClient from "./BlogListClient";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const categoryParam = resolvedSearchParams.category;
  const categoryFilter =
    typeof categoryParam === "string" && categoryParam !== "Semua"
      ? categoryParam
      : undefined;

  // First fetch categories to map name to ID if needed, or just use names if service supports filtering by name.
  // The service I wrote supports filtering by `categoryId`. But the UI uses names (tags).
  // So I should probably fetch categories first, find the ID for the name, and then call getBlogs.
  // OR update getBlogs to filter by category name.
  // Let's check getBlogs implementation. It uses `categoryId`.
  
  const categoriesData = await getBlogCategories();
  const categoryNames = categoriesData.map((c) => c.name);

  let categoryId: string | undefined;
  if (categoryFilter) {
    const category = categoriesData.find((c) => c.name === categoryFilter);
    if (category) {
      categoryId = category.id;
    }
  }

  const { blogs } = await getBlogs(1, 100, categoryId); // Fetching 100 for now to mimic "load all" behavior within reason

  const mappedPosts = blogs.map((blog) => {
    // Find thumbnail or first image
    const cover =
      blog.headerImage ||
      blog.gallery.find((m) => m.type === "image")?.url ||
      "/defaultimg.webp";

    // Create excerpt from content (strip HTML if needed, or just take substring)
    const plainTextContent = blog.content.replace(/<[^>]*>?/gm, '');
    const excerpt =
      plainTextContent.length > 100
        ? plainTextContent.substring(0, 100) + "..."
        : plainTextContent;

    return {
      id: blog.id,
      title: blog.title,
      excerpt: excerpt,
      cover: cover,
      date: new Date(blog.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      tag: blog.category?.name || "Uncategorized",
    };
  });

  return <BlogListClient posts={mappedPosts} categories={categoryNames} />;
}
