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
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";

import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import StarsIcon from "@mui/icons-material/Stars";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SpaIcon from "@mui/icons-material/Spa";
import HandshakeIcon from "@mui/icons-material/Handshake";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createDonation } from "@/actions/donation";
import { getQuickDonationCampaignId } from "@/actions/campaign";

import { getMyDonations } from "@/actions/my-donations";
import { checkPendingDonations } from "@/actions/donation";

interface DonationItem {
	id: string;
	campaign: string;
	amount: number;
	date: string;
	rawDate: string;
	status: string;
	paymentMethod: string;
	prayer: string;
	campaignId: string;
	category: string;
}

interface KindnessCalendarProps {
	donations: DonationItem[];
	onDateClick: (date: string) => void;
}

function KindnessCalendar({ donations, onDateClick }: KindnessCalendarProps) {
	const [currentDate, setCurrentDate] = React.useState(new Date());

	const currentMonth = currentDate.getMonth();
	const currentYear = currentDate.getFullYear();
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
	const monthName = currentDate.toLocaleString("id-ID", { month: "long" });

	const handlePrevMonth = () => {
		setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
	};

	const donationData = React.useMemo(() => {
		// Map date string (YYYY-MM-DD) to boolean
		const map: Record<string, boolean> = {};
		donations
			.filter((d) => d.status === "Berhasil")
			.forEach((d) => {
				map[d.rawDate] = true;
			});
		return map;
	}, [donations]);

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
					p: 1.5,
					background: "linear-gradient(to right, #ecfccb, #dcfce7)",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
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
						fontSize: 60,
						color: "rgba(11,169,118,0.1)",
						transform: "rotate(-15deg)",
					}}
				/>

				<IconButton size="small" onClick={handlePrevMonth} sx={{ zIndex: 1 }}>
					<NavigateBeforeIcon sx={{ color: "#166534" }} />
				</IconButton>

				<Box sx={{ display: "flex", alignItems: "center", gap: 1, zIndex: 1 }}>
					<CalendarMonthIcon sx={{ color: "#16a34a", fontSize: 20 }} />
					<Typography sx={{ fontWeight: 800, color: "#166534", fontSize: 14 }}>
						{monthName} {currentYear}
					</Typography>
				</Box>

				<IconButton size="small" onClick={handleNextMonth} sx={{ zIndex: 1 }}>
					<NavigateNextIcon sx={{ color: "#166534" }} />
				</IconButton>
			</Box>
			<CardContent sx={{ p: 1.5 }}>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(7, 1fr)",
						gap: 0.5,
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
									borderRadius: 1.5,
									bgcolor: isDonated ? "rgba(22,163,74,0.15)" : "transparent",
									color: isDonated ? "#16a34a" : "rgba(15,23,42,.4)",
									fontSize: 12,
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
								{isDonated ? <FavoriteIcon sx={{ fontSize: 16 }} /> : day}
							</Box>
						);
					})}
				</Box>
				<Typography
					sx={{
						mt: 1.5,
						fontSize: 11,
						color: "rgba(15,23,42,.6)",
						textAlign: "center",
					}}
				>
					Klik tanda hati untuk melihat kebaikanmu.
				</Typography>
			</CardContent>
		</Card>
	);
}

export default function MyDonationPage() {
	const router = useRouter();
	const [donations, setDonations] = React.useState<DonationItem[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState("");
	const [missingPhone, setMissingPhone] = React.useState(false);

	// State for Detail Modal
	const [open, setOpen] = React.useState(false);
	const [selectedDonation, setSelectedDonation] =
		React.useState<DonationItem | null>(null);

	// State for Daily Donations Modal (Calendar Click)
	const [dailyOpen, setDailyOpen] = React.useState(false);
	const [selectedDate, setSelectedDate] = React.useState<string>("");

	// Redonate sheet state
	const amountPresets = [10000, 25000, 50000, 75000, 100000];
	const [quickCampaignId, setQuickCampaignId] = React.useState<string>("");
	const [reOpen, setReOpen] = React.useState(false);
	const [reCampaignId, setReCampaignId] = React.useState<string>("");
	const [reCampaignTitle, setReCampaignTitle] = React.useState<string>("");
	const [selectedAmount, setSelectedAmount] = React.useState<number>(
		amountPresets[0],
	);
	const [customAmount, setCustomAmount] = React.useState<string>("");
	// Method removed, defaulted to EWALLET/SNAP
	const [isAnonymous, setIsAnonymous] = React.useState<boolean>(false);
	const [donorName, setDonorName] = React.useState<string>("");
	const [donorPhone, setDonorPhone] = React.useState<string>("");
	const [message, setMessage] = React.useState<string>("");
	const [submitLoading, setSubmitLoading] = React.useState(false);
	const [submitError, setSubmitError] = React.useState("");

	// Limit display state
	const [showAll, setShowAll] = React.useState(false);

	const finalAmount = React.useMemo(() => {
		const clean = customAmount.replace(/[^\d]/g, "");
		const n = clean ? Number(clean) : 0;
		if (customAmount.trim().length > 0) return isNaN(n) ? 0 : n;
		return selectedAmount;
	}, [customAmount, selectedAmount]);

	const openReDonate = (item: DonationItem) => {
		setReCampaignId(item.campaignId);
		setReCampaignTitle(item.campaign);
		setSelectedAmount(amountPresets[0]);
		setCustomAmount("");
		setIsAnonymous(false);
		setDonorName("");
		setDonorPhone("");
		setMessage("");
		setSubmitError("");
		setReOpen(true);
	};

	const handleSubmitReDonate = async () => {
		if (!reCampaignId) {
			setSubmitError("Campaign tidak valid");
			return;
		}
		const MIN_DONATION = Number(process.env.NEXT_PUBLIC_MIN_DONATION ?? 1);
		if (!finalAmount || Number(finalAmount) < MIN_DONATION) {
			setSubmitError(
				`Minimal donasi Rp ${MIN_DONATION.toLocaleString("id-ID")}`,
			);
			return;
		}
		if (missingPhone && !donorPhone) {
			setSubmitError("Nomor HP wajib diisi");
			return;
		}
		// Identitas akan otomatis diambil dari session jika tersedia
		setSubmitLoading(true);
		setSubmitError("");
		try {
			const res = await createDonation({
				campaignId: reCampaignId,
				amount: Number(finalAmount),
				donorName: isAnonymous ? "Hamba Allah" : donorName || "Tanpa Nama",
				donorPhone,
				message,
				isAnonymous,
				paymentMethod: "EWALLET", // Default for Snap
			});
			if (res.success) {
				const donationId = (res as any).data?.id;

				if ((window as any).snap?.show) {
					(window as any).snap.show();
				}

				// Get Snap Token
				const r = await fetch("/api/midtrans/snap-token", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ donationId }),
				});
				const j = await r.json();

				if (j.success && j.token && (window as any).snap) {
					const isProd =
						process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

					(window as any).snap.pay(j.token, {
						language: "id",
						...(isProd ? { uiMode: "qr" } : {}),
						onSuccess: () => {
							setReOpen(false);
							if (reCampaignId === quickCampaignId) {
								router.push("/");
							} else {
								router.push(`/donasi/${reCampaignId}?donation_success=true`);
							}
						},
						onPending: () => {
							setReOpen(false);
							if (reCampaignId === quickCampaignId) {
								router.push("/");
							} else {
								router.push(`/donasi/${reCampaignId}?donation_success=true`);
							}
						},
						onError: () => {
							setSubmitError("Pembayaran gagal");
						},
						onClose: () => {
							setSubmitError("Pembayaran belum selesai");
						},
					});
				} else {
					if ((window as any).snap?.hide) {
						(window as any).snap.hide();
					}
					setSubmitError(j.error || "Gagal memulai pembayaran");
				}
			} else {
				setSubmitError(res.error || "Gagal membuat donasi");
			}
		} catch (err) {
			if ((window as any).snap?.hide) {
				(window as any).snap.hide();
			}
			setSubmitError("Terjadi kesalahan sistem");
		} finally {
			setSubmitLoading(false);
		}
	};

	React.useEffect(() => {
		getQuickDonationCampaignId().then((id) => {
			if (id) setQuickCampaignId(id);
		});
	}, []);

	React.useEffect(() => {
		async function fetchData() {
			try {
				await checkPendingDonations(); // sinkronisasi status PENDING -> PAID/FAILED jika ada
				const res = (await getMyDonations()) as {
					success: boolean;
					data?: DonationItem[];
					error?: string;
					missingPhone?: boolean;
				};
				if (res.success && res.data) {
					setDonations(res.data);
					setMissingPhone(!!res.missingPhone);
				} else if (res.error) {
					setError(res.error);
				}
			} catch (err) {
				setError("Terjadi kesalahan saat mengambil data");
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, []);

	const handleOpenDetail = (donation: DonationItem) => {
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
		const activeDonations = donations.filter((d) => d.status === "Berhasil");
		const uniqueDays = new Set(activeDonations.map((d) => d.rawDate)).size;
		const uniqueCampaigns = new Set(activeDonations.map((d) => d.campaignId))
			.size;

		// Top Category
		const categoryCounts: Record<string, number> = {};
		activeDonations.forEach((d) => {
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
	}, [donations]);

	// Filter donations for the selected date in daily modal
	const dailyDonations = React.useMemo(() => {
		if (!selectedDate) return [];
		return donations.filter(
			(d) =>
				d.rawDate === selectedDate &&
				d.status === "Berhasil",
		);
	}, [selectedDate, donations]);

	const formatDateIndo = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	if (loading) {
		return (
			<Box sx={{ px: 2, pt: 2.5, maxWidth: 600, mx: "auto" }}>
				<Skeleton variant="text" width="50%" height={40} sx={{ mb: 2 }} />
				<Skeleton
					variant="rectangular"
					height={200}
					sx={{ borderRadius: 3, mb: 3 }}
				/>
				<Skeleton
					variant="rectangular"
					height={300}
					sx={{ borderRadius: 3, mb: 3 }}
				/>
				<Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
				<Stack spacing={2}>
					{[1, 2, 3].map((i) => (
						<Skeleton
							key={i}
							variant="rectangular"
							height={100}
							sx={{ borderRadius: 3 }}
						/>
					))}
				</Stack>
			</Box>
		);
	}

	if (error) {
		return (
			<Box sx={{ px: 2, pt: 2.5, maxWidth: 600, mx: "auto" }}>
				<Alert severity="error">{error}</Alert>
			</Box>
		);
	}

	return (
		<Box sx={{ px: 2, pt: 2.5, pb: 12, maxWidth: 600, mx: "auto" }}>
			<Script
				src={
					process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
						? "https://app.midtrans.com/snap/snap.js"
						: "https://app.sandbox.midtrans.com/snap/snap.js"
				}
				data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
				strategy="lazyOnload"
			/>
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

			{missingPhone && donations.length === 0 && (
				<Alert severity="warning" sx={{ borderRadius: 2, mb: 3 }}>
					<Typography fontWeight={700} sx={{ mb: 0.5 }}>
						Profil Belum Lengkap
					</Typography>
					Untuk melihat riwayat donasi yang tidak terhubung dengan akun ini,
					pastikan kamu telah melengkapi Nomor HP di profil akunmu.
				</Alert>
			)}

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
					<Box
						sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}
					>
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
							<Typography
								sx={{
									fontSize: 24,
									fontWeight: 900,
									textShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
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
							<Typography
								sx={{
									fontSize: 24,
									fontWeight: 900,
									textShadow: "0 2px 4px rgba(0,0,0,0.1)",
								}}
							>
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
			<KindnessCalendar donations={donations} onDateClick={handleDateClick} />

			<Typography
				sx={{ fontSize: 16, fontWeight: 800, color: "#0f172a", mb: 2 }}
			>
				Riwayat Terbaru
			</Typography>

			{donations.length === 0 ? (
				<Box sx={{ textAlign: "center", py: 5 }}>
					<SpaIcon sx={{ fontSize: 60, color: "rgba(0,0,0,0.1)", mb: 2 }} />
					<Typography sx={{ color: "text.secondary", fontSize: 14 }}>
						Belum ada riwayat donasi.
					</Typography>
					<Typography
						sx={{
							color: "text.secondary",
							fontSize: 11,
							mt: 1,
							maxWidth: 300,
							mx: "auto",
						}}
					>
						Jika kamu sudah berdonasi, pastikan Nomor HP di profilmu sama dengan
						yang kamu gunakan saat berdonasi.
					</Typography>
					<Button
						variant="contained"
						href="/"
						sx={{ mt: 2, borderRadius: 2, textTransform: "none" }}
					>
						Mulai Berdonasi
					</Button>
				</Box>
			) : (
				<>
					<Stack spacing={2}>
						{(showAll ? donations : donations.slice(0, 5)).map((item) => (
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
												{item.date}
											</Typography>
										</Box>
										<Chip
											label={item.status}
											size="small"
											color={item.status === "Berhasil" ? "success" : "warning"}
											variant={
												item.status === "Berhasil" ? "filled" : "outlined"
											}
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
												sx={{
													fontSize: 11,
													color: "rgba(15,23,42,.6)",
													mb: 0.2,
												}}
											>
												Jumlah Donasi
											</Typography>
											<Typography
												sx={{ fontSize: 15, fontWeight: 900, color: "#0ba976" }}
											>
												Rp {item.amount.toLocaleString("id-ID")}
											</Typography>
										</Box>
										<Stack direction="row" spacing={1}>
											<Button
												variant="outlined"
												size="small"
												onClick={() => openReDonate(item)}
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
					{!showAll && donations.length > 5 && (
						<Button
							fullWidth
							variant="outlined"
							onClick={() => setShowAll(true)}
							sx={{
								mt: 2,
								borderRadius: 3,
								fontWeight: 700,
								textTransform: "none",
								color: "#16a34a",
								borderColor: "rgba(22,163,74,0.3)",
								"&:hover": {
									borderColor: "#16a34a",
									bgcolor: "rgba(22,163,74,0.05)",
								},
							}}
						>
							Lihat Semua
						</Button>
					)}
				</>
			)}

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
										sx={{ fontWeight: 800, fontSize: 16, color: "#0ba976" }}
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
										{selectedDonation.prayer}
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
								onClick={() => openReDonate(selectedDonation)}
								startIcon={<VolunteerActivismIcon />}
								sx={{ borderRadius: 2, fontWeight: 700, textTransform: "none" }}
							>
								Donasi Lagi
							</Button>
						</DialogActions>
					</>
				)}
			</Dialog>

			{/* Redonate Bottom Sheet */}
			<Dialog
				open={reOpen}
				onClose={() => setReOpen(false)}
				PaperProps={{
					sx: {
						borderRadius: 3,
						width: "100%",
						maxWidth: 420,
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
						Donasi Lagi
					</Typography>
					<IconButton onClick={() => setReOpen(false)} size="small">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers sx={{ p: 2.2 }}>
					<Box sx={{ mb: 2 }}>
						<Typography
							sx={{ fontSize: 12, color: "rgba(15,23,42,.6)", mb: 0.5 }}
						>
							Campaign
						</Typography>
						<Typography sx={{ fontWeight: 800, fontSize: 14 }}>
							{reCampaignTitle}
						</Typography>
					</Box>

					<Box sx={{ mb: 2 }}>
						<Typography
							sx={{
								fontSize: 12,
								fontWeight: 900,
								color: "rgba(15,23,42,.80)",
							}}
						>
							Nominal
						</Typography>
						<Box
							sx={{
								mt: 1,
								display: "grid",
								gridTemplateColumns: "repeat(3, 1fr)",
								gap: 1,
							}}
						>
							{amountPresets.map((a) => {
								const active =
									customAmount.trim().length === 0 && selectedAmount === a;
								return (
									<Box
										key={a}
										component="button"
										type="button"
										onClick={() => {
											setCustomAmount("");
											setSelectedAmount(a);
										}}
										sx={{
											width: "100%",
											borderRadius: "12px",
											px: 1,
											py: 0.85,
											cursor: "pointer",
											fontWeight: 800,
											fontSize: 12.5,
											border: active
												? "1px solid rgba(11,169,118,0.45)"
												: "1px solid rgba(15,23,42,0.10)",
											bgcolor: active
												? "rgba(11,169,118,0.12)"
												: "rgba(255,255,255,0.92)",
											color: "rgba(15,23,42,.82)",
											boxShadow: "none",
											"&:active": { transform: "scale(0.99)" },
										}}
									>
										Rp {a.toLocaleString("id-ID")}
									</Box>
								);
							})}

							{/* Custom */}
							<Box
								sx={{
									gridColumn: "span 1",
									display: "flex",
									alignItems: "center",
									gap: 0.5,
									borderRadius: "12px",
									px: 1.2,
									py: 0.55,
									border:
										customAmount.trim().length > 0
											? "1px solid rgba(11,169,118,0.45)"
											: "1px solid rgba(15,23,42,0.10)",
									bgcolor: "rgba(255,255,255,0.92)",
									boxShadow: "none",
								}}
							>
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 800,
										color: "rgba(15,23,42,.55)",
									}}
								>
									Rp
								</Typography>
								<Box
									component="input"
									inputMode="numeric"
									placeholder="Lainnya"
									value={customAmount}
									onChange={(e) => {
										const n = e.target.value.replace(/\D/g, "");
										const formatted = n
											? n.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
											: "";
										setCustomAmount(formatted);
									}}
									style={{
										width: "100%",
										outline: "none",
										border: "none",
										background: "transparent",
										fontWeight: 800,
										fontSize: 12.5,
										color: "rgba(15,23,42,.82)",
										padding: 0,
									}}
								/>
							</Box>
						</Box>
					</Box>

					<Box sx={{ mb: 2 }}>
						<TextField
							fullWidth
							label="Doa & Dukungan (opsional)"
							multiline
							rows={1}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							inputProps={{ maxLength: 55 }}
							helperText={`${message.length}/55`}
							sx={{ mt: 1 }}
						/>
					</Box>

					<Box sx={{ mb: 1.5 }}>
						{/* Payment Method removed - using Snap */}
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button
						variant="contained"
						fullWidth
						size="large"
						onClick={handleSubmitReDonate}
						disabled={submitLoading}
						sx={{
							borderRadius: 2,
							fontWeight: 800,
							textTransform: "none",
							bgcolor: "#0ba976",
							color: "#0b1220",
							"&:hover": { bgcolor: "#4bbf59" },
						}}
					>
						{submitLoading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							"Lanjut Bayar"
						)}
					</Button>
				</DialogActions>
			</Dialog>
			<Snackbar
				open={!!submitError}
				autoHideDuration={6000}
				onClose={() => setSubmitError("")}
			>
				<Alert
					onClose={() => setSubmitError("")}
					severity="error"
					sx={{ width: "100%" }}
				>
					{submitError}
				</Alert>
			</Snackbar>
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
											sx={{ fontWeight: 800, fontSize: 13, color: "#0ba976" }}
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
											{donation.prayer}
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
