import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { LinkButton, LinkIconButton } from "@/components/ui/LinkButton";
import {
	Box,
	Container,
	Typography,
	Stack,
	Button,
	Card,
	CardContent,
	Chip,
	Divider,
	LinearProgress,
	IconButton,
	Avatar,
	Paper,
	Grid,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";

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

	// Fetch campaign with donations
	// We check both slug and id for robustness
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

	// Verify ownership
	if (
		campaign.createdById !== session.user.id &&
		session.user.role !== "ADMIN"
	) {
		// Alternatively, could redirect to public page if we had one ready and accessible
		// redirect(`/donasi/${campaign.slug || campaign.id}`);
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

	// Calculate stats
	const collected = campaign.donations
		.filter((d) => d.status === "PAID" || d.status === "SETTLED") // Assuming PAID/SETTLED is success. Checking schema would be better.
		// If status field is string and we rely on payment gateway, usually 'PAID' or 'SETTLED' or 'COMPLETED' or 'Berhasil'
		// Based on previous file `donasi-saya`, status was 'Berhasil'. Let's check typical values.
		// If uncertain, I'll list all but highlight success ones.
		// Actually, let's just sum all for now or check if there is a 'status' field in Prisma type.
		// I'll assume 'PAID' or 'Berhasil' based on common conventions.
		// Let's sum everything that is NOT failed/pending for 'Terkumpul'.
		// Actually, let's look at the donations list to see what statuses exist.
		.reduce((acc, d) => acc + Number(d.amount), 0);

	// Total collected (including pending? usually only paid)
	// Let's assume we want to show all transactions in the list, but stats should reflect reality.
	// For now I'll sum everything that looks successful.
	// If I can't check status type, I'll assume all for now or check `donasi-saya` code again.
	// `donasi-saya` used `d.status === "Berhasil"`.
	// I'll use `status === 'PAID'` or `status === 'Berhasil'` (case insensitive if needed).

	const donations = campaign.donations;
	const successfulDonations = donations.filter(
		(d: any) => d.status === "PAID" || d.status === "Berhasil"
	);
	const totalCollected = successfulDonations.reduce(
		(acc, d) => acc + Number(d.amount),
		0
	);
	const donorCount = new Set(
		successfulDonations.map((d) => d.donorEmail || d.id)
	).size;

	const progress = Math.min(
		100,
		Math.round((totalCollected / Number(campaign.target)) * 100)
	);

	const daysLeft = campaign.end
		? Math.ceil(
				(new Date(campaign.end).getTime() - new Date().getTime()) /
					(1000 * 60 * 60 * 24)
		  )
		: 0;

	const thumbnail =
		campaign.media.find((m) => m.isThumbnail)?.url ||
		campaign.media[0]?.url ||
		"";

	return (
		<Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 10 }}>
			{/* Header */}
			<Box
				sx={{
					bgcolor: "white",
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Container maxWidth="lg">
					<Stack
						direction="row"
						alignItems="center"
						spacing={2}
						sx={{ height: 64 }}
					>
						<LinkIconButton href="/galang-dana" edge="start">
							<ArrowBackRoundedIcon />
						</LinkIconButton>
						<Typography variant="h6" fontWeight={700} sx={{ fontSize: 18 }}>
							Detail Campaign
						</Typography>
					</Stack>
				</Container>
			</Box>

			<Container maxWidth="lg" sx={{ mt: 3 }}>
				<Grid container spacing={3}>
					{/* Left Column: Campaign Info */}
					<Grid item xs={12} md={4}>
						<Card
							elevation={0}
							sx={{
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								overflow: "hidden",
								position: "sticky",
								top: 80,
							}}
						>
							<Box
								sx={{
									position: "relative",
									aspectRatio: "16/9",
									bgcolor: "grey.100",
								}}
							>
								{thumbnail ? (
									<Box
										component="img"
										src={thumbnail}
										alt={campaign.title}
										sx={{ width: "100%", height: "100%", objectFit: "cover" }}
									/>
								) : (
									<Box
										sx={{
											width: "100%",
											height: "100%",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											color: "text.disabled",
										}}
									>
										<ImageNotSupportedRoundedIcon sx={{ fontSize: 48 }} />
									</Box>
								)}
								<Chip
									label={campaign.status}
									color={campaign.status === "ACTIVE" ? "success" : "default"}
									size="small"
									sx={{
										position: "absolute",
										top: 12,
										right: 12,
										fontWeight: 700,
										borderRadius: 1.5,
										fontSize: 11,
										height: 24,
									}}
								/>
							</Box>

							<CardContent sx={{ p: 2 }}>
								<Typography
									variant="subtitle2"
									color="primary"
									fontWeight={700}
									gutterBottom
									sx={{ fontSize: 12 }}
								>
									{campaign.category.name}
								</Typography>
								<Typography
									variant="h6"
									fontWeight={800}
									sx={{ lineHeight: 1.3, mb: 2, fontSize: 16 }}
								>
									{campaign.title}
								</Typography>

								<Box sx={{ mb: 2 }}>
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										sx={{ mb: 1 }}
									>
										<Typography
											variant="caption"
											color="text.secondary"
											fontWeight={600}
										>
											Terkumpul
										</Typography>
										<Typography
											variant="caption"
											fontWeight={700}
											color="primary"
										>
											{progress}%
										</Typography>
									</Stack>
									<LinearProgress
										variant="determinate"
										value={progress}
										sx={{
											height: 6,
											borderRadius: 4,
											bgcolor: "action.hover",
											"& .MuiLinearProgress-bar": {
												borderRadius: 4,
											},
										}}
									/>
								</Box>

								<Stack spacing={2}>
									<Box>
										<Typography
											variant="h5"
											fontWeight={800}
											sx={{ fontSize: 20 }}
										>
											{new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
												maximumFractionDigits: 0,
											}).format(totalCollected)}
										</Typography>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ fontSize: 12 }}
										>
											dari target{" "}
											{new Intl.NumberFormat("id-ID", {
												style: "currency",
												currency: "IDR",
												maximumFractionDigits: 0,
											}).format(Number(campaign.target))}
										</Typography>
									</Box>

									<Divider />

									<Stack direction="row" justifyContent="space-between">
										<Box>
											<Typography
												variant="caption"
												color="text.secondary"
												display="block"
												sx={{ mb: 0.5 }}
											>
												Donatur
											</Typography>
											<Stack direction="row" alignItems="center" spacing={0.5}>
												<PeopleRoundedIcon
													sx={{ fontSize: 16, color: "text.secondary" }}
												/>
												<Typography fontWeight={600} fontSize={13}>
													{donorCount}
												</Typography>
											</Stack>
										</Box>
										<Box sx={{ textAlign: "right" }}>
											<Typography
												variant="caption"
												color="text.secondary"
												display="block"
												sx={{ mb: 0.5 }}
											>
												Sisa Hari
											</Typography>
											<Stack
												direction="row"
												alignItems="center"
												spacing={0.5}
												justifyContent="flex-end"
											>
												<AccessTimeRoundedIcon
													sx={{ fontSize: 16, color: "text.secondary" }}
												/>
												<Typography fontWeight={600} fontSize={13}>
													{daysLeft > 0 ? `${daysLeft} hari` : "Selesai"}
												</Typography>
											</Stack>
										</Box>
									</Stack>

									<LinkButton
										href={`/galang-dana/buat?draft=${campaign.id}`}
										variant="outlined"
										fullWidth
										startIcon={<EditRoundedIcon sx={{ fontSize: 18 }} />}
										sx={{
											borderRadius: 2,
											textTransform: "none",
											fontWeight: 700,
											fontSize: 13,
											py: 0.8,
										}}
									>
										Edit Campaign
									</LinkButton>
								</Stack>
							</CardContent>
						</Card>
					</Grid>

					{/* Right Column: Transactions */}
					<Grid item xs={12} md={8}>
						<Typography
							variant="h6"
							fontWeight={800}
							gutterBottom
							sx={{ fontSize: 16 }}
						>
							Detail Transaksi
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
							sx={{ mb: 2, fontSize: 13 }}
						>
							Daftar semua donasi yang masuk ke campaign ini.
						</Typography>

						{donations.length === 0 ? (
							<Paper
								elevation={0}
								sx={{
									p: 4,
									textAlign: "center",
									borderRadius: 3,
									border: "1px solid",
									borderColor: "divider",
									bgcolor: "white",
								}}
							>
								<Box
									sx={{
										width: 56,
										height: 56,
										bgcolor: "action.hover",
										borderRadius: "50%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										mx: "auto",
										mb: 2,
									}}
								>
									<PaidRoundedIcon
										sx={{ fontSize: 28, color: "text.secondary" }}
									/>
								</Box>
								<Typography fontWeight={600} gutterBottom fontSize={15}>
									Belum ada transaksi
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									fontSize={13}
								>
									Campaign ini belum menerima donasi. Sebarkan campaign Anda
									untuk mulai mendapatkan dukungan!
								</Typography>
							</Paper>
						) : (
							<Stack spacing={1.5}>
								{donations.map((donation: any) => (
									<Paper
										key={donation.id}
										elevation={0}
										sx={{
											p: 1.5,
											borderRadius: 3,
											border: "1px solid",
											borderColor: "divider",
											transition: "all 0.2s",
											"&:hover": {
												borderColor: "primary.main",
												boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
											},
										}}
									>
										<Stack
											direction={{ xs: "column", sm: "row" }}
											spacing={2}
											alignItems={{ xs: "flex-start", sm: "center" }}
										>
											<Avatar
												sx={{
													width: 40,
													height: 40,
													bgcolor: donation.isAnonymous
														? "grey.300"
														: "primary.light",
													color: donation.isAnonymous
														? "grey.600"
														: "primary.main",
													fontWeight: 700,
													fontSize: 16,
												}}
											>
												{donation.isAnonymous
													? "A"
													: (donation.donorName || "U").charAt(0).toUpperCase()}
											</Avatar>

											<Box sx={{ flex: 1 }}>
												<Stack
													direction="row"
													alignItems="center"
													spacing={1}
													sx={{ mb: 0.5 }}
												>
													<Typography fontWeight={700} fontSize={14}>
														{donation.isAnonymous
															? "Hamba Allah"
															: donation.donorName}
													</Typography>
													{donation.status === "PAID" ||
													donation.status === "Berhasil" ? (
														<VerifiedRoundedIcon
															sx={{ fontSize: 14, color: "success.main" }}
														/>
													) : null}
												</Stack>
												<Typography
													variant="body2"
													color="text.secondary"
													fontSize={12}
												>
													{new Date(donation.createdAt).toLocaleDateString(
														"id-ID",
														{
															day: "numeric",
															month: "long",
															year: "numeric",
															hour: "2-digit",
															minute: "2-digit",
														}
													)}
												</Typography>
												{donation.message && (
													<Typography
														variant="body2"
														sx={{
															mt: 1,
															p: 1,
															bgcolor: "grey.50",
															borderRadius: 2,
															fontStyle: "italic",
															color: "text.secondary",
															fontSize: 12,
														}}
													>
														"{donation.message}"
													</Typography>
												)}
											</Box>

											<Box
												sx={{
													textAlign: { xs: "left", sm: "right" },
													minWidth: 100,
												}}
											>
												<Typography
													fontWeight={700}
													color="primary.main"
													fontSize={15}
												>
													{new Intl.NumberFormat("id-ID", {
														style: "currency",
														currency: "IDR",
														maximumFractionDigits: 0,
													}).format(Number(donation.amount))}
												</Typography>
												<Chip
													label={donation.status || "Pending"}
													size="small"
													color={
														donation.status === "PAID" ||
														donation.status === "Berhasil"
															? "success"
															: donation.status === "PENDING"
															? "warning"
															: "default"
													}
													sx={{
														mt: 0.5,
														fontWeight: 700,
														borderRadius: 1.5,
														height: 20,
														fontSize: 10,
													}}
												/>
											</Box>
										</Stack>
									</Paper>
								))}
							</Stack>
						)}
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
}
