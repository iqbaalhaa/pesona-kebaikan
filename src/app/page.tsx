import HeroCarousel, { CarouselItem } from "@/components/home/HeroCarousel";
import Box from "@mui/material/Box";
import QuickMenu from "@/components/home/QuickMenu";
import UrgentSection from "@/components/home/UrgentSection";
import CategoryChips from "@/components/home/CategoryChips";
import PopularSection from "@/components/home/PopularSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import TrustStrip from "@/components/home/TrustStrip";
import DonationBanner from "@/components/home/DonationBanner";
import PrayerSection from "@/components/home/PrayerSection";
import FundraiserCTA from "@/components/home/FundraiserCTA";
import MiniFooter from "@/components/home/MiniFooter";
import QuickDonate from "@/components/home/QuickDonate";
import {
	getPopularCampaigns,
	getUrgentCampaigns,
	getLatestDonations,
	getAllActiveCampaigns,
	getFeaturedCampaigns,
} from "@/actions/campaign";
import type { Campaign } from "@/types";
import { prisma } from "@/lib/prisma";
import type { Category } from "@/types";

export default async function Home() {
	const [
		urgentRes,
		popularRes,
		featuredRes,
		donationRes,
		allCampaignsRes,
		carouselRes,
		featuredTitleRes,
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
						media: {
							where: { isThumbnail: true },
							take: 1,
						},
					},
				},
			},
		}),
		prisma.notifyKey.findUnique({ where: { key: "home_featured_title" } }),
	]);

	const urgentCampaigns: Campaign[] = Array.isArray(urgentRes.data)
		? urgentRes.data
		: [];
	const popularCampaigns: Campaign[] = Array.isArray(popularRes.data)
		? popularRes.data
		: [];
	const featuredCampaigns: Campaign[] = Array.isArray(featuredRes.data)
		? featuredRes.data
		: [];
	const latestDonations = "data" in donationRes ? donationRes.data : [];
	const allCampaigns: Campaign[] = Array.isArray(allCampaignsRes.data)
		? allCampaignsRes.data
		: [];

	const heroItems: CarouselItem[] = carouselRes.map((c) => {
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

	// Category chips will handle its own category icons and defaults
	const featuredTitle =
		(featuredTitleRes as any)?.value?.trim() || "Pilihan Kitabisa";

	return (
		<Box sx={{ pb: 2 }}>
			<HeroCarousel items={heroItems} />
			<QuickDonate />
			<QuickMenu />
			<FeaturedSection campaigns={featuredCampaigns} title={featuredTitle} />
			<UrgentSection campaigns={urgentCampaigns} />
			<CategoryChips campaigns={allCampaigns} />
			<PopularSection campaigns={popularCampaigns} />
			<PrayerSection prayers={latestDonations} />
			<TrustStrip />
			<DonationBanner />
			<FundraiserCTA />
			<MiniFooter />
		</Box>
	);
}
