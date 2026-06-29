import { permanentRedirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Short-link support: /<slug> -> 301 -> /donasi/<slug> (canonical).
// Static top-level routes (admin, blog, donasi, ...) take precedence over this
// dynamic segment, so only unmatched single-segment paths reach here.

type Props = {
	params: Promise<{ slug: string }>;
};

export default async function ShortLinkRedirect({ params }: Props) {
	const { slug } = await params;

	// Resolve by slug, then by id — mirrors getCampaignBySlug's lookup order.
	const campaign =
		(await prisma.campaign.findUnique({
			where: { slug },
			select: { slug: true, id: true },
		})) ||
		(await prisma.campaign.findUnique({
			where: { id: slug },
			select: { slug: true, id: true },
		}));

	if (!campaign) {
		notFound();
	}

	permanentRedirect(`/donasi/${campaign.slug || campaign.id}`);
}
