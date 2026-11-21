import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { LinkIconButton } from "@/components/ui/LinkButton";
import CampaignStatsPanel from "@/components/stats/CampaignStatsPanel";
import CampaignPixelCard from "@/components/stats/CampaignPixelCard";

export default async function OwnerCampaignStatsPage({ params }: { params: Promise<{ slug: string }> }) {
	const session = await auth();
	if (!session?.user?.id) redirect("/auth/login");
	const { slug } = await params;

	const campaign = await prisma.campaign.findFirst({
		where: { OR: [{ slug }, { id: slug }] },
		select: { id: true, slug: true, title: true, createdById: true },
	});
	if (!campaign) notFound();
	if (campaign.createdById !== session.user.id && session.user.role !== "ADMIN") notFound();

	return (
		<Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 12 }}>
			<Box sx={{ position: "sticky", top: 0, zIndex: 1100, bgcolor: "white", borderBottom: "1px solid", borderColor: "divider" }}>
				<Container maxWidth="md" sx={{ px: 2 }}>
					<Stack direction="row" alignItems="center" spacing={1} sx={{ height: 60 }}>
						<LinkIconButton href={`/galang-dana/${campaign.slug || campaign.id}`} edge="start" color="inherit">
							<ArrowBackRoundedIcon />
						</LinkIconButton>
						<Box sx={{ minWidth: 0 }}>
							<Typography variant="h6" fontWeight={700} fontSize={18}>
								Statistik Campaign
							</Typography>
							<Typography variant="caption" color="text.secondary" noWrap display="block">
								{campaign.title}
							</Typography>
						</Box>
					</Stack>
				</Container>
			</Box>
			<Container maxWidth="md" sx={{ px: 2, mt: 2 }}>
				<Stack spacing={2}>
					<CampaignStatsPanel campaignId={campaign.id} />
					<Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
						<Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
							Meta Pixel Anda
						</Typography>
						<CampaignPixelCard campaignId={campaign.id} />
					</Paper>
				</Stack>
			</Container>
		</Box>
	);
}
