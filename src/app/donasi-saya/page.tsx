"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";

import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CategoryIcon from "@mui/icons-material/Category";
import CampaignIcon from "@mui/icons-material/Campaign";
import StarsIcon from "@mui/icons-material/Stars";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SpaIcon from "@mui/icons-material/Spa";
import HandshakeIcon from "@mui/icons-material/Handshake";

// Mock Data updated with category
const myDonations = [
	{
		id: "INV-20251217-001",
		campaign: "Bantu Korban Banjir Sumut, Aceh & Sumbar",
		amount: 50000,
		date: "17 Des 2025",
		rawDate: "2025-12-17",
		status: "Berhasil",
		paymentMethod: "GoPay",
		prayer: "Semoga saudara-saudara kita di sana diberikan ketabahan dan kekuatan. Aamiin.",
		campaignId: "c1",
		category: "Bencana Alam",
	},
	{
		id: "INV-20251217-002",
		campaign: "Sedekah Jumat Berkah",
		amount: 20000,
		date: "17 Des 2025",
		rawDate: "2025-12-17",
		status: "Berhasil",
		paymentMethod: "OVO",
		prayer: "Semoga berkah untuk semua.",
		campaignId: "c4",
		category: "Zakat & Sedekah",
	},
	{
		id: "INV-20251210-023",
		campaign: "Selamatkan Ratusan Anabul Korban Banjir",
		amount: 25000,
		date: "10 Des 2025",
		rawDate: "2025-12-10",
		status: "Berhasil",
		paymentMethod: "OVO",
		prayer: "Untuk anabul-anabul lucu, semoga selamat semua.",
		campaignId: "c2",
		category: "Lingkungan",
	},
	{
		id: "INV-20251201-104",
		campaign: "Bantu Biaya Berobat Anak Kecil yang Sakit",
		amount: 100000,
		date: "01 Des 2025",
		rawDate: "2025-12-01",
		status: "Pending",
		paymentMethod: "BCA Virtual Account",
		prayer: "",
		campaignId: "c3",
		category: "Kesehatan",
	},
];

interface KindnessCalendarProps {
	onDateClick: (date: string) => void;
}

function KindnessCalendar({ onDateClick }: KindnessCalendarProps) {
	const today = new Date();
	const currentMonth = today.getMonth();
	const currentYear = today.getFullYear();
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
	const monthName = today.toLocaleString("id-ID", { month: "long" });

	const donationData = React.useMemo(() => {
		// Map date string (YYYY-MM-DD) to boolean
		const map: Record<string, boolean> = {};
		myDonations
			.filter((d) => d.status === "Berhasil")
			.forEach((d) => {
				map[d.rawDate] = true;
			});
		return map;
	}, []);

	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

	return (
		<Card
			variant="outlined"
			sx={{
				mb: 3,
				borderRadius: 3,
				bgcolor: "#fff",
				borderColor: "rgba(0,0,0,0.06)",
				overflow: "hidden",
				position: "relative",
			}}
		>
			<Box
				sx={{
					p: 2,
					background: "linear-gradient(to right, #ecfccb, #dcfce7)",
					display: "flex",
					alignItems: "center",
					gap: 1,
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Decorative Icon */}
				<CalendarMonthIcon
					sx={{
						position: "absolute",
						right: -10,
						top: -10,
						fontSize: 80,
						color: "rgba(97,206,112,0.1)",
						transform: "rotate(-15deg)",
					}}
				/>
				<CalendarMonthIcon sx={{ color: "#16a34a", zIndex: 1 }} />
				<Typography sx={{ fontWeight: 800, color: "#166534", zIndex: 1 }}>
					Kalender Kebaikan - {monthName} {currentYear}
				</Typography>
			</Box>
			<CardContent sx={{ p: 2 }}>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(7, 1fr)",
						gap: 1,
						textAlign: "center",
					}}
				>
					{days.map((day) => {
						// Construct rawDate string YYYY-MM-DD manually to avoid timezone issues
						const dayString = day.toString().padStart(2, "0");
						const monthString = (currentMonth + 1).toString().padStart(2, "0");
						const dateKey = `${currentYear}-${monthString}-${dayString}`;
						const isDonated = donationData[dateKey];

						return (
							<Box
								key={day}
								onClick={() => isDonated && onDateClick(dateKey)}
								sx={{
									aspectRatio: "1/1",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									borderRadius: 2,
									bgcolor: isDonated ? "rgba(22,163,74,0.15)" : "transparent",
									color: isDonated ? "#16a34a" : "rgba(15,23,42,.4)",
									fontSize: 13,
									fontWeight: 700,
									position: "relative",
									border: "1px solid",
									borderColor: isDonated ? "transparent" : "rgba(0,0,0,0.05)",
									cursor: isDonated ? "pointer" : "default",
									transition: "all 0.2s",
									"&:hover": {
										bgcolor: isDonated
											? "rgba(22,163,74,0.25)"
											: "rgba(0,0,0,0.02)",
									},
								}}
							>
								{isDonated ? <FavoriteIcon fontSize="small" /> : day}
							</Box>
						);
					})}
				</Box>
				<Typography
					sx={{
						mt: 2,
						fontSize: 12,
						color: "rgba(15,23,42,.6)",
						textAlign: "center",
					}}
				>
					Klik tanda hati untuk melihat kebaikanmu di hari itu.
				</Typography>
			</CardContent>
		</Card>
	);
}

export default function MyDonationPage() {
	// State for Detail Modal
	const [open, setOpen] = React.useState(false);
	const [selectedDonation, setSelectedDonation] = React.useState<
		(typeof myDonations)[0] | null
	>(null);

	// State for Daily Donations Modal (Calendar Click)
	const [dailyOpen, setDailyOpen] = React.useState(false);
	const [selectedDate, setSelectedDate] = React.useState<string>("");

	const handleOpenDetail = (donation: (typeof myDonations)[0]) => {
		setSelectedDonation(donation);
		setOpen(true);
	};

	const handleCloseDetail = () => {
		setOpen(false);
		setTimeout(() => setSelectedDonation(null), 200);
	};

	const handleDateClick = (date: string) => {
		setSelectedDate(date);
		setDailyOpen(true);
	};

	const handleCloseDaily = () => {
		setDailyOpen(false);
		setTimeout(() => setSelectedDate(""), 200);
	};

	// Calculate Stats
	const stats = React.useMemo(() => {
		const successful = myDonations.filter((d) => d.status === "Berhasil");
		const uniqueDays = new Set(successful.map((d) => d.rawDate)).size;
		const uniqueCampaigns = new Set(successful.map((d) => d.campaignId)).size;

		// Top Category
		const categoryCounts: Record<string, number> = {};
		successful.forEach((d) => {
			if (d.category) {
				categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
			}
		});

		let topCategory = "-";
		let maxCount = 0;
		Object.entries(categoryCounts).forEach(([cat, count]) => {
			if (count > maxCount) {
				maxCount = count;
				topCategory = cat;
			}
		});

		return {
			days: uniqueDays,
			campaigns: uniqueCampaigns,
			topCategory: topCategory,
		};
	}, []);

	// Filter donations for the selected date in daily modal
	const dailyDonations = React.useMemo(() => {
		if (!selectedDate) return [];
		return myDonations.filter(
			(d) => d.rawDate === selectedDate && d.status === "Berhasil"
		);
	}, [selectedDate]);

	const formatDateIndo = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	return (
		<Box sx={{ px: 2.5, pt: 2.5, pb: 4, maxWidth: 600, mx: "auto" }}>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					mb: 3,
				}}
			>
				<Typography sx={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
					Donasi Saya
				</Typography>
			</Box>

			{/* Summary Card (Updated with Gradient & Glassmorphism) */}
			<Card
				variant="outlined"
				sx={{
					mb: 3,
					borderRadius: 3,
					background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
					border: "none",
					boxShadow: "0 10px 20px rgba(16,185,129,0.25)",
					color: "#fff",
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Decorative Background Icons */}
				<EmojiEventsIcon
					sx={{
						position: "absolute",
						right: -20,
						bottom: -20,
						fontSize: 120,
						color: "rgba(255,255,255,0.1)",
						transform: "rotate(-20deg)",
					}}
				/>
				<VolunteerActivismIcon
					sx={{
						position: "absolute",
						left: -20,
						top: -20,
						fontSize: 100,
						color: "rgba(255,255,255,0.05)",
						transform: "rotate(15deg)",
					}}
				/>

				<CardContent sx={{ p: 2.5, position: "relative", zIndex: 1 }}>
					{/* <Typography
						sx={{
							fontSize: 14,
							opacity: 0.9,
							fontWeight: 700,
							mb: 2,
							letterSpacing: 0.5,
							textTransform: "uppercase",
						}}
					>
						Statistik Kebaikanmu
					</Typography> */}

					<Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
						{/* Total Days */}
						<Box sx={{ textAlign: "center" }}>
							<Box
								sx={{
									display: "inline-flex",
									p: 1.2,
									borderRadius: "20px",
									bgcolor: "rgba(255,255,255,0.2)",
									backdropFilter: "blur(4px)",
									mb: 1,
									boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
								}}
							>
								<CalendarMonthIcon fontSize="small" sx={{ color: "#fff" }} />
							</Box>
							<Typography sx={{ fontSize: 24, fontWeight: 900, textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
								{stats.days}
							</Typography>
							<Typography sx={{ fontSize: 10, opacity: 0.9, fontWeight: 700 }}>
								Hari Berdonasi
							</Typography>
						</Box>

						{/* Total Campaigns */}
						<Box sx={{ textAlign: "center" }}>
							<Box
								sx={{
									display: "inline-flex",
									p: 1.2,
									borderRadius: "20px",
									bgcolor: "rgba(255,255,255,0.2)",
									backdropFilter: "blur(4px)",
									mb: 1,
									boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
								}}
							>
								<HandshakeIcon fontSize="small" sx={{ color: "#fff" }} />
							</Box>
							<Typography sx={{ fontSize: 24, fontWeight: 900, textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
								{stats.campaigns}
							</Typography>
							<Typography sx={{ fontSize: 10, opacity: 0.9, fontWeight: 700 }}>
								Campaign
							</Typography>
						</Box>

						{/* Top Category */}
						<Box sx={{ textAlign: "center" }}>
							<Box
								sx={{
									display: "inline-flex",
									p: 1.2,
									borderRadius: "20px",
									bgcolor: "rgba(255,255,255,0.2)",
									backdropFilter: "blur(4px)",
									mb: 1,
									boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
								}}
							>
								<StarsIcon fontSize="small" sx={{ color: "#fff" }} />
							</Box>
							<Typography
								sx={{
									fontSize: 13,
									fontWeight: 900,
									height: 36,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									lineHeight: 1.1,
									textShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
								{stats.topCategory}
							</Typography>
							<Typography sx={{ fontSize: 10, opacity: 0.9, fontWeight: 700 }}>
								Top Kategori
							</Typography>
						</Box>
					</Box>
				</CardContent>
			</Card>

			{/* Kindness Calendar */}
			<KindnessCalendar onDateClick={handleDateClick} />

			<Typography
				sx={{ fontSize: 16, fontWeight: 800, color: "#0f172a", mb: 2 }}
			>
				Riwayat Terbaru
			</Typography>

			<Stack spacing={2}>
				{myDonations.map((item) => (
					<Card
						key={item.id}
						variant="outlined"
						sx={{
							borderRadius: 3,
							borderColor: "rgba(0,0,0,0.06)",
							bgcolor: "#fff",
							transition: "all 0.2s ease",
							"&:hover": { borderColor: "rgba(0,0,0,0.12)" },
						}}
					>
						<CardContent sx={{ p: 2 }}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
									mb: 1.5,
								}}
							>
								<Box sx={{ flex: 1, mr: 1.5 }}>
									<Typography
										sx={{
											fontSize: 14,
											fontWeight: 800,
											color: "#0f172a",
											lineHeight: 1.4,
										}}
									>
										{item.campaign}
									</Typography>
									<Typography
										sx={{
											fontSize: 11,
											color: "rgba(15,23,42,.5)",
											mt: 0.5,
											fontWeight: 600,
										}}
									>
										{item.date} • {item.id}
									</Typography>
								</Box>
								<Chip
									label={item.status}
									size="small"
									color={item.status === "Berhasil" ? "success" : "warning"}
									variant={item.status === "Berhasil" ? "filled" : "outlined"}
									sx={{
										height: 22,
										fontSize: 10,
										fontWeight: 800,
										borderRadius: 1.5,
									}}
								/>
							</Box>

							<Divider sx={{ my: 1.5, borderStyle: "dashed" }} />

							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<Box>
									<Typography
										sx={{ fontSize: 11, color: "rgba(15,23,42,.6)", mb: 0.2 }}
									>
										Jumlah Donasi
									</Typography>
									<Typography
										sx={{ fontSize: 15, fontWeight: 900, color: "#61ce70" }}
									>
										Rp {item.amount.toLocaleString("id-ID")}
									</Typography>
								</Box>
								<Stack direction="row" spacing={1}>
									<Button
										variant="outlined"
										size="small"
										href={`/galang-dana/${item.campaignId}/donasi`}
										sx={{
											textTransform: "none",
											borderRadius: 2,
											fontSize: 12,
											fontWeight: 700,
											py: 0.5,
											color: "#16a34a",
											borderColor: "rgba(22,163,74,0.3)",
											"&:hover": {
												borderColor: "#16a34a",
												bgcolor: "rgba(22,163,74,0.05)",
											},
										}}
									>
										Donasi Lagi
									</Button>
									<Button
										variant="text"
										size="small"
										onClick={() => handleOpenDetail(item)}
										sx={{
											textTransform: "none",
											borderRadius: 2,
											fontSize: 12,
											fontWeight: 700,
											py: 0.5,
											color: "rgba(15,23,42,.6)",
											"&:hover": {
												bgcolor: "rgba(0,0,0,0.04)",
												color: "rgba(15,23,42,.9)",
											},
										}}
									>
										Detail
									</Button>
								</Stack>
							</Box>
						</CardContent>
					</Card>
				))}
			</Stack>

			{/* Detail Modal (Single Donation) */}
			<Dialog
				open={open}
				onClose={handleCloseDetail}
				PaperProps={{
					sx: {
						borderRadius: 3,
						width: "100%",
						maxWidth: 400,
						m: 2,
					},
				}}
			>
				{selectedDonation && (
					<>
						<DialogTitle
							sx={{
								p: 2,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Typography sx={{ fontWeight: 800, fontSize: 16 }}>
								Detail Donasi
							</Typography>
							<IconButton onClick={handleCloseDetail} size="small">
								<CloseIcon />
							</IconButton>
						</DialogTitle>
						<DialogContent dividers sx={{ p: 2.5 }}>
							<Box sx={{ mb: 3 }}>
								<Typography
									sx={{ fontSize: 12, color: "rgba(15,23,42,.6)", mb: 0.5 }}
								>
									Campaign
								</Typography>
								<Typography
									sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4 }}
								>
									{selectedDonation.campaign}
								</Typography>
								<Chip
									label={selectedDonation.category}
									size="small"
									sx={{ mt: 1, fontSize: 10, fontWeight: 700 }}
								/>
							</Box>

							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr",
									gap: 2,
									mb: 3,
								}}
							>
								<Box>
									<Typography
										sx={{ fontSize: 12, color: "rgba(15,23,42,.6)", mb: 0.5 }}
									>
										Nominal
									</Typography>
									<Typography
										sx={{ fontWeight: 800, fontSize: 16, color: "#61ce70" }}
									>
										Rp {selectedDonation.amount.toLocaleString("id-ID")}
									</Typography>
								</Box>
								<Box>
									<Typography
										sx={{ fontSize: 12, color: "rgba(15,23,42,.6)", mb: 0.5 }}
									>
										Metode Pembayaran
									</Typography>
									<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
										{selectedDonation.paymentMethod}
									</Typography>
								</Box>
								<Box>
									<Typography
										sx={{ fontSize: 12, color: "rgba(15,23,42,.6)", mb: 0.5 }}
									>
										Tanggal
									</Typography>
									<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
										{selectedDonation.date}
									</Typography>
								</Box>
								<Box>
									<Typography
										sx={{ fontSize: 12, color: "rgba(15,23,42,.6)", mb: 0.5 }}
									>
										Status
									</Typography>
									<Chip
										label={selectedDonation.status}
										size="small"
										color={
											selectedDonation.status === "Berhasil"
												? "success"
												: "warning"
										}
										variant="filled"
										sx={{ height: 24, fontWeight: 700, fontSize: 11 }}
									/>
								</Box>
							</Box>

							{selectedDonation.prayer && (
								<Box
									sx={{
										p: 2,
										bgcolor: "rgba(255,193,7,0.1)",
										borderRadius: 2,
										border: "1px dashed rgba(255,193,7,0.5)",
									}}
								>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											mb: 1,
											color: "#d97706",
										}}
									>
										<VolunteerActivismIcon fontSize="small" />
										<Typography sx={{ fontWeight: 700, fontSize: 13 }}>
											Doa & Dukungan Anda
										</Typography>
									</Box>
									<Typography
										sx={{
											fontSize: 13.5,
											color: "#0f172a",
											fontStyle: "italic",
											lineHeight: 1.5,
										}}
									>
										"{selectedDonation.prayer}"
									</Typography>
								</Box>
							)}
						</DialogContent>
						<DialogActions sx={{ p: 2, flexDirection: "column", gap: 1.5 }}>
							<Button
								variant="contained"
								fullWidth
								size="large"
								href={`/donasi/${selectedDonation.campaignId}`}
								sx={{
									borderRadius: 2,
									fontWeight: 700,
									textTransform: "none",
									bgcolor: "#0f172a",
								}}
							>
								Lihat Campaign
							</Button>
							<Button
								variant="outlined"
								fullWidth
								size="large"
								href={`/galang-dana/${selectedDonation.campaignId}/donasi`}
								startIcon={<VolunteerActivismIcon />}
								sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none" }}
							>
								Donasi Lagi
							</Button>
						</DialogActions>
					</>
				)}
			</Dialog>

			{/* Daily Donations Modal (Calendar List) */}
			<Dialog
				open={dailyOpen}
				onClose={handleCloseDaily}
				PaperProps={{
					sx: {
						borderRadius: 3,
						width: "100%",
						maxWidth: 400,
						m: 2,
					},
				}}
			>
				<DialogTitle
					sx={{
						p: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Typography sx={{ fontWeight: 800, fontSize: 16 }}>
						Kebaikan pada {selectedDate ? formatDateIndo(selectedDate) : ""}
					</Typography>
					<IconButton onClick={handleCloseDaily} size="small">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers sx={{ p: 2 }}>
					<Stack spacing={2}>
						{dailyDonations.map((donation) => (
							<Card
								key={donation.id}
								variant="outlined"
								sx={{
									borderRadius: 2,
									borderColor: "rgba(0,0,0,0.08)",
									bgcolor: "rgba(248,250,252,0.5)",
								}}
							>
								<CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
									<Typography
										sx={{
											fontSize: 13,
											fontWeight: 700,
											color: "#0f172a",
											lineHeight: 1.3,
											mb: 1,
										}}
									>
										{donation.campaign}
									</Typography>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
										}}
									>
										<Chip
											label={donation.category}
											size="small"
											sx={{
												height: 20,
												fontSize: 10,
												bgcolor: "#fff",
												border: "1px solid rgba(0,0,0,0.1)",
											}}
										/>
										<Typography
											sx={{ fontWeight: 800, fontSize: 13, color: "#61ce70" }}
										>
											Rp {donation.amount.toLocaleString("id-ID")}
										</Typography>
									</Box>
									{donation.prayer && (
										<Typography
											sx={{
												mt: 1.5,
												fontSize: 12,
												fontStyle: "italic",
												color: "rgba(15,23,42,.6)",
												display: "-webkit-box",
												WebkitLineClamp: 2,
												WebkitBoxOrient: "vertical",
												overflow: "hidden",
											}}
										>
											"{donation.prayer}"
										</Typography>
									)}
									<Button
										size="small"
										fullWidth
										onClick={() => {
											handleCloseDaily();
											handleOpenDetail(donation);
										}}
										sx={{
											mt: 1.5,
											fontSize: 11,
											textTransform: "none",
											color: "primary.main",
										}}
									>
										Lihat Detail Lengkap
									</Button>
								</CardContent>
							</Card>
						))}
					</Stack>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
