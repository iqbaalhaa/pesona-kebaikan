"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import {
	Box,
	Typography,
	Button,
	LinearProgress,
	Avatar,
	IconButton,
	Tabs,
	Tab,
	Divider,
	Paper,
	Stack,
	Container,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Slide,
	Chip,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Snackbar,
	Alert,
	Card,
	CardContent,
	Collapse,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

// Icons
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareIcon from "@mui/icons-material/Share";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";

// Social Icons
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArticleIcon from "@mui/icons-material/Article";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";

// Utils
function formatIDR(amount: number) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement<any, any>;
	},
	ref: React.Ref<unknown>
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

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
			id={`campaign-tabpanel-${index}`}
			aria-labelledby={`campaign-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ py: 3 }}>{children}</Box>}
		</div>
	);
}

function UpdateItem({ update, isLast }: { update: any; isLast: boolean }) {
	const [expanded, setExpanded] = React.useState(false);

	return (
		<Box sx={{ display: "flex", gap: 2.5 }}>
			{/* Timeline Indicator */}
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					minWidth: 40,
				}}
			>
				<Box
					sx={{
						width: 40,
						height: 40,
						borderRadius: "50%",
						bgcolor: "#fff",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						border:
							update.type === "withdrawal"
								? "2px solid #e2e8f0"
								: "2px solid #bbf7d0",
						boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
						zIndex: 1,
					}}
				>
					{update.type === "withdrawal" ? (
						<AccountBalanceWalletRoundedIcon
							sx={{ fontSize: 20, color: "#64748b" }}
						/>
					) : (
						<VerifiedUserIcon sx={{ fontSize: 20, color: "#16a34a" }} />
					)}
				</Box>
				{!isLast && (
					<Box
						sx={{
							width: 0,
							flex: 1,
							borderLeft: "2px dashed #e2e8f0",
							my: 0.5,
							position: "relative",
							zIndex: 0,
						}}
					/>
				)}
			</Box>

			{/* Content */}
			<Box sx={{ flex: 1, pb: isLast ? 0 : 0.2 }}>
				<Paper
					elevation={expanded ? 0 : 0}
					onClick={() => setExpanded(!expanded)}
					sx={{
						p: 2.5,
						borderRadius: 3,
						cursor: "pointer",
						border: "1px solid",
						borderColor: expanded ? "#e2e8f0" : "transparent",
						bgcolor: expanded ? "#fff" : "transparent",
						boxShadow: expanded ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
						transition: "all 0.3s ease",
						"&:hover": {
							bgcolor: expanded ? "#fff" : "#f8fafc",
						},
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							mb: 1,
						}}
					>
						<Typography
							variant="caption"
							sx={{
								color: "#64748b",
								fontWeight: 700,
								display: "block",
								fontSize: 11,
								letterSpacing: 0.5,
								textTransform: "uppercase",
							}}
						>
							{new Date(update.date).toLocaleDateString("id-ID", {
								day: "numeric",
								month: "long",
								year: "numeric",
							})}
						</Typography>
						<Box
							sx={{
								transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
								transition: "transform 0.3s",
							}}
						>
							<KeyboardArrowDownIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
						</Box>
					</Box>
					<Typography
						variant="h6"
						sx={{
							fontSize: 16,
							fontWeight: 700,
							color: "#0f172a",
							lineHeight: 1.5,
							mb: expanded ? 2 : 0,
						}}
					>
						{update.title}
					</Typography>

					<Collapse in={expanded} timeout="auto" unmountOnExit>
						<Typography
							variant="body2"
							sx={{
								color: "#334155",
								lineHeight: 1.8,
								whiteSpace: "pre-wrap",
								fontSize: 15,
							}}
						>
							{update.content}
						</Typography>

						{update.images && update.images.length > 0 && (
							<Box
								sx={{
									mt: 3,
									borderRadius: 3,
									overflow: "hidden",
									display: "grid",
									gridTemplateColumns:
										update.images.length === 1 ? "1fr" : "repeat(2, 1fr)",
									gap: 1,
								}}
							>
								{update.images.map((img: string, i: number) => (
									<Box
										key={i}
										component="img"
										src={img}
										alt="Update"
										sx={{
											width: "100%",
											height: update.images.length === 1 ? "auto" : 200,
											objectFit: "cover",
											borderRadius: 2,
											gridColumn:
												update.images.length % 2 !== 0 && i === 0
													? "span 2"
													: "auto",
										}}
									/>
								))}
							</Box>
						)}
					</Collapse>
				</Paper>
			</Box>
		</Box>
	);
}

import { createReport } from "@/actions/report";
import { ReportReason } from "@/generated/prisma";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import AlertTitle from "@mui/material/AlertTitle";

export default function CampaignDetailView({ data }: { data: any }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [tabValue, setTabValue] = React.useState(0);
	const [showFullStory, setShowFullStory] = React.useState(false);

	// Report state
	const [reportLoading, setReportLoading] = React.useState(false);
	const [reportReason, setReportReason] = React.useState<ReportReason | "">("");
	const [reportDetails, setReportDetails] = React.useState("");
	const [reporterName, setReporterName] = React.useState("");
	const [reporterPhone, setReporterPhone] = React.useState("");
	const [reporterEmail, setReporterEmail] = React.useState("");
	const [snack, setSnack] = React.useState<{
		open: boolean;
		msg: string;
		type: "success" | "error";
	}>({ open: false, msg: "", type: "success" });

	const REPORT_REASONS: { value: ReportReason; label: string }[] = [
		{ value: "FRAUD", label: "Penipuan/Penyalahgunaan dana" },
		{ value: "COVERED", label: "Sudah di cover pihak lain (BPJS, Asuransi)" },
		{ value: "FAKE_INFO", label: "Memberikan Informasi Palsu" },
		{ value: "DECEASED", label: "Beneficiary sudah meninggal" },
		{
			value: "NO_PERMISSION",
			label: "Tidak izin kepada keluarga penerima manfaat",
		},
		{ value: "IRRELEVANT", label: "Galang dana tidak relevan" },
		{ value: "INAPPROPRIATE", label: "Konten tidak pantas" },
		{ value: "SPAM", label: "Spamming" },
		{ value: "OTHER", label: "Lainnya" },
	];

	const handleSubmitReport = async () => {
		if (
			!reportReason ||
			!reportDetails ||
			!reporterName ||
			!reporterPhone ||
			!reporterEmail
		) {
			setSnack({ open: true, msg: "Mohon lengkapi semua data", type: "error" });
			return;
		}

		setReportLoading(true);
		const res = await createReport({
			campaignId: data.id,
			reason: reportReason as ReportReason,
			details: reportDetails,
			reporterName,
			reporterPhone,
			reporterEmail,
		});
		setReportLoading(false);

		if (res.success) {
			setOpenReportModal(false);
			setReportSuccessOpen(true);
			// Reset form
			setReportReason("");
			setReportDetails("");
			setReporterName("");
			setReporterPhone("");
			setReporterEmail("");
		} else {
			setSnack({
				open: true,
				msg: res.error || "Gagal mengirim laporan",
				type: "error",
			});
		}
	};

	// Modals State
	const [openMedicalModal, setOpenMedicalModal] = React.useState(false);
	const [openDonorsModal, setOpenDonorsModal] = React.useState(false);
	const [openShareModal, setOpenShareModal] = React.useState(false);
	const [openFundDetailsModal, setOpenFundDetailsModal] = React.useState(false);
	const [snackbarOpen, setSnackbarOpen] = React.useState(false);
	const [donationSuccessOpen, setDonationSuccessOpen] = React.useState(false);
	const [openReportModal, setOpenReportModal] = React.useState(false);
	const [reportSuccessOpen, setReportSuccessOpen] = React.useState(false);

	React.useEffect(() => {
		if (searchParams.get("donation_success") === "true") {
			setDonationSuccessOpen(true);
			// Clean up URL
			router.replace(`/donasi/${data.slug || data.id}`, { scroll: false });
		}
	}, [searchParams, data.slug, data.id, router]);

	// Image Carousel State
	const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
	const carouselRef = React.useRef<HTMLDivElement>(null);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const progress = Math.min(
		100,
		Math.round((data.collected / data.target) * 100)
	);

	const isMedis = data.category === "Bantuan Medis & Kesehatan";

	const donations = data.donations || [];
	const prayers = donations.filter(
		(d: any) => d.comment && d.comment.trim() !== ""
	);
	const latestDonations = donations.slice(0, 3);
	const latestPrayers = prayers.slice(0, 3);
	const hasWithdrawals =
		data.updates && data.updates.some((u: any) => u.type === "withdrawal");
	const withdrawalCount =
		data.updates?.filter((u: any) => u.type === "withdrawal").length || 0;
	const updateCount = data.updates?.length || 0;

	// Calculate Fund Details
	const totalCollected = data.collected || 0;
	// Mocking fees as 5% for display purposes to match design (in real app, this comes from backend)
	const fees = Math.round(totalCollected * 0.05);
	// Calculate withdrawn amount from updates if available
	const withdrawn =
		data.updates
			?.filter((u: any) => u.type === "withdrawal")
			.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) || 0;
	const remaining = totalCollected - fees - withdrawn;
	// Mock duration
	const campaignDuration = 23; // Days running

	// Handle Image Scroll
	const handleScroll = () => {
		if (carouselRef.current) {
			const scrollLeft = carouselRef.current.scrollLeft;
			const width = carouselRef.current.clientWidth;
			const index = Math.round(scrollLeft / width);
			setCurrentImageIndex(index);
		}
	};

	const scrollToImage = (index: number) => {
		if (carouselRef.current) {
			const width = carouselRef.current.clientWidth;
			carouselRef.current.scrollTo({
				left: width * index,
				behavior: "smooth",
			});
		}
	};

	// Share Logic
	const shareUrl = typeof window !== "undefined" ? window.location.href : "";
	const shareText = `Bantu ${data.title} di Pesona Kebaikan`;

	const handleShareAction = (platform: string) => {
		let url = "";
		switch (platform) {
			case "whatsapp":
				url = `https://wa.me/?text=${encodeURIComponent(
					shareText + " " + shareUrl
				)}`;
				break;
			case "facebook":
				url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
					shareUrl
				)}`;
				break;
			case "twitter":
				url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
					shareText
				)}&url=${encodeURIComponent(shareUrl)}`;
				break;
			case "instagram":
				navigator.clipboard.writeText(shareUrl);
				setSnackbarOpen(true);
				window.open("https://www.instagram.com/", "_blank");
				setOpenShareModal(false);
				return;
			case "copy":
				navigator.clipboard.writeText(shareUrl);
				setSnackbarOpen(true);
				setOpenShareModal(false);
				return;
			default:
				break;
		}
		if (url) {
			window.open(url, "_blank");
			setOpenShareModal(false);
		}
	};

	const images =
		data.images && data.images.length > 0
			? data.images
			: [data.thumbnail || "https://placehold.co/600x400?text=No+Image"];

	return (
		<Box
			sx={{
				// Add extra padding at bottom for sticky footer
				pb: "100px",
				bgcolor: "#fff",
				minHeight: "100vh",
			}}
		>
			{/* Mobile Header (Floating) */}
			<Box
				sx={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					zIndex: 1100,
					display: "flex",
					justifyContent: "space-between",
					p: 2,
					background:
						"linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)",
					pointerEvents: "none",
				}}
			>
				<IconButton
					onClick={() => router.back()}
					sx={{
						color: "white",
						bgcolor: "rgba(0,0,0,0.3)",
						pointerEvents: "auto",
						"&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
					}}
				>
					<ArrowBackIcon />
				</IconButton>
			</Box>

			{/* Hero Image Carousel */}
			<Box
				sx={{
					position: "relative",
					width: "100%",
					aspectRatio: { xs: "4/3", sm: "16/9", md: "21/9" },
					bgcolor: "#f1f5f9",
				}}
			>
				<Box
					ref={carouselRef}
					onScroll={handleScroll}
					sx={{
						display: "flex",
						overflowX: "auto",
						scrollSnapType: "x mandatory",
						width: "100%",
						height: "100%",
						"&::-webkit-scrollbar": { display: "none" },
					}}
				>
					{images.map((img: string, index: number) => (
						<Box
							key={index}
							sx={{
								minWidth: "100%",
								height: "100%",
								scrollSnapAlign: "start",
								position: "relative",
							}}
						>
							<Image
								src={img}
								alt={`${data.title} - ${index + 1}`}
								fill
								style={{ objectFit: "cover" }}
								priority={index === 0}
							/>
						</Box>
					))}
				</Box>
				{/* Indicators */}
				{images.length > 1 && (
					<Box
						sx={{
							position: "absolute",
							bottom: 32, // Lifted up to not be covered by the rounded card
							left: 0,
							right: 0,
							display: "flex",
							justifyContent: "center",
							gap: 1,
							zIndex: 10,
						}}
					>
						{images.map((_: any, index: number) => (
							<Box
								key={index}
								onClick={() => scrollToImage(index)}
								sx={{
									width: 8,
									height: 8,
									borderRadius: "50%",
									bgcolor:
										currentImageIndex === index
											? "white"
											: "rgba(255,255,255,0.5)",
									cursor: "pointer",
									boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
								}}
							/>
						))}
					</Box>
				)}
			</Box>

			<Container maxWidth="md" sx={{ px: { xs: 0, sm: 2 } }}>
				<Box
					sx={{
						px: 2,
						py: 3,
						mt: { xs: 0, sm: -4 },
						position: "relative",
						bgcolor: "white",
						borderRadius: { xs: 0, sm: "16px 16px 0 0" },
						boxShadow: { xs: "none", sm: "0 -4px 20px rgba(0,0,0,0.05)" },
					}}
				>
					{/* Title & Category */}
					<Box sx={{ mb: 2 }}>
						<Typography
							variant="h1"
							sx={{
								fontSize: { xs: 20, sm: 24 },
								fontWeight: 800,
								lineHeight: 1.4,
								color: "#0f172a",
								mb: 1,
							}}
						>
							{data.title}
						</Typography>
						{isMedis && (
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								<MedicalServicesOutlinedIcon
									sx={{ fontSize: 16, color: "#e11d48" }}
								/>
								<Typography
									sx={{ fontSize: 12, color: "#e11d48", fontWeight: 600 }}
								>
									Bantuan Medis & Kesehatan
								</Typography>
							</Box>
						)}
					</Box>

					{/* Progress Stats */}
					<Box sx={{ mb: 3 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-end",
								mb: 1,
							}}
						>
							<Box>
								<Typography
									sx={{ fontSize: 20, fontWeight: 800, color: "#61ce70" }}
								>
									{formatIDR(data.collected)}
								</Typography>
								<Typography
									sx={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}
								>
									terkumpul dari {formatIDR(data.target)}
								</Typography>
							</Box>
							<Box sx={{ textAlign: "right" }}>
								<Typography
									sx={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}
								>
									{data.daysLeft}
								</Typography>
								<Typography sx={{ fontSize: 12, color: "#64748b" }}>
									hari lagi
								</Typography>
							</Box>
						</Box>
						<LinearProgress
							variant="determinate"
							value={progress}
							sx={{
								height: 8,
								borderRadius: 4,
								bgcolor: "#f1f5f9",
								"& .MuiLinearProgress-bar": {
									bgcolor: "#61ce70",
									borderRadius: 4,
								},
							}}
						/>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
								gap: 1,
								mt: 2,
								alignItems: "center",
							}}
						>
							{/* Donasi */}
							<Box
								onClick={() => setOpenDonorsModal(true)}
								sx={{
									textAlign: "center",
									cursor: "pointer",
									"&:hover": { opacity: 0.8 },
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: 1,
										mb: 0.5,
									}}
								>
									<FavoriteIcon sx={{ color: "#0ea5e9", fontSize: 20 }} />
									<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
										{data.donors}
									</Typography>
								</Box>
								<Typography sx={{ fontSize: 12, color: "#64748b" }}>
									Donasi
								</Typography>
							</Box>

							<Divider orientation="vertical" sx={{ height: 30 }} />

							{/* Kabar Terbaru */}
							<Box
								onClick={() => setTabValue(1)}
								sx={{
									textAlign: "center",
									cursor: "pointer",
									"&:hover": { opacity: 0.8 },
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: 1,
										mb: 0.5,
									}}
								>
									<ArticleIcon sx={{ color: "#64748b", fontSize: 20 }} />
									<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
										{updateCount}
									</Typography>
								</Box>
								<Typography sx={{ fontSize: 12, color: "#64748b" }}>
									Kabar Terbaru
								</Typography>
							</Box>

							<Divider orientation="vertical" sx={{ height: 30 }} />

							{/* Pencairan Dana */}
							<Box
								onClick={() => setTabValue(1)}
								sx={{
									textAlign: "center",
									cursor: "pointer",
									"&:hover": { opacity: 0.8 },
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										gap: 1,
										mb: 0.5,
									}}
								>
									<RequestQuoteIcon sx={{ color: "#64748b", fontSize: 20 }} />
									<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
										{withdrawalCount} kali
									</Typography>
								</Box>
								<Typography sx={{ fontSize: 12, color: "#64748b" }}>
									Pencairan Dana
								</Typography>
							</Box>
						</Box>
					</Box>

					<Divider sx={{ my: 3 }} />

					{/* Informasi Penggalangan Dana */}
					<Box sx={{ mb: 3 }}>
						<Typography
							variant="h6"
							sx={{
								fontSize: 16,
								fontWeight: 700,
								color: "#0f172a",
								mb: 2,
							}}
						>
							Informasi Penggalangan Dana
						</Typography>
						<Box
							sx={{
								border: "1px solid #e2e8f0",
								borderRadius: 3,
								overflow: "hidden",
							}}
						>
							<Box sx={{ p: 2 }}>
								<Typography
									sx={{
										fontSize: 13,
										fontWeight: 700,
										color: "#334155",
										mb: 2,
									}}
								>
									Penggalang Dana
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
									<Avatar
										sx={{ width: 48, height: 48, border: "1px solid #f1f5f9" }}
										src={data.ownerAvatar}
									>
										{data.ownerName.charAt(0)}
									</Avatar>
									<Box>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: 0.5,
												mb: 0.25,
											}}
										>
											<Typography
												sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}
											>
												{data.ownerName}
											</Typography>
											<VerifiedUserIcon
												sx={{ fontSize: 16, color: "#3b82f6" }}
											/>
											<Chip
												label="ORG"
												size="small"
												sx={{
													height: 16,
													fontSize: 9,
													fontWeight: 700,
													bgcolor: "#e0f2fe",
													color: "#0284c7",
													borderRadius: 1,
													px: 0.5,
													"& .MuiChip-label": { px: 0.5 },
												}}
											/>
										</Box>
										<Typography sx={{ fontSize: 12, color: "#64748b" }}>
											Identitas terverifikasi
										</Typography>
									</Box>
								</Box>
							</Box>

							<Divider />

							<Box
								onClick={() => setOpenFundDetailsModal(true)}
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									p: 2,
									cursor: "pointer",
									"&:hover": { bgcolor: "#f8fafc" },
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
									<AccountBalanceWalletOutlinedIcon
										sx={{ color: "#64748b", fontSize: 22 }}
									/>
									<Typography
										sx={{ fontSize: 14, fontWeight: 600, color: "#334155" }}
									>
										Rincian penggunaan dana
									</Typography>
								</Box>
								<NavigateNextIcon sx={{ color: "#94a3b8" }} />
							</Box>
						</Box>
					</Box>

					<Divider sx={{ my: 3 }} />

					{/* Tabs */}
					<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
						<Tabs
							value={tabValue}
							onChange={handleTabChange}
							variant="fullWidth"
							sx={{
								"& .MuiTab-root": {
									textTransform: "none",
									fontWeight: 600,
									fontSize: 14,
								},
								"& .Mui-selected": { color: "#61ce70" },
								"& .MuiTabs-indicator": { bgcolor: "#61ce70" },
							}}
						>
							<Tab label="Cerita" />
							<Tab label="Kabar Terbaru" />
						</Tabs>
					</Box>

					{/* Tab: Cerita */}
					<CustomTabPanel value={tabValue} index={0}>
						<Box
							sx={{
								position: "relative",
							}}
						>
							<Box
								sx={{
									color: "#334155",
									lineHeight: 1.8,
									fontSize: 15,
									maxHeight: showFullStory ? "none" : 300,
									overflow: "hidden",
									"& p": { mb: 2 },
									"& ul": { mb: 2, pl: 2 },
									"& li": { mb: 0.5 },
									"& img": {
										maxWidth: "100%",
										height: "auto",
										borderRadius: 2,
										display: "block",
									},
								}}
								dangerouslySetInnerHTML={{ __html: data.description }}
							/>
							{!showFullStory && (
								<Box
									sx={{
										position: "absolute",
										bottom: 0,
										left: 0,
										right: 0,
										height: 120,
										background:
											"linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 80%)",
										pointerEvents: "none",
									}}
								/>
							)}
						</Box>
						<Button
							onClick={() => setShowFullStory(!showFullStory)}
							fullWidth
							sx={{ mt: 2, textTransform: "none", color: "#61ce70" }}
						>
							{showFullStory ? "Tutup Cerita" : "Baca Selengkapnya"}
						</Button>

						<Divider sx={{ my: 3 }} />

						{/* Pencairan Dana */}
						{hasWithdrawals && (
							<Box
								onClick={() => setTabValue(1)}
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 3,
									cursor: "pointer",
								}}
							>
								<Typography variant="h6" sx={{ fontWeight: 700 }}>
									Pencairan Dana
								</Typography>
								<NavigateNextIcon sx={{ color: "#94a3b8" }} />
							</Box>
						)}

						{/* Donasi */}
						<Box sx={{ mb: 4 }}>
							<Box
								onClick={() => setOpenDonorsModal(true)}
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 2.5,
									cursor: "pointer",
									"&:hover .MuiTypography-root": { color: "#0ea5e9" },
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<Typography
										variant="h6"
										sx={{ fontWeight: 700, transition: "color 0.2s" }}
									>
										Donasi
									</Typography>
									<Chip
										label={data.donors}
										size="small"
										sx={{
											bgcolor: "#e0f2fe",
											color: "#0284c7",
											fontWeight: 700,
											height: 24,
											borderRadius: 1.5,
										}}
									/>
								</Box>
								<NavigateNextIcon sx={{ color: "#94a3b8" }} />
							</Box>

							<Stack spacing={2}>
								{latestDonations.map((d: any) => (
									<Paper
										elevation={0}
										key={d.id}
										sx={{
											display: "flex",
											gap: 2,
											p: 2,
											bgcolor: "#f8fafc",
											borderRadius: 3,
											border: "1px solid #f1f5f9",
										}}
									>
										<Avatar
											sx={{
												width: 44,
												height: 44,
												bgcolor: "#fff",
												border: "1px solid #e2e8f0",
												color: "#64748b",
												fontWeight: 700,
											}}
											src="/images/avatar-placeholder.png"
										>
											{d.name.charAt(0)}
										</Avatar>
										<Box sx={{ flex: 1 }}>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "flex-start",
												}}
											>
												<Typography
													sx={{
														fontWeight: 700,
														fontSize: 14,
														color: "#0f172a",
													}}
												>
													{d.name}
												</Typography>
												<Typography
													sx={{
														fontSize: 11,
														color: "#94a3b8",
														fontWeight: 500,
													}}
												>
													{formatDistanceToNow(new Date(d.date), {
														addSuffix: true,
														locale: id,
													})}
												</Typography>
											</Box>
											<Typography
												sx={{ fontSize: 13, color: "#334155", mt: 0.5 }}
											>
												Berdonasi sebesar{" "}
												<span style={{ fontWeight: 700, color: "#61ce70" }}>
													{formatIDR(d.amount)}
												</span>
											</Typography>
										</Box>
									</Paper>
								))}
							</Stack>
						</Box>

						{/* Doa-doa */}
						<Box sx={{ mb: 1 }}>
							<Box
								onClick={() => setOpenDonorsModal(true)}
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 2.5,
									cursor: "pointer",
									"&:hover .MuiTypography-root": { color: "#0ea5e9" },
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<Typography
										variant="h6"
										sx={{ fontWeight: 700, transition: "color 0.2s" }}
									>
										Doa-doa Orang Baik
									</Typography>
									<Chip
										label={prayers.length}
										size="small"
										sx={{
											bgcolor: "#e0f2fe",
											color: "#0284c7",
											fontWeight: 700,
											height: 24,
											borderRadius: 1.5,
										}}
									/>
								</Box>
								<NavigateNextIcon sx={{ color: "#94a3b8" }} />
							</Box>

							<Stack spacing={2}>
								{latestPrayers.map((d: any) => (
									<Paper
										elevation={0}
										key={d.id}
										sx={{
											display: "flex",
											gap: 2,
											p: 2,
											bgcolor: "#fff",
											borderRadius: 3,
											border: "1px solid #e2e8f0",
											boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
										}}
									>
										<Avatar
											sx={{
												width: 44,
												height: 44,
												bgcolor: "#f1f5f9",
												color: "#64748b",
												fontWeight: 700,
											}}
											src="/images/avatar-placeholder.png"
										>
											{d.name.charAt(0)}
										</Avatar>
										<Box sx={{ flex: 1 }}>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													mb: 0.5,
												}}
											>
												<Typography
													sx={{
														fontWeight: 700,
														fontSize: 14,
														color: "#0f172a",
													}}
												>
													{d.name}
												</Typography>
												<Typography sx={{ fontSize: 11, color: "#94a3b8" }}>
													{formatDistanceToNow(new Date(d.date), {
														addSuffix: true,
														locale: id,
													})}
												</Typography>
											</Box>
											<Typography
												sx={{
													fontSize: 14,
													color: "#334155",
													fontStyle: "italic",
													lineHeight: 1.6,
												}}
											>
												"{d.comment}"
											</Typography>
										</Box>
									</Paper>
								))}
								{latestPrayers.length === 0 && (
									<Box
										sx={{
											textAlign: "center",
											py: 4,
											bgcolor: "#f8fafc",
											borderRadius: 3,
										}}
									>
										<Typography
											sx={{
												fontSize: 13,
												color: "#64748b",
												fontStyle: "italic",
											}}
										>
											Belum ada doa.
										</Typography>
									</Box>
								)}
							</Stack>
						</Box>
					</CustomTabPanel>

					{/* Tab: Kabar Terbaru */}
					<CustomTabPanel value={tabValue} index={1}>
						{data.updates && data.updates.length > 0 ? (
							<Stack spacing={0}>
								{data.updates.map((update: any, index: number) => (
									<UpdateItem
										key={update.id}
										update={update}
										isLast={index === data.updates.length - 1}
									/>
								))}
							</Stack>
						) : (
							<Box
								sx={{
									textAlign: "center",
									py: 8,
									px: 2,
									bgcolor: "#f8fafc",
									borderRadius: 4,
									border: "1px dashed #e2e8f0",
								}}
							>
								<Box
									sx={{
										width: 64,
										height: 64,
										bgcolor: "#f1f5f9",
										borderRadius: "50%",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										mx: "auto",
										mb: 2,
									}}
								>
									<VolunteerActivismIcon
										sx={{ color: "#94a3b8", fontSize: 32 }}
									/>
								</Box>
								<Typography variant="subtitle1" fontWeight={600} gutterBottom>
									Belum ada kabar terbaru
								</Typography>
								<Typography variant="body2" color="text.secondary">
									Pemilik campaign belum memposting update apapun.
								</Typography>
							</Box>
						)}
					</CustomTabPanel>

					<Box sx={{ mt: 4, mb: 2, textAlign: "center" }}>
						<Button
							color="inherit"
							size="small"
							startIcon={<FlagOutlinedIcon />}
							onClick={() => setOpenReportModal(true)}
							sx={{
								color: "#94a3b8",
								textTransform: "none",
								fontSize: 13,
								fontWeight: 500,
								"&:hover": {
									bgcolor: "#f1f5f9",
									color: "#64748b",
								},
							}}
						>
							Jika penggalangan dana ini mencurigakan, laporkan
						</Button>
					</Box>
				</Box>
			</Container>

			{/* Bottom Actions */}
			<Paper
				elevation={3}
				sx={{
					position: "fixed",
					bottom: 0,
					left: { xs: 0, sm: "50%" },
					transform: { xs: "none", sm: "translateX(-50%)" },
					width: "100%",
					maxWidth: { xs: "100%", sm: 480 },
					zIndex: 1000,
					p: 2,
					borderTop: "1px solid #e2e8f0",
					bgcolor: "white",
				}}
			>
				<Container maxWidth="md" sx={{ display: "flex", gap: 2 }}>
					<Button
						variant="outlined"
						onClick={() => setOpenShareModal(true)}
						sx={{
							minWidth: 48,
							width: 48,
							height: 48,
							borderRadius: "12px",
							borderColor: "#e2e8f0",
							color: "#64748b",
						}}
					>
						<ShareIcon />
					</Button>
					<Button
						variant="contained"
						fullWidth
						onClick={() =>
							router.push(`/donasi/${data.slug || data.id}/payment`)
						}
						sx={{
							bgcolor: "#e11d48",
							color: "white",
							borderRadius: "12px",
							fontWeight: 700,
							fontSize: 16,
							boxShadow: "0 4px 12px rgba(225, 29, 72, 0.3)",
							"&:hover": { bgcolor: "#be123c" },
						}}
					>
						Donasi Sekarang
					</Button>
				</Container>
			</Paper>

			{/* Share Modal */}
			<Dialog
				open={openShareModal}
				onClose={() => setOpenShareModal(false)}
				TransitionComponent={Transition}
				fullWidth
				maxWidth="xs"
				PaperProps={{
					sx: { borderRadius: "20px", m: 2, position: "absolute", bottom: 0 },
				}}
			>
				<Box
					sx={{
						p: 2,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Typography sx={{ fontWeight: 700 }}>Bagikan kebaikan ini</Typography>
					<IconButton onClick={() => setOpenShareModal(false)} size="small">
						<CloseIcon />
					</IconButton>
				</Box>
				<DialogContent>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(4, 1fr)",
							gap: 2,
						}}
					>
						<Box
							onClick={() => handleShareAction("whatsapp")}
							sx={{ textAlign: "center", cursor: "pointer" }}
						>
							<Avatar
								sx={{
									bgcolor: "#25D366",
									width: 50,
									height: 50,
									mx: "auto",
									mb: 1,
								}}
							>
								<WhatsAppIcon />
							</Avatar>
							<Typography variant="caption">WhatsApp</Typography>
						</Box>
						<Box
							onClick={() => handleShareAction("facebook")}
							sx={{ textAlign: "center", cursor: "pointer" }}
						>
							<Box
								sx={{
									textAlign: "center",
									cursor: "pointer",
								}}
							>
								<Avatar
									sx={{
										bgcolor: "#1877F2",
										width: 50,
										height: 50,
										mx: "auto",
										mb: 1,
									}}
								>
									<FacebookIcon />
								</Avatar>
								<Typography variant="caption">Facebook</Typography>
							</Box>
						</Box>
						<Box
							onClick={() => handleShareAction("twitter")}
							sx={{ textAlign: "center", cursor: "pointer" }}
						>
							<Box sx={{ textAlign: "center", cursor: "pointer" }}>
								<Avatar
									sx={{
										bgcolor: "#1DA1F2",
										width: 50,
										height: 50,
										mx: "auto",
										mb: 1,
									}}
								>
									<TwitterIcon />
								</Avatar>
								<Typography variant="caption">Twitter</Typography>
							</Box>
						</Box>
						<Box
							onClick={() => handleShareAction("copy")}
							sx={{ textAlign: "center", cursor: "pointer" }}
						>
							<Box sx={{ textAlign: "center", cursor: "pointer" }}>
								<Avatar
									sx={{
										bgcolor: "#f1f5f9",
										color: "#64748b",
										width: 50,
										height: 50,
										mx: "auto",
										mb: 1,
									}}
								>
									<ContentCopyIcon />
								</Avatar>
								<Typography variant="caption">Salin</Typography>
							</Box>
						</Box>
					</Box>
				</DialogContent>
			</Dialog>

			{/* Fund Details Modal */}
			<Dialog
				open={openFundDetailsModal}
				onClose={() => setOpenFundDetailsModal(false)}
				TransitionComponent={Transition}
				fullWidth
				maxWidth="xs"
				PaperProps={{
					sx: { borderRadius: "16px" },
				}}
			>
				<DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>
					Rincian Penggunaan Dana
				</DialogTitle>
				<DialogContent dividers>
					{/* Header Status */}
					<Box sx={{ display: "flex", gap: 2, mb: 3 }}>
						<AccountBalanceWalletRoundedIcon
							sx={{ color: "#0284c7", fontSize: 28 }}
						/>
						<Box>
							<Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>
								Status Dana Terkumpul
							</Typography>
							<Typography sx={{ fontSize: 13, color: "#64748b" }}>
								Penggalang dana sudah mengumpulkan dana selama{" "}
								{campaignDuration} hari.
							</Typography>
						</Box>
					</Box>

					{/* Total Collected */}
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Chip
								label="100%"
								size="small"
								sx={{
									bgcolor: "#0ea5e9",
									color: "white",
									fontWeight: 700,
									height: 24,
								}}
							/>
							<Typography sx={{ fontWeight: 700, fontSize: 14 }}>
								Dana terkumpul
							</Typography>
						</Box>
						<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
							{formatIDR(totalCollected)}
						</Typography>
					</Box>

					{/* Breakdown Box */}
					<Box
						sx={{
							bgcolor: "#e0f2fe",
							borderRadius: 2,
							p: 2,
							mb: 3,
						}}
					>
						<Box sx={{ mb: 1.5 }}>
							<Chip
								label="100%"
								size="small"
								sx={{
									bgcolor: "#0ea5e9",
									color: "white",
									fontWeight: 700,
									height: 20,
									fontSize: 11,
									mb: 1,
								}}
							/>
						</Box>

						<Stack spacing={1.5}>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									fontSize: 14,
								}}
							>
								<Typography sx={{ fontSize: 14, color: "#334155" }}>
									Dana untuk penggalangan dana
								</Typography>
								<Typography sx={{ fontSize: 14, fontWeight: 500 }}>
									{formatIDR(totalCollected)}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									fontSize: 14,
								}}
							>
								<Typography sx={{ fontSize: 14, color: "#334155" }}>
									Biaya transaksi dan teknologi*
								</Typography>
								<Typography sx={{ fontSize: 14, fontWeight: 500 }}>
									{formatIDR(fees)}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									fontSize: 14,
								}}
							>
								<Typography sx={{ fontSize: 14, color: "#334155" }}>
									Sudah dicairkan
								</Typography>
								<Typography sx={{ fontSize: 14, fontWeight: 500 }}>
									{formatIDR(withdrawn)}
								</Typography>
							</Box>

							<Divider sx={{ borderColor: "#bae6fd" }} />

							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									fontSize: 14,
								}}
							>
								<Typography sx={{ fontSize: 14, fontWeight: 700 }}>
									Belum dicairkan**
								</Typography>
								<Typography sx={{ fontSize: 14, fontWeight: 700 }}>
									{formatIDR(remaining)}
								</Typography>
							</Box>
						</Stack>
					</Box>

					{/* Optional Donation */}
					<Box sx={{ mb: 3 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
							<Chip
								label="0%"
								size="small"
								sx={{
									bgcolor: "#e2e8f0",
									color: "#64748b",
									fontWeight: 700,
									height: 20,
									fontSize: 11,
								}}
							/>
							<Typography sx={{ fontSize: 14, color: "#64748b" }}>
								Donasi operasional yayasan pesona kebaikan
							</Typography>
						</Box>
					</Box>

					{/* Footnotes */}
					<Box
						sx={{
							bgcolor: "#fefce8",
							p: 2,
							borderRadius: 2,
							fontSize: 12,
							color: "#854d0e",
						}}
					>
						<Typography sx={{ fontSize: 12, mb: 1, lineHeight: 1.5 }}>
							* Biaya ini 100% dibayarkan kepada pihak ketiga penyedia layanan
							transaksi digital dan Virtual Account, dompet digital dan QRIS
							serta layanan notifikasi (SMS, WA & email) dan server. Pesona
							Kebaikan tidak mengambil keuntungan dari layanan ini.
						</Typography>
						<Typography sx={{ fontSize: 12, lineHeight: 1.5 }}>
							** Dana dapat dicairkan dan dikelola oleh penggalang dana. Jika
							terdapat sisa uang, belum dicairkan, maka uang tersebut akan
							disalurkan ke penerima manfaat yang ditunjuk.
						</Typography>
					</Box>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button
						fullWidth
						variant="contained"
						onClick={() => setOpenFundDetailsModal(false)}
						sx={{
							bgcolor: "#0ea5e9",
							textTransform: "none",
							fontWeight: 700,
							py: 1.5,
							borderRadius: 2,
							"&:hover": { bgcolor: "#0284c7" },
						}}
					>
						Tutup
					</Button>
				</DialogActions>
			</Dialog>

			{/* Donors Modal */}
			<Dialog
				open={openDonorsModal}
				onClose={() => setOpenDonorsModal(false)}
				TransitionComponent={Transition}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: { borderRadius: "20px", maxHeight: "80vh" },
				}}
			>
				<DialogTitle
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="h6" fontWeight={700} component="div">
						Donatur ({data.donors})
					</Typography>
					<IconButton onClick={() => setOpenDonorsModal(false)} size="small">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers>
					<List>
						{data.donations && data.donations.length > 0 ? (
							data.donations.map((donation: any) => (
								<ListItem
									key={donation.id}
									alignItems="flex-start"
									disableGutters
								>
									<ListItemText
										primaryTypographyProps={{ component: "div" }}
										secondaryTypographyProps={{ component: "div" }}
										primary={
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
												}}
											>
												<Typography variant="subtitle2" fontWeight={700}>
													{donation.name}
												</Typography>
												<Typography variant="caption" color="text.secondary">
													{new Date(donation.date).toLocaleDateString("id-ID")}
												</Typography>
											</Box>
										}
										secondary={
											<React.Fragment>
												<Typography
													sx={{
														display: "inline",
														fontWeight: 600,
														color: "#61ce70",
													}}
													component="span"
													variant="body2"
												>
													{formatIDR(donation.amount)}
												</Typography>
												{donation.comment && (
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ mt: 0.5 }}
														component="div"
													>
														"{donation.comment}"
													</Typography>
												)}
											</React.Fragment>
										}
									/>
								</ListItem>
							))
						) : (
							<Typography
								sx={{ textAlign: "center", py: 4, color: "text.secondary" }}
							>
								Belum ada donasi. Jadilah yang pertama!
							</Typography>
						)}
					</List>
				</DialogContent>
			</Dialog>

			{/* Medical Modal (Placeholder) */}
			<Dialog
				open={openMedicalModal}
				onClose={() => setOpenMedicalModal(false)}
				TransitionComponent={Transition}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: { borderRadius: "20px" },
				}}
			>
				<DialogTitle
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<Typography variant="h6" fontWeight={700} component="div">
						Informasi Medis
					</Typography>
					<IconButton onClick={() => setOpenMedicalModal(false)} size="small">
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<Typography sx={{ color: "text.secondary" }}>
						Detail informasi medis lengkap tersedia dalam cerita penggalangan
						dana. Silakan baca bagian cerita untuk mengetahui kondisi terkini
						penerima manfaat.
					</Typography>
				</DialogContent>
			</Dialog>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={3000}
				onClose={() => setSnackbarOpen(false)}
				message="Tautan berhasil disalin"
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			/>

			{/* Report Modal */}
			<Dialog
				open={openReportModal}
				onClose={() => setOpenReportModal(false)}
				TransitionComponent={Transition}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: {
						borderRadius: "24px",
						maxHeight: "90vh",
						bgcolor: "#ffffff",
						backgroundImage: "none",
						boxShadow: "0 20px 40px -4px rgba(0,0,0,0.1)",
					},
				}}
			>
				<DialogTitle
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						p: 3,
						pb: 2,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<Box
							sx={{
								width: 40,
								height: 40,
								borderRadius: "12px",
								bgcolor: "#fee2e2",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<ReportProblemRoundedIcon sx={{ color: "#ef4444" }} />
						</Box>
						<Box>
							<Typography
								variant="h6"
								fontWeight={800}
								sx={{ lineHeight: 1.2 }}
							>
								Laporkan Campaign
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Bantu kami menjaga keamanan platform
							</Typography>
						</Box>
					</Box>
					<IconButton
						onClick={() => setOpenReportModal(false)}
						sx={{
							bgcolor: "#f1f5f9",
							"&:hover": { bgcolor: "#e2e8f0" },
						}}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				</DialogTitle>

				<DialogContent sx={{ p: 3, pt: 1 }}>
					<Alert
						severity="info"
						icon={false}
						sx={{
							mb: 3,
							bgcolor: "#f0f9ff",
							color: "#0c4a6e",
							border: "1px solid #bae6fd",
							"& .MuiAlert-message": { width: "100%" },
							borderRadius: "16px",
						}}
					>
						<AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>
							Identitas Pelapor Dilindungi
						</AlertTitle>
						<Typography variant="body2" sx={{ opacity: 0.9 }}>
							Data diri Anda tidak akan dibagikan kepada penggalang dana. Kami
							menjaga kerahasiaan identitas pelapor sepenuhnya.
						</Typography>
					</Alert>

					<Stack spacing={2.5}>
						<Box>
							<Typography
								variant="subtitle2"
								fontWeight={700}
								sx={{ mb: 1, color: "#334155" }}
							>
								Data Pelapor
							</Typography>
							<Stack spacing={2}>
								<TextField
									fullWidth
									placeholder="Nama Lengkap"
									value={reporterName}
									onChange={(e) => setReporterName(e.target.value)}
									InputProps={{
										sx: { borderRadius: "12px", bgcolor: "#f8fafc" },
									}}
									sx={{
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "#e2e8f0",
										},
									}}
								/>
								<Box sx={{ display: "flex", gap: 2 }}>
									<TextField
										fullWidth
										placeholder="No. WhatsApp"
										value={reporterPhone}
										onChange={(e) => setReporterPhone(e.target.value)}
										InputProps={{
											sx: { borderRadius: "12px", bgcolor: "#f8fafc" },
										}}
										sx={{
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: "#e2e8f0",
											},
										}}
									/>
									<TextField
										fullWidth
										placeholder="Email Aktif"
										value={reporterEmail}
										onChange={(e) => setReporterEmail(e.target.value)}
										InputProps={{
											sx: { borderRadius: "12px", bgcolor: "#f8fafc" },
										}}
										sx={{
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: "#e2e8f0",
											},
										}}
									/>
								</Box>
							</Stack>
						</Box>

						<Box>
							<Typography
								variant="subtitle2"
								fontWeight={700}
								sx={{ mb: 1, color: "#334155" }}
							>
								Detail Masalah
							</Typography>
							<Stack spacing={2}>
								<FormControl fullWidth>
									<Select
										value={reportReason}
										onChange={(e) =>
											setReportReason(e.target.value as ReportReason)
										}
										displayEmpty
										renderValue={(selected) => {
											if (!selected) {
												return (
													<Typography color="text.secondary">
														Pilih jenis pelanggaran
													</Typography>
												);
											}
											return REPORT_REASONS.find((r) => r.value === selected)
												?.label;
										}}
										sx={{
											borderRadius: "12px",
											bgcolor: "#f8fafc",
											"& .MuiOutlinedInput-notchedOutline": {
												borderColor: "#e2e8f0",
											},
										}}
									>
										{REPORT_REASONS.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												{option.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>

								<TextField
									fullWidth
									multiline
									rows={4}
									placeholder="Ceritakan detail masalah atau bukti yang Anda temukan..."
									value={reportDetails}
									onChange={(e) => setReportDetails(e.target.value)}
									InputProps={{
										sx: { borderRadius: "12px", bgcolor: "#f8fafc" },
									}}
									sx={{
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "#e2e8f0",
										},
									}}
								/>
							</Stack>
						</Box>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 3, pt: 1 }}>
					<Button
						onClick={() => setOpenReportModal(false)}
						disabled={reportLoading}
						sx={{
							color: "#64748b",
							fontWeight: 700,
							textTransform: "none",
							borderRadius: "12px",
							px: 3,
						}}
					>
						Batal
					</Button>
					<Button
						variant="contained"
						onClick={handleSubmitReport}
						disabled={reportLoading}
						sx={{
							bgcolor: "#ef4444",
							color: "white",
							textTransform: "none",
							fontWeight: 700,
							px: 4,
							py: 1.2,
							borderRadius: "12px",
							boxShadow: "0 10px 20px -5px rgba(239, 68, 68, 0.3)",
							"&:hover": {
								bgcolor: "#dc2626",
								boxShadow: "0 15px 25px -5px rgba(239, 68, 68, 0.4)",
							},
						}}
					>
						{reportLoading ? "Mengirim..." : "Kirim Laporan"}
					</Button>
				</DialogActions>
			</Dialog>

			<Snackbar
				open={reportSuccessOpen}
				autoHideDuration={6000}
				onClose={() => setReportSuccessOpen(false)}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert
					onClose={() => setReportSuccessOpen(false)}
					severity="success"
					sx={{ width: "100%", borderRadius: "12px", boxShadow: 3 }}
				>
					Laporan berhasil dikirim. Terima kasih atas kepedulian Anda.
				</Alert>
			</Snackbar>

			{/* Generic Snackbar */}
			<Snackbar
				open={snack.open}
				autoHideDuration={4000}
				onClose={() => setSnack({ ...snack, open: false })}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setSnack({ ...snack, open: false })}
					severity={snack.type}
					sx={{ width: "100%", borderRadius: "12px", boxShadow: 3 }}
				>
					{snack.msg}
				</Alert>
			</Snackbar>

			{/* Donation Success Snackbar */}
			<Snackbar
				open={donationSuccessOpen}
				autoHideDuration={6000}
				onClose={() => setDonationSuccessOpen(false)}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert
					onClose={() => setDonationSuccessOpen(false)}
					severity="success"
					sx={{ width: "100%", borderRadius: "12px", boxShadow: 3 }}
				>
					Terima kasih! Donasi Anda berhasil dibuat. Silakan lakukan pembayaran.
				</Alert>
			</Snackbar>
		</Box>
	);
}
