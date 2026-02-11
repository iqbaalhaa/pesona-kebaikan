"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	Box,
	Button,
	Container,
	Tabs,
	Tab,
	Divider,
	Snackbar,
	Alert,
	IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Typography from "@mui/material/Typography";

import { createReport } from "@/actions/report";
import { checkPendingDonations } from "@/actions/donation";
import { ReportReason } from "@/generated/prisma";

// New Components
import CampaignHero from "./detail/CampaignHero";
import CampaignHeader from "./detail/CampaignHeader";
import CampaignFundraiser from "./detail/CampaignFundraiser";
import CampaignStory from "./detail/CampaignStory";
import CampaignUpdates from "./detail/CampaignUpdates";
import CampaignDonors from "./detail/CampaignDonors";
import CampaignBottomNav from "./detail/CampaignBottomNav";
import ShareModal from "./detail/modals/ShareModal";
import FundDetailsModal from "./detail/modals/FundDetailsModal";
import DonorsModal from "./detail/modals/DonorsModal";
import ReportModal from "./detail/modals/ReportModal";
import MedicalModal from "./detail/modals/MedicalModal";

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
	const { data: session } = useSession();
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

	// Prefill report form with session data
	React.useEffect(() => {
		if (openReportModal && session?.user) {
			if (session.user.name) setReporterName(session.user.name);
			if (session.user.email) setReporterEmail(session.user.email);
		}
	}, [openReportModal, session]);

	React.useEffect(() => {
		const checkStatus = async () => {
			if (searchParams.get("donation_success") === "true") {
				setDonationSuccessOpen(true);

				// Clean up URL first
				router.replace(`/donasi/${data.slug || data.id}`, { scroll: false });

				// Check payment status actively (useful for localhost/when webhook is delayed)
				try {
					const res = await checkPendingDonations(data.id);
					if (res.success && res.updated && res.updated > 0) {
						router.refresh();
					}
				} catch (e) {
					console.error("Failed to check donation status", e);
				}
			}
		};
		checkStatus();
	}, [searchParams, data.slug, data.id, router]);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	const progress = Math.min(
		100,
		Math.round((data.collected / data.target) * 100)
	);

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

			<CampaignHero images={images} title={data.title} />

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
					<CampaignHeader
						data={data}
						progress={progress}
						updateCount={updateCount}
						withdrawalCount={withdrawalCount}
						setOpenDonorsModal={setOpenDonorsModal}
						setTabValue={setTabValue}
					/>

					<Divider sx={{ my: 3 }} />

					<CampaignFundraiser
						data={data}
						setOpenFundDetailsModal={setOpenFundDetailsModal}
					/>

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
								"& .Mui-selected": { color: "#0ba976" },
								"& .MuiTabs-indicator": { bgcolor: "#0ba976" },
							}}
						>
							<Tab label="Cerita" />
							<Tab label="Kabar Terbaru" />
						</Tabs>
					</Box>

					{/* Tab: Cerita */}
					<CustomTabPanel value={tabValue} index={0}>
						<CampaignStory
							data={data}
							showFullStory={showFullStory}
							setShowFullStory={setShowFullStory}
						/>

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

						<CampaignDonors
							donorsCount={data.donors}
							latestDonations={latestDonations}
							latestPrayers={latestPrayers}
							setOpenDonorsModal={setOpenDonorsModal}
						/>
					</CustomTabPanel>

					{/* Tab: Kabar Terbaru */}
					<CustomTabPanel value={tabValue} index={1}>
						<CampaignUpdates updates={data.updates} />
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

			<CampaignBottomNav data={data} setOpenShareModal={setOpenShareModal} />

			{/* Modals */}
			<ShareModal
				open={openShareModal}
				onClose={() => setOpenShareModal(false)}
				handleShareAction={handleShareAction}
			/>

			<FundDetailsModal
				open={openFundDetailsModal}
				onClose={() => setOpenFundDetailsModal(false)}
				totalCollected={totalCollected}
				fees={fees}
				withdrawn={withdrawn}
				remaining={remaining}
				campaignDuration={campaignDuration}
			/>

			<DonorsModal
				open={openDonorsModal}
				onClose={() => setOpenDonorsModal(false)}
				donorsCount={data.donors}
				donations={data.donations}
			/>

			<MedicalModal
				open={openMedicalModal}
				onClose={() => setOpenMedicalModal(false)}
			/>

			<ReportModal
				open={openReportModal}
				onClose={() => setOpenReportModal(false)}
				loading={reportLoading}
				reason={reportReason}
				setReason={setReportReason}
				details={reportDetails}
				setDetails={setReportDetails}
				name={reporterName}
				setName={setReporterName}
				phone={reporterPhone}
				setPhone={setReporterPhone}
				email={reporterEmail}
				setEmail={setReporterEmail}
				onSubmit={handleSubmitReport}
				reportReasons={REPORT_REASONS}
			/>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={3000}
				onClose={() => setSnackbarOpen(false)}
				message="Tautan berhasil disalin"
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			/>

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
