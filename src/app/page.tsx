import Box from "@mui/material/Box";
import HomeFeed from "@/components/home/HomeFeed";
import ExploreSection from "@/components/home/ExploreSection";
import MiniFooter from "@/components/home/MiniFooter";

// Static shell. All volatile data is fetched client-side via /api/home inside
// HomeFeed, so this page no longer blocks render on the database.
export const dynamic = "force-static";

export default function Home() {
	return (
		<Box sx={{ pb: 2 }}>
			<HomeFeed />
			<ExploreSection />
			<MiniFooter />
		</Box>
	);
}
