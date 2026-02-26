import { prisma } from "@/lib/prisma";
import { CATEGORY_TITLE } from "@/lib/constants";
import { redirect } from "next/navigation";

export default async function KategoriIdPage({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams?: { sort?: string };
}) {
	const categorySlug = params.id;
	const sortKey = searchParams?.sort || "newest";

	// Resolve category display name from slug or fall back to DB
	let categoryName = CATEGORY_TITLE[categorySlug];
	if (!categoryName) {
		const cat = await prisma.campaignCategory.findFirst({
			where: {
				OR: [{ slug: categorySlug }, { name: categorySlug }],
			},
			select: { name: true },
		});
		categoryName = cat?.name || categorySlug;
	}

	const qs = new URLSearchParams();
	if (categoryName && categoryName !== "Semua") {
		qs.set("category", categoryName);
	}
	if (sortKey) qs.set("sort", sortKey);

	redirect(`/donasi?${qs.toString()}`);
}
