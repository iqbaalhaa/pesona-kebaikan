import { blogService } from "@/services/blogService";
import BlogListClient from "./BlogListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Blog | Pesona Kebaikan",
	description:
		"Kumpulan artikel inspiratif seputar donasi, galang dana, dan kisah kebaikan di Pesona Kebaikan.",
	openGraph: {
		title: "Blog | Pesona Kebaikan",
		description:
			"Kumpulan artikel inspiratif seputar donasi, galang dana, dan kisah kebaikan di Pesona Kebaikan.",
		url: "/blog",
		siteName: "Pesona Kebaikan",
		type: "website",
	},
};

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

	const categoriesData = await blogService.getBlogCategories();
	const categoryNames = categoriesData.map((c) => c.name);

	let categoryId: string | undefined;
	if (categoryFilter) {
		const category = categoriesData.find((c) => c.name === categoryFilter);
		if (category) {
			categoryId = category.id;
		}
	}

	const { data: blogs } = await blogService.getBlogs({
		page: 1,
		limit: 100,
		categoryId,
	});

	const mappedPosts = blogs.map((blog) => {
		const contentImageMatch = blog.content.match(
			/<img[^>]+src=["']([^"']+)["']/i,
		);
		const contentImage = contentImageMatch ? contentImageMatch[1] : null;

		const hasHeroImage = blog.heroImage && blog.heroImage.trim().length > 0;

		const cover =
			(hasHeroImage ? blog.heroImage : null) ||
			contentImage ||
			blog.gallery?.find((m) => m.type === "image")?.url ||
			"/defaultimg.webp";

		const plainTextContent = blog.content.replace(/<[^>]*>?/gm, "");
		const excerpt =
			plainTextContent.length > 100
				? `${plainTextContent.substring(0, 100)}...`
				: plainTextContent;

		return {
			id: blog.id,
			title: blog.title,
			excerpt,
			cover,
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
