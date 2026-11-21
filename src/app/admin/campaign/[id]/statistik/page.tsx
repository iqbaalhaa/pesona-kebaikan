import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Box, Paper, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { LinkIconButton } from "@/components/ui/LinkButton";
import CampaignStatsPanel from "@/components/stats/CampaignStatsPanel";
import CampaignPixelCard from "@/components/stats/CampaignPixelCard";
import AdLinkBuilder from "@/components/stats/AdLinkBuilder";

// Route is ADMIN-only via proxy.ts; the actions re-check (owner or ADMIN).
export default async function AdminCampaignStatsPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const campaign = await prisma.campaign.findUnique({ where: { id }, select: { id: true, title: true, slug: true } });
	if (!campaign) notFound();

	return (
		<Box sx={{ p: { xs: 1, md: 2 } }}>
			<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
				<LinkIconButton href={`/admin/campaign/${campaign.id}`} color="inherit">
					<ArrowBackRoundedIcon />
				</LinkIconButton>
				<Box>
					<Typography variant="h6" fontWeight={800}>
						Statistik Campaign
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{campaign.title}
					</Typography>
				</Box>
			</Stack>
			<Stack spacing={2}>
				<CampaignStatsPanel campaignId={campaign.id} />
				<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
					<Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
						Buat Link Iklan
					</Typography>
					<AdLinkBuilder campaignSlug={campaign.slug || campaign.id} />
				</Paper>
				<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
					<Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
						Meta Pixel pemilik campaign
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						Admin bisa mengisi, mengganti, menghapus, atau menonaktifkan pixel campaign ini.
					</Typography>
					<CampaignPixelCard campaignId={campaign.id} />
				</Paper>
			</Stack>
		</Box>
	);
}
