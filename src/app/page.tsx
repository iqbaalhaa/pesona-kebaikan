import HeroCarousel from "@/components/home/HeroCarousel";
import Box from "@mui/material/Box";
import QuickMenu from "@/components/home/QuickMenu";
import UrgentSection from "@/components/home/UrgentSection";
import CategoryChips from "@/components/home/CategoryChips";
import PopularSection from "@/components/home/PopularSection";
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
} from "@/actions/campaign";
import type { Campaign } from "@/types";

export default async function Home() {
	const [urgentRes, popularRes, donationRes, allCampaignsRes] =
		await Promise.all([
			getUrgentCampaigns(10),
			getPopularCampaigns(10),
			getLatestDonations(10),
			getAllActiveCampaigns(100),
		]);

	const urgentCampaigns: Campaign[] = Array.isArray(urgentRes.data)
		? urgentRes.data
		: [];
	const popularCampaigns: Campaign[] = Array.isArray(popularRes.data)
		? popularRes.data
		: [];
	const latestDonations = "data" in donationRes ? donationRes.data : [];
	const allCampaigns: Campaign[] = Array.isArray(allCampaignsRes.data)
		? allCampaignsRes.data
		: [];

	return (
		<Box>
			<HeroCarousel campaigns={popularCampaigns} />
			<QuickDonate campaigns={popularCampaigns.slice(0, 5)} />
			<QuickMenu />
			<UrgentSection campaigns={urgentCampaigns} />
			<CategoryChips campaigns={allCampaigns} />
			<PopularSection campaigns={popularCampaigns} />
			<TrustStrip />
			<DonationBanner />
			<PrayerSection prayers={latestDonations} />
			<FundraiserCTA />
			<MiniFooter />
		</Box>
	);
}
