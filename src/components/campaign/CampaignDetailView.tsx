"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

// Icons
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareIcon from "@mui/icons-material/Share";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
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

export default function CampaignDetailView({ data }: { data: any }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [tabValue, setTabValue] = React.useState(0);
	const [showFullStory, setShowFullStory] = React.useState(false);

	// Modals State
	const [openMedicalModal, setOpenMedicalModal] = React.useState(false);
	const [openDonorsModal, setOpenDonorsModal] = React.useState(false);
	const [openShareModal, setOpenShareModal] = React.useState(false);
	const [snackbarOpen, setSnackbarOpen] = React.useState(false);
	const [donationSuccessOpen, setDonationSuccessOpen] = React.useState(false);

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
								display: "flex",
								justifyContent: "space-between",
								mt: 1,
								alignItems: "center",
							}}
						>
							<Typography sx={{ fontSize: 12, color: "#64748b" }}>
								<span style={{ fontWeight: 700, color: "#0f172a" }}>
									{data.donors}
								</span>{" "}
								Donatur
							</Typography>
							<Button
								size="small"
								sx={{
									fontSize: 12,
									textTransform: "none",
									minWidth: "auto",
									p: 0,
								}}
								onClick={() => setOpenDonorsModal(true)}
							>
								Lihat Semua
							</Button>
						</Box>
					</Box>

					<Divider sx={{ my: 3 }} />

					{/* Organizer & Beneficiary Info */}
					<Stack spacing={2.5}>
						{/* Penggalang Dana */}
						<Box
							sx={{
								display: "flex",
								alignItems: "flex-start",
								gap: 2,
								cursor: "pointer",
								"&:hover": {
									bgcolor: "#f8fafc",
									borderRadius: 2,
									mx: -1,
									p: 1,
								},
							}}
						>
							<Avatar
								sx={{ width: 48, height: 48, border: "2px solid #f1f5f9" }}
							>
								{data.ownerName.charAt(0)}
							</Avatar>
							<Box sx={{ flex: 1 }}>
								<Typography sx={{ fontSize: 12, color: "#64748b", mb: 0.5 }}>
									Penggalang Dana
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
									<Typography sx={{ fontWeight: 700, fontSize: 14 }}>
										{data.ownerName}
									</Typography>
									<VerifiedUserIcon sx={{ fontSize: 16, color: "#3b82f6" }} />
								</Box>
								<Typography sx={{ fontSize: 12, color: "#64748b" }}>
									Identitas terverifikasi
								</Typography>
							</Box>
						</Box>

						{/* Note: Detailed medical/beneficiary info is not in the current API response yet. */}
						{/* We display basic info if available or skip */}
					</Stack>

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
					</CustomTabPanel>

					{/* Tab: Kabar Terbaru */}
					<CustomTabPanel value={tabValue} index={1}>
						<Typography
							sx={{ color: "text.secondary", textAlign: "center", py: 4 }}
						>
							Belum ada kabar terbaru.
						</Typography>
					</CustomTabPanel>
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
					<Grid container spacing={2}>
						<Grid item xs={3}>
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
						</Grid>
						<Grid item xs={3}>
							<Box
								onClick={() => handleShareAction("facebook")}
								sx={{ textAlign: "center", cursor: "pointer" }}
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
						</Grid>
						<Grid item xs={3}>
							<Box
								onClick={() => handleShareAction("twitter")}
								sx={{ textAlign: "center", cursor: "pointer" }}
							>
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
						</Grid>
						<Grid item xs={3}>
							<Box
								onClick={() => handleShareAction("copy")}
								sx={{ textAlign: "center", cursor: "pointer" }}
							>
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
						</Grid>
					</Grid>
				</DialogContent>
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
