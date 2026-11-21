import { Box, Typography } from "@mui/material";
import CampaignRankingClient from "./CampaignRankingClient";

export default function AdminCampaignStatsRankingPage() {
	return (
		<Box sx={{ p: { xs: 1, md: 2 } }}>
			<Typography variant="h6" fontWeight={800}>
				Statistik Campaign
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
				Funnel semua campaign: dilihat → klik donasi → checkout → dibayar. Klik judul untuk detail per
				sumber & iklan.
			</Typography>
			<CampaignRankingClient />
		</Box>
	);
}
