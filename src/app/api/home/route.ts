import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
	getUrgentCampaigns,
	getPopularCampaigns,
	getFeaturedCampaigns,
	getLatestDonations,
	getAllActiveCampaigns,
} from "@/actions/campaign-public";

// Aggregate feed for the home page. Replaces the 8 render-blocking awaits in
// app/page.tsx with a single client-fetchable endpoint.
export async function GET() {
	try {
		const [
			urgentRes,
			popularRes,
			featuredRes,
			donationRes,
			allCampaignsRes,
			carousel,
			featuredTitleRow,
			visibilityKeys,
			banners,
		] = await Promise.all([
			getUrgentCampaigns(10),
			getPopularCampaigns(10),
			getFeaturedCampaigns(10),
			getLatestDonations(10),
			getAllActiveCampaigns(100),
			prisma.carousel.findMany({
				where: { isActive: true },
				orderBy: { order: "asc" },
				include: {
					campaign: {
						select: {
							id: true,
							title: true,
							slug: true,
							media: { where: { isThumbnail: true }, take: 1 },
						},
					},
				},
			}),
			prisma.notifyKey.findUnique({ where: { key: "home_featured_title" } }),
			prisma.notifyKey.findMany({ where: { key: { in: ["home_show_pilihan", "home_show_mendesak"] } } }),
			prisma.banner.findMany({
				where: { isActive: true },
				orderBy: { order: "asc" },
			}),
		]);

		const heroItems = carousel.map((c) => {
			let image = c.image;
			let link = c.link;
			if (c.campaign) {
				if (!image) image = c.campaign.media[0]?.url;
				if (!link) link = `/donasi/${c.campaign.slug || c.campaign.id}`;
			}
			return {
				id: c.id,
				image: image || "/defaultimg.webp",
				link: link || undefined,
				title: c.title || c.campaign?.title || undefined,
			};
		});

		const bannerItems = banners.map((b) => ({
			id: b.id,
			image: b.image,
			title: b.title || undefined,
			link: b.link || undefined,
		}));

		const featuredTitle =
			(featuredTitleRow as any)?.value?.trim() || "Pilihan Pesona Kebaikan";

		const getVis = (key: string) => visibilityKeys.find((k) => k.key === key)?.value;
		const showPilihan = getVis("home_show_pilihan") !== "false";
		const showMendesak = getVis("home_show_mendesak") !== "false";

		return NextResponse.json(
			{
				urgent: Array.isArray(urgentRes.data) ? urgentRes.data : [],
				popular: Array.isArray(popularRes.data) ? popularRes.data : [],
				featured: Array.isArray(featuredRes.data) ? featuredRes.data : [],
				latestDonations: "data" in donationRes ? donationRes.data : [],
				allCampaigns: Array.isArray(allCampaignsRes.data)
					? allCampaignsRes.data
					: [],
				heroItems,
				bannerItems,
				featuredTitle,
				showPilihan,
				showMendesak,
			},
			{
				headers: {
					"Cache-Control":
						"public, s-maxage=30, stale-while-revalidate=120",
				},
			},
		);
	} catch (error) {
		console.error("GET /api/home error:", error);
		return NextResponse.json(
			{ error: "Failed to load home feed" },
			{ status: 500 },
		);
	}
}
