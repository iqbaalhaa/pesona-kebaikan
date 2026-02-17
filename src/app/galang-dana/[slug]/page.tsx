import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { LinkButton, LinkIconButton } from "@/components/ui/LinkButton";
import OwnerDonationHistory from "@/components/campaign/OwnerDonationHistory";
import OwnerExtendTargetButton from "@/components/campaign/OwnerExtendTargetButton";
import { CATEGORY_TITLE } from "@/lib/constants";
import {
	Box,
	Container,
	Typography,
	Stack,
	Card,
	CardContent,
	Chip,
	Divider,
	LinearProgress,
	Avatar,
	Paper,
	IconButton,
	Button,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";

export default async function CampaignDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const session = await auth();
	if (!session?.user?.id) {
		redirect("/auth/login");
	}

	const { slug } = await params;

	const campaign = await prisma.campaign.findFirst({
		where: {
			OR: [{ slug }, { id: slug }],
		},
		include: {
			category: true,
			media: true,
			donations: {
				orderBy: { createdAt: "desc" },
			},
		},
	});

	if (!campaign) {
		notFound();
	}

	const isQuickDonate = campaign.slug === "donasi-cepat";

	const categoryKey =
		Object.keys(CATEGORY_TITLE).find(
			(key) => CATEGORY_TITLE[key] === campaign.category.name,
		) || "lainnya";

	const type = categoryKey === "medis" ? "sakit" : "lainnya";

	if (
		campaign.createdById !== session.user.id &&
		session.user.role !== "ADMIN"
	) {
		return (
			<Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
				<Typography variant="h5" fontWeight={700} gutterBottom>
					Akses Ditolak
				</Typography>
				<Typography color="text.secondary" sx={{ mb: 3 }}>
					Anda tidak memiliki izin untuk mengelola campaign ini.
				</Typography>
				<LinkButton href="/galang-dana" variant="contained">
					Kembali
				</LinkButton>
			</Container>
		);
	}

	const donations = campaign.donations;
	const donationItems = donations.map((d: any) => ({
		id: d.id,
		donorName: d.donorName,
		isAnonymous: d.isAnonymous,
		amount: Number(d.amount),
		status: d.status,
		message: d.message,
		createdAt: d.createdAt.toISOString(),
	}));
	const successfulDonations = donations.filter((d: any) =>
		["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status),
	);
	const totalCollected = successfulDonations.reduce(
		(acc, d) => acc + Number(d.amount),
		0,
	);
	const donorCount = new Set(
		successfulDonations.map((d) => d.userId || d.donorPhone || d.id),
	).size;

	const progress = Math.min(
		100,
		Math.round((totalCollected / Number(campaign.target)) * 100),
	);

	const daysLeft = campaign.end
		? Math.ceil(
				(new Date(campaign.end).getTime() - new Date().getTime()) /
					(1000 * 60 * 60 * 24),
			)
		: 0;

	return (
		<Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 12 }}>
			{/* Mobile Header */}
			<Box
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 1100,
					bgcolor: "white",
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Container maxWidth="sm" sx={{ px: 2 }}>
					<Stack
						direction="row"
						alignItems="center"
						justifyContent="space-between"
						sx={{ height: 60 }}
					>
						<Stack direction="row" alignItems="center" spacing={1}>
							<LinkIconButton href="/galang-dana" edge="start" color="inherit">
								<ArrowBackRoundedIcon />
							</LinkIconButton>
							<Typography variant="h6" fontWeight={700} fontSize={18}>
								Dashboard
							</Typography>
						</Stack>
						<Chip
							label={campaign.status}
							color={campaign.status === "ACTIVE" ? "success" : "default"}
							size="small"
							sx={{
								fontWeight: 700,
								borderRadius: 1.5,
								height: 24,
								fontSize: 11,
							}}
						/>
					</Stack>
				</Container>
			</Box>

			<Container maxWidth="sm" sx={{ px: 2, mt: 2 }}>
				{/* Main Stats Card */}
				<Card
					elevation={0}
					sx={{
						borderRadius: 4,
						background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
						color: "white",
						mb: 3,
						position: "relative",
						overflow: "hidden",
					}}
				>
					{/* Decorative circles */}
					<Box
						sx={{
							position: "absolute",
							top: -20,
							right: -20,
							width: 100,
							height: 100,
							borderRadius: "50%",
							bgcolor: "rgba(255,255,255,0.05)",
						}}
					/>
					<Box
						sx={{
							position: "absolute",
							bottom: -40,
							left: -20,
							width: 150,
							height: 150,
							borderRadius: "50%",
							bgcolor: "rgba(255,255,255,0.05)",
						}}
					/>

					<CardContent sx={{ p: 3 }}>
						<Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
							Total Terkumpul
						</Typography>
						<Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
							{new Intl.NumberFormat("id-ID", {
								style: "currency",
								currency: "IDR",
								maximumFractionDigits: 0,
							}).format(totalCollected)}
						</Typography>

						{!isQuickDonate && (
							<Stack
								direction="row"
								alignItems="center"
								spacing={1}
								sx={{ mb: 1 }}
							>
								<Typography
									variant="caption"
									fontWeight={600}
									sx={{ opacity: 0.9 }}
								>
									{progress}%
								</Typography>
								<LinearProgress
									variant="determinate"
									value={progress}
									sx={{
										flex: 1,
										height: 6,
										borderRadius: 4,
										bgcolor: "rgba(255,255,255,0.2)",
										"& .MuiLinearProgress-bar": {
											bgcolor: "#34d399",
											borderRadius: 4,
										},
									}}
								/>
							</Stack>
						)}
						<Typography variant="caption" sx={{ opacity: 0.7 }}>
							{isQuickDonate ? (
								"Target: Tanpa Batas"
							) : (
								<>
									Target:{" "}
									{new Intl.NumberFormat("id-ID", {
										style: "currency",
										currency: "IDR",
										maximumFractionDigits: 0,
									}).format(Number(campaign.target))}
								</>
							)}
						</Typography>
					</CardContent>
				</Card>

				{/* Quick Stats Row */}
				<Stack direction="row" spacing={2} sx={{ mb: 3 }}>
					<Paper
						elevation={0}
						sx={{
							flex: 1,
							p: 2,
							borderRadius: 3,
							border: "1px solid",
							borderColor: "divider",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							textAlign: "center",
						}}
					>
						<PeopleRoundedIcon color="info" sx={{ mb: 1 }} />
						<Typography variant="h6" fontWeight={700} lineHeight={1}>
							{donorCount}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							Donatur
						</Typography>
					</Paper>
					<Paper
						elevation={0}
						sx={{
							flex: 1,
							p: 2,
							borderRadius: 3,
							border: "1px solid",
							borderColor: "divider",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							textAlign: "center",
						}}
					>
						<AccessTimeRoundedIcon color="warning" sx={{ mb: 1 }} />
						<Typography variant="h6" fontWeight={700} lineHeight={1}>
							{isQuickDonate ? "∞" : daysLeft > 0 ? daysLeft : 0}
						</Typography>
						<Typography variant="caption" color="text.secondary">
							{isQuickDonate ? "Tanpa Batas" : "Sisa Hari"}
						</Typography>
					</Paper>
				</Stack>

				{/* Action Menu */}
				<Typography
					variant="subtitle2"
					fontWeight={700}
					sx={{ mb: 1.5, px: 0.5 }}
				>
					Menu Kelola
				</Typography>
				<Stack spacing={1.5} sx={{ mb: 4 }}>
					<LinkButton
						href={`/galang-dana/${campaign.slug || campaign.id}/pencairan`}
						variant="contained"
						fullWidth
						startIcon={<AccountBalanceWalletRoundedIcon />}
						endIcon={<ChevronRightRoundedIcon />}
						sx={{
							justifyContent: "space-between",
							borderRadius: 3,
							py: 1.5,
							bgcolor: "white",
							color: "text.primary",
							border: "1px solid",
							borderColor: "divider",
							boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
							"&:hover": {
								bgcolor: "grey.50",
								boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
							},
						}}
					>
						<Box sx={{ textAlign: "left" }}>
							<Typography variant="body2" fontWeight={700}>
								Update & Pencairan
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Buat kabar terbaru atau tarik dana
							</Typography>
						</Box>
					</LinkButton>

					<Stack direction="row" spacing={1.5}>
						<LinkButton
							href={`/galang-dana/buat?draft=${campaign.id}&type=${type}&category=${categoryKey}&mode=content`}
							fullWidth
							variant="outlined"
							startIcon={<EditRoundedIcon />}
							sx={{
								borderRadius: 3,
								py: 1.2,
								borderColor: "divider",
								color: "text.primary",
								textTransform: "none",
								fontWeight: 600,
								justifyContent: "flex-start",
							}}
						>
							Edit Detail
						</LinkButton>
						{/* Note: Share functionality would typically need a client component wrapper or onClick handler */}
						<LinkButton
							href={`/donasi/${campaign.slug || campaign.id}`}
							fullWidth
							variant="outlined"
							startIcon={<ShareRoundedIcon />}
							sx={{
								borderRadius: 3,
								py: 1.2,
								borderColor: "divider",
								color: "text.primary",
								textTransform: "none",
								fontWeight: 600,
								justifyContent: "flex-start",
							}}
						>
							Bagikan
						</LinkButton>
					</Stack>
					<OwnerExtendTargetButton
						campaignId={campaign.id}
						campaignTitle={campaign.title}
					/>
				</Stack>

				<OwnerDonationHistory donations={donationItems} />
			</Container>
		</Box>
	);
}
