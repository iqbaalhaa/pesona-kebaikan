import HeroCarousel from "@/components/home/HeroCarousel";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import QuickMenu from "@/components/home/QuickMenu";
import UrgentSection from "@/components/home/UrgentSection";
import CategoryChips from "@/components/home/CategoryChips";
import PopularSection from "@/components/home/PopularSection";

export default function Home() {
	return (
		<Box sx={{ pb: 8 }}>
			<HeroCarousel />
			<QuickMenu />
			<UrgentSection />
			<CategoryChips />
			<PopularSection />
		</Box>
	);
}
