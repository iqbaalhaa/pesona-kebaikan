import { prisma } from "@/lib/prisma";
import {
	getUrgentCampaigns,
	getPopularCampaigns,
	getFeaturedCampaigns,
	getLatestDonations,
	getAllActiveCampaigns,
} from "@/actions/campaign-public";

// Aggregate feed for the home page — rendered into "/" (ISR) and also served
// by /api/home. Throws on DB errors; callers decide the fallback.
export async function getHomeFeed() {
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

	const heroItems = carousel
		.map((c) => {
			let image = c.image;
			let link = c.link;
			if (c.campaign) {
				if (!image) image = c.campaign.media[0]?.url;
				if (!link) link = `/donasi/${c.campaign.slug || c.campaign.id}`;
			}
			return {
				id: c.id,
				image,
				link: link || undefined,
				title: c.title || c.campaign?.title || undefined,
			};
		})
		// A carousel slide with no image is a misconfigured admin entry —
		// skip it rather than papering over it with a generic stock photo.
		.filter((c): c is typeof c & { image: string } => Boolean(c.image));

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

	return {
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
	};
}

export type HomeFeedData = Awaited<ReturnType<typeof getHomeFeed>>;
