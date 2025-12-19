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

export default function Home() {
	return (
		<Box sx={{ pb: 8 }}>
			<HeroCarousel />
			<QuickDonate />
			<QuickMenu />
			<UrgentSection />
			<CategoryChips />
			<PopularSection />
			<TrustStrip />
			<DonationBanner />
			<PrayerSection />
			<FundraiserCTA />
			<MiniFooter />
		</Box>
	);
}
