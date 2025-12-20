"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Typography,
	Avatar,
	IconButton,
	Tabs,
	Tab,
	Divider,
	Stack,
	Paper,
	Container,
	Grid,
	Chip,
	Button,
	LinearProgress,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ShareIcon from "@mui/icons-material/Share";

// Mock Data
const USER_DATA = {
	id: "collab-for-change",
	name: "CollabForChange",
	avatar: "https://i.pravatar.cc/150?u=collab",
	cover:
		"https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80",
	verified: true,
	type: "Yayasan",
	joinedAt: "Bergabung sejak 2021",
	location: "Bandung, Jawa Barat",
	about: `
    CollabForChange adalah yayasan sosial yang berfokus pada pemberdayaan masyarakat marginal dan penyandang disabilitas. Kami percaya bahwa setiap orang berhak mendapatkan kesempatan yang sama untuk berkembang.
    
    Visi kami adalah menciptakan ekosistem inklusif di mana difabel dapat mandiri secara ekonomi dan sosial.
  `,
	campaigns: [
		{
			id: "tanam-harapan-difabel",
			title: "Tanam Harapan untuk Para Petani Difabel!",
			image:
				"https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=600&q=70",
			collected: 483580004,
			target: 800000000,
			daysLeft: 86,
			status: "active",
		},
		{
			id: "bantu-sekolah-yatim",
			title: "Bantu 100 Anak Yatim Kembali Sekolah",
			image:
				"https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=70",
			collected: 150000000,
			target: 150000000,
			daysLeft: 0,
			status: "finished",
		},
	],
};

function formatIDR(amount: number) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`profile-tabpanel-${index}`}
			aria-labelledby={`profile-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

export default function SahabatBaikPage({
	params,
}: {
	params: { id: string };
}) {
	const router = useRouter();
	const [tabValue, setTabValue] = React.useState(0);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const data = USER_DATA; // Mock

	return (
		<Box sx={{ pb: 12, bgcolor: "#fff", minHeight: "100vh" }}>
			{/* Header with Cover & Back Button */}
			<Box sx={{ position: "relative", height: 160, bgcolor: "#f1f5f9" }}>
				{data.cover && (
					<Box
						component="img"
						src={data.cover}
						alt="Cover"
						sx={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
				)}
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						p: 2,
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					<IconButton
						onClick={() => router.back()}
						sx={{ bgcolor: "rgba(255,255,255,0.8)", "&:hover": { bgcolor: "white" } }}
					>
						<ArrowBackIcon />
					</IconButton>
					<IconButton
						sx={{ bgcolor: "rgba(255,255,255,0.8)", "&:hover": { bgcolor: "white" } }}
					>
						<ShareIcon />
					</IconButton>
				</Box>
			</Box>

			<Container maxWidth="md">
				{/* Profile Info */}
				<Box sx={{ mt: -5, px: 2, position: "relative", mb: 3 }}>
					<Box sx={{ display: "flex", alignItems: "flex-end", mb: 2 }}>
						<Avatar
							src={data.avatar}
							sx={{
								width: 80,
								height: 80,
								border: "4px solid white",
								bgcolor: "#fff",
								boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
							}}
						/>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
						<Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
							{data.name}
						</Typography>
						{data.verified && (
							<VerifiedUserIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
						)}
					</Box>
					<Typography sx={{ color: "#64748b", fontSize: 14, mb: 2 }}>
						{data.type}
					</Typography>

					<Stack direction="row" spacing={2} sx={{ mb: 2 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							<LocationOnOutlinedIcon
								sx={{ fontSize: 16, color: "#94a3b8" }}
							/>
							<Typography sx={{ fontSize: 12, color: "#64748b" }}>
								{data.location}
							</Typography>
						</Box>
						<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
							<CalendarMonthOutlinedIcon
								sx={{ fontSize: 16, color: "#94a3b8" }}
							/>
							<Typography sx={{ fontSize: 12, color: "#64748b" }}>
								{data.joinedAt}
							</Typography>
						</Box>
					</Stack>
				</Box>

				<Divider sx={{ mb: 0 }} />

				{/* Tabs */}
				<Tabs
					value={tabValue}
					onChange={handleTabChange}
					variant="fullWidth"
					sx={{
						borderBottom: 1,
						borderColor: "divider",
						"& .MuiTab-root": {
							textTransform: "none",
							fontWeight: 600,
							fontSize: 14,
						},
						"& .Mui-selected": { color: "#61ce70" },
						"& .MuiTabs-indicator": { bgcolor: "#61ce70" },
					}}
				>
					<Tab label="Tentang" />
					<Tab label="Penggalangan Dana" />
				</Tabs>

				{/* Tab: Tentang */}
				<CustomTabPanel value={tabValue} index={0}>
					<Box sx={{ px: 2 }}>
						<Typography
							sx={{
								fontSize: 14,
								color: "#334155",
								lineHeight: 1.8,
								whiteSpace: "pre-line",
							}}
						>
							{data.about}
						</Typography>
					</Box>
				</CustomTabPanel>

				{/* Tab: Penggalangan Dana */}
				<CustomTabPanel value={tabValue} index={1}>
					<Stack spacing={2} sx={{ px: 2 }}>
						{data.campaigns.map((campaign) => {
							const progress = Math.min(
								100,
								Math.round((campaign.collected / campaign.target) * 100)
							);
							return (
								<Paper
									key={campaign.id}
									variant="outlined"
									sx={{ p: 0, borderRadius: 2, overflow: "hidden" }}
									onClick={() => router.push(`/donasi/${campaign.id}`)}
								>
									<Grid container>
										<Grid size={{ xs: 4 }}>
											<Box
												component="img"
												src={campaign.image}
												sx={{
													width: "100%",
													height: "100%",
													objectFit: "cover",
													minHeight: 120,
												}}
											/>
										</Grid>
										<Grid size={{ xs: 8 }} sx={{ p: 2 }}>
											<Typography
												sx={{
													fontWeight: 700,
													fontSize: 14,
													mb: 1,
													lineHeight: 1.3,
												}}
											>
												{campaign.title}
											</Typography>
											<Box sx={{ mb: 1 }}>
												<LinearProgress
													variant="determinate"
													value={progress}
													sx={{
														height: 6,
														borderRadius: 3,
														bgcolor: "#f1f5f9",
														"& .MuiLinearProgress-bar": {
															bgcolor: "#61ce70",
															borderRadius: 3,
														},
													}}
												/>
											</Box>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
												}}
											>
												<Box>
													<Typography
														sx={{ fontSize: 12, color: "#64748b" }}
													>
														Terkumpul
													</Typography>
													<Typography
														sx={{
															fontSize: 12,
															fontWeight: 700,
															color: "#61ce70",
														}}
													>
														{formatIDR(campaign.collected)}
													</Typography>
												</Box>
												{campaign.status === "active" ? (
													<Box sx={{ textAlign: "right" }}>
														<Typography
															sx={{ fontSize: 12, color: "#64748b" }}
														>
															Sisa hari
														</Typography>
														<Typography
															sx={{
																fontSize: 12,
																fontWeight: 700,
																color: "#0f172a",
															}}
														>
															{campaign.daysLeft}
														</Typography>
													</Box>
												) : (
													<Chip
														label="Selesai"
														size="small"
														sx={{
															fontSize: 10,
															height: 20,
															bgcolor: "#f1f5f9",
															color: "#64748b",
														}}
													/>
												)}
											</Box>
										</Grid>
									</Grid>
								</Paper>
							);
						})}
					</Stack>
				</CustomTabPanel>
			</Container>
		</Box>
	);
}
