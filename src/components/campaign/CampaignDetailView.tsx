"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	Box,
	Button,
	Container,
	Divider,
	Snackbar,
	Alert,
	Avatar,
	IconButton,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	List,
	ListItemButton,
	ListItemText,
	Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import { createReport } from "@/actions/report";
import { checkPendingDonations } from "@/actions/donation";
import { ReportReason } from "@prisma/client";

// Components
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
import PrayersModal from "./detail/modals/PrayersModal";
import ReportModal from "./detail/modals/ReportModal";
import MedicalModal from "./detail/modals/MedicalModal";
import CreateFundraiserDialog from "./detail/modals/CreateFundraiserDialog";
import PatientModal from "./detail/modals/PatientModal";

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
			{value === index && <Box sx={{ py: 1.5 }}>{children}</Box>}
		</div>
	);
}

export default function CampaignDetailView({
	data,
	showFundraiser = true,
}: {
	data: any;
	showFundraiser?: boolean;
}) {
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

	// Modals State
	const [openMedicalModal, setOpenMedicalModal] = React.useState(false);
	const [openPatientModal, setOpenPatientModal] = React.useState(false);
	const [openDonorsModal, setOpenDonorsModal] = React.useState(false);
	const [openPrayersModal, setOpenPrayersModal] = React.useState(false);
	const [openShareModal, setOpenShareModal] = React.useState(false);
	const [openFundDetailsModal, setOpenFundDetailsModal] = React.useState(false);
	const [snackbarOpen, setSnackbarOpen] = React.useState(false);
	const [donationSuccessOpen, setDonationSuccessOpen] = React.useState(false);
	const [donationStatus, setDonationStatus] = React.useState<
		"paid" | "pending" | null
	>(null);
	const [donationSummary, setDonationSummary] = React.useState<{
		amount?: number;
		method?: string;
	} | null>(null);
	const [openReportModal, setOpenReportModal] = React.useState(false);
	const [reportSuccessOpen, setReportSuccessOpen] = React.useState(false);
	const [openFundraiserModal, setOpenFundraiserModal] = React.useState(false);
	const [openCreateFundraiser, setOpenCreateFundraiser] = React.useState(false);

	// Prefill report form with session data
	React.useEffect(() => {
		if (openReportModal && session?.user) {
			if (session.user.name) setReporterName(session.user.name);
			if (session.user.email) setReporterEmail(session.user.email);
		}
	}, [openReportModal, session]);

	// Donation success check (stable deps)
	const donationSuccessParam = searchParams.get("donation_success");
	const donationStatusParam = searchParams.get("donation_status");
	const donationAmountParam = searchParams.get("donation_amount");
	const donationMethodParam = searchParams.get("donation_method");
	React.useEffect(() => {
		if (donationSuccessParam !== "true") return;

		const cleanUrl = `/donasi/${data.slug || data.id}`;

		// The payment gateway page is the previous history entry (cross-origin);
		// pressing Back should skip it rather than return to a dead session. Replace
		// the current (donation_success) entry with the campaign list, then push the
		// clean donation URL on top of that — so the visible page is cleanUrl, and a
		// Back press lands on the campaign list instead of the gateway page.
		//
		// This must go through router.replace/push (not raw window.history), because
		// Next's App Router also listens for popstate and drives its own soft
		// navigation for any same-origin entry — a manual popstate listener trying to
		// override that races it and can leave the user stuck bouncing on this page.
		router.replace("/galang-dana", { scroll: false });
		router.push(cleanUrl, { scroll: false });

		const checkStatus = async () => {
			setDonationSuccessOpen(true);
			setDonationStatus(donationStatusParam === "paid" ? "paid" : "pending");

			const amountNum = donationAmountParam
				? Number(donationAmountParam)
				: NaN;
			setDonationSummary({
				amount: isFinite(amountNum) ? amountNum : undefined,
				method: donationMethodParam || undefined,
			});

			// Check payment status actively (useful for localhost/when webhook is delayed)
			try {
				const res = await checkPendingDonations(data.id);
				if (res.success && res.updated && res.updated > 0) {
					router.refresh();
				}
			} catch (e) {
				console.error("Failed to check donation status", e);
			}
		};
		checkStatus();
	}, [
		donationSuccessParam,
		donationStatusParam,
		donationAmountParam,
		donationMethodParam,
		data.slug,
		data.id,
		router,
	]);

	const effectiveTitle =
		(data as any).fundraiserTitle && !showFundraiser
			? (data as any).fundraiserTitle
			: data.title;

	const effectiveTarget =
		(data as any).fundraiserTarget && !showFundraiser
			? (data as any).fundraiserTarget
			: data.target;

	// Safe progress calc (avoid NaN/Infinity)
	const safeTarget = Number(effectiveTarget) || 0;
	const safeCollected = Number(data.collected) || 0;
	const progress =
		safeTarget > 0
			? Math.min(100, Math.round((safeCollected / safeTarget) * 100))
			: 0;

	const donations = Array.isArray(data.donations) ? data.donations : [];
	const prayers =
		Array.isArray((data as any).fundraiserPrayers) &&
		(data as any).fundraiserPrayers.length > 0
			? (data as any).fundraiserPrayers
			: donations.filter(
					(d: any) => d.comment && String(d.comment).trim() !== "",
				);

	const latestDonations = donations.slice(0, 3);
	const latestPrayers = prayers.slice(0, 3);

	const newsUpdates = Array.isArray(data.updates)
		? data.updates.filter((u: any) => u?.type !== "withdrawal")
		: [];

	const withdrawalUpdates = Array.isArray(data.updates)
		? data.updates.filter((u: any) => u?.type === "withdrawal")
		: [];

	const hasWithdrawals = withdrawalUpdates.length > 0;
	const withdrawalCount = withdrawalUpdates.length;
	const updateCount = newsUpdates.length;
	const fundraiserCount = Array.isArray(data.fundraisers)
		? data.fundraisers.length
		: 0;

	// Calculate Fund Details
	const totalCollected = safeCollected;
	// Use server-provided totalFees if available, otherwise fallback to 5% estimate (only for legacy data)
	const fees =
		(data as any).totalFees !== undefined
			? (data as any).totalFees
			: Math.round(totalCollected * 0.05);

	const foundationFeePercentage = (data as any).foundationFee || 0;
	const foundationFeeAmount = Math.round(
		totalCollected * (foundationFeePercentage / 100),
	);

	const withdrawn = Array.isArray(data.updates)
		? data.updates
				.filter((u: any) => u?.type === "withdrawal")
				.reduce(
					(acc: number, curr: any) => acc + (Number(curr?.amount) || 0),
					0,
				)
		: 0;

	const remaining = Math.max(
		0,
		totalCollected - fees - foundationFeeAmount - withdrawn,
	);

	// Calculate duration
	const startDate = new Date(data.start || data.createdAt);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - startDate.getTime());
	const campaignDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	// Normalize images to string[] in the same way as OG metadata
	const imagesFromField =
		Array.isArray(data.images) && data.images.length > 0
			? data.images
					.map((img: any) => (typeof img === "string" ? img : img?.url))
					.filter(Boolean)
			: [];

	const fallbackImage =
		data.thumbnail ||
		(Array.isArray((data as any).media)
			? (data as any).media.find((m: any) => m?.isThumbnail)?.url
			: undefined);

	const images =
		imagesFromField.length > 0
			? imagesFromField
			: fallbackImage
				? [fallbackImage]
				: [];

	const baseUrl =
		process.env.NEXT_PUBLIC_APP_URL || "https://pesonakebaikan.com";
	const shareUrl = `${baseUrl}/donasi/${data.slug || data.id}`;
	const shareText = `Bantu ${effectiveTitle} di Pesona Kebaikan`;

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setSnackbarOpen(true);
		} catch {
			setSnack({ open: true, msg: "Gagal menyalin tautan", type: "error" });
		}
	};

	const handleShareAction = (platform: string) => {
		let url = "";
		switch (platform) {
			case "whatsapp":
				url = `https://wa.me/?text=${encodeURIComponent(
					shareText + " " + shareUrl,
				)}`;
				break;
			case "facebook":
				url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
					shareUrl,
				)}`;
				break;
			case "twitter":
				url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
					shareText,
				)}&url=${encodeURIComponent(shareUrl)}`;
				break;
			case "instagram":
				copyToClipboard(shareUrl);
				window.open("https://www.instagram.com/", "_blank");
				setOpenShareModal(false);
				return;
			case "copy":
				copyToClipboard(shareUrl);
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
		try {
			const res = await createReport({
				campaignId: data.id,
				reason: reportReason as ReportReason,
				details: reportDetails,
				reporterName,
				reporterPhone,
				reporterEmail,
			});

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
		} catch (e) {
			console.error(e);
			setSnack({
				open: true,
				msg: "Terjadi kesalahan saat mengirim laporan",
				type: "error",
			});
		} finally {
			setReportLoading(false);
		}
	};

	return (
		<Box
			sx={{
				pb: "80px",
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

			<CampaignHero images={images} title={effectiveTitle} />

			<Container maxWidth="md" sx={{ px: { xs: 0, sm: 2 } }}>
				<Box
					sx={{
						px: 2,
						py: 2,
						mt: 0,
						position: "relative",
						bgcolor: "white",
						borderRadius: { xs: 0, sm: "16px 16px 0 0" },
						boxShadow: { xs: "none", sm: "0 -4px 20px rgba(0,0,0,0.05)" },
					}}
				>
					<CampaignHeader
						data={{ ...data, title: effectiveTitle, target: effectiveTarget }}
						progress={progress}
						updateCount={updateCount}
						withdrawalCount={withdrawalCount}
						setOpenDonorsModal={setOpenDonorsModal}
						setTabValue={setTabValue}
					/>

					{!showFundraiser && (data as any).fundraiserCreatorName && (
						<Box
							sx={{
								mt: 2,
								p: 2,
								borderRadius: 3,
								bgcolor: "#f0fdf4",
								border: "1px solid #bbf7d0",
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
								<Avatar
									src={(data as any).fundraiserCreatorImage}
									sx={{ width: 36, height: 36 }}
								>
									{((data as any).fundraiserCreatorName || "A").charAt(0)}
								</Avatar>
								<Box>
									<Typography sx={{ fontSize: 13, fontWeight: 700, color: "#166534" }}>
										Fundraiser oleh {(data as any).fundraiserCreatorName}
									</Typography>
									<Typography sx={{ fontSize: 11, color: "#15803d" }}>
										Membantu menyebarkan campaign ini
									</Typography>
								</Box>
							</Box>
							{(data as any).campaignTitle && (
								<Box
									onClick={() => {
										if ((data as any).campaignSlug) router.push(`/donasi/${(data as any).campaignSlug}`);
									}}
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 1,
										p: 1.5,
										borderRadius: 2,
										bgcolor: "white",
										cursor: "pointer",
										"&:hover": { bgcolor: "#f8fafc" },
									}}
								>
									<Typography sx={{ fontSize: 12, color: "#64748b" }}>
										Campaign:
									</Typography>
									<Typography sx={{ fontSize: 12, fontWeight: 700, color: "#0f172a", flex: 1 }}>
										{(data as any).campaignTitle}
									</Typography>
									<NavigateNextIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
								</Box>
							)}
						</Box>
					)}

					<Divider sx={{ my: 2 }} />

					{showFundraiser && (
						<CampaignFundraiser
							data={data}
							setOpenFundDetailsModal={setOpenFundDetailsModal}
							setOpenPatientModal={setOpenPatientModal}
							setOpenFundraiserModal={setOpenFundraiserModal}
							setOpenCreateFundraiser={setOpenCreateFundraiser}
						/>
					)}

					<Divider sx={{ my: 2 }} />

					{/* Tab: Cerita */}
					<CustomTabPanel value={tabValue} index={0}>
						<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
							Cerita Penggalangan Dana
						</Typography>

						<CampaignStory
							data={{ ...data, title: effectiveTitle, target: effectiveTarget }}
							showFullStory={showFullStory}
							setShowFullStory={setShowFullStory}
						/>

						<Box
							onClick={() => setTabValue(1)}
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 3,
								mt: 3,
								cursor: "pointer",
							}}
						>
							<Typography variant="h6" sx={{ fontWeight: 700 }}>
								Kabar Terbaru
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<Chip
									label={updateCount}
									size="small"
									sx={{
										bgcolor: "#e0f2fe",
										color: "#0284c7",
										fontWeight: 700,
										height: 24,
										borderRadius: 1.5,
									}}
								/>
								<NavigateNextIcon sx={{ color: "#94a3b8" }} />
							</Box>
						</Box>

						{/* Pencairan Dana */}
						{hasWithdrawals && (
							<Box
								onClick={() => setTabValue(2)}
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
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<Chip
										label={withdrawalCount}
										size="small"
										sx={{
											bgcolor: "#e0f2fe",
											color: "#0284c7",
											fontWeight: 700,
											height: 24,
											borderRadius: 1.5,
										}}
									/>
									<NavigateNextIcon sx={{ color: "#94a3b8" }} />
								</Box>
							</Box>
						)}

						<CampaignDonors
							donorsCount={data.donors}
							latestDonations={latestDonations}
							latestPrayers={latestPrayers}
							prayersCount={prayers.length}
							setOpenDonorsModal={setOpenDonorsModal}
							setOpenPrayersModal={setOpenPrayersModal}
							campaignId={data.id}
							campaignSlug={data.slug}
							fundraiserCount={fundraiserCount}
							setOpenFundraiserModal={setOpenFundraiserModal}
							showFundraiserLabel={showFundraiser}
						/>
					</CustomTabPanel>

					{/* Tab: Kabar Terbaru */}
					<CustomTabPanel value={tabValue} index={1}>
						<Box sx={{ mb: 2 }}>
							<Button
								startIcon={<ArrowBackIcon />}
								onClick={() => setTabValue(0)}
								sx={{
									textTransform: "none",
									color: "text.primary",
									fontWeight: 600,
									p: 0,
									"&:hover": {
										bgcolor: "transparent",
										textDecoration: "underline",
									},
								}}
							>
								Kembali ke Cerita
							</Button>
						</Box>
						<CampaignUpdates updates={newsUpdates} />
					</CustomTabPanel>

					{/* Tab: Pencairan Dana */}
					<CustomTabPanel value={tabValue} index={2}>
						<Box sx={{ mb: 2 }}>
							<Button
								startIcon={<ArrowBackIcon />}
								onClick={() => setTabValue(0)}
								sx={{
									textTransform: "none",
									color: "text.primary",
									fontWeight: 600,
									p: 0,
									"&:hover": {
										bgcolor: "transparent",
										textDecoration: "underline",
									},
								}}
							>
								Kembali ke Cerita
							</Button>
						</Box>
						<CampaignUpdates
							updates={withdrawalUpdates}
							emptyTitle="Belum ada pencairan dana"
							emptyDescription="Pemilik campaign belum mencairkan dana apapun."
						/>
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
				shareUrl={typeof window !== "undefined" ? window.location.href : ""}
				shareTitle={data.title}
			/>

			<FundDetailsModal
				open={openFundDetailsModal}
				onClose={() => setOpenFundDetailsModal(false)}
				totalCollected={totalCollected}
				fees={fees}
				withdrawn={withdrawn}
				remaining={remaining}
				campaignDuration={campaignDuration}
				foundationFeePercentage={foundationFeePercentage}
				foundationFeeAmount={foundationFeeAmount}
				target={safeTarget}
				updatedAt={data.updatedAt}
				allocations={(data.metadata as any)?.allocations || []}
			/>

			<DonorsModal
				open={openDonorsModal}
				onClose={() => setOpenDonorsModal(false)}
				donorsCount={data.donors}
				donations={data.donations}
			/>

			<PrayersModal
				open={openPrayersModal}
				onClose={() => setOpenPrayersModal(false)}
				prayers={prayers}
			/>

			<PatientModal
				open={openPatientModal}
				onClose={() => setOpenPatientModal(false)}
				data={data}
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

			<Dialog
				open={openFundraiserModal}
				onClose={() => setOpenFundraiserModal(false)}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>
					Fundraiser terkait
				</DialogTitle>
				<DialogContent>
					{Array.isArray(data.fundraisers) && data.fundraisers.length > 0 ? (
						<List>
							{data.fundraisers.map((f: any) => (
								<ListItemButton
									key={f.id}
									onClick={() => {
										setOpenFundraiserModal(false);
										if (f.slug) router.push(`/donasi/fundraiser/${f.slug}`);
									}}
									sx={{ borderRadius: 2, mb: 0.5, gap: 1.5 }}
								>
									<Avatar
										src={f.creatorImage}
										sx={{ width: 36, height: 36 }}
									>
										{(f.creatorName || "A").charAt(0)}
									</Avatar>
									<ListItemText
										primaryTypographyProps={{
											sx: { fontWeight: 700, fontSize: 14 },
										}}
										secondaryTypographyProps={{
											sx: { fontSize: 12, color: "#64748b" },
										}}
										primary={f.title}
										secondary={`oleh ${f.creatorName || "Anonim"} · Target: Rp ${new Intl.NumberFormat("id-ID", {
											maximumFractionDigits: 0,
										}).format(Number(f.target || 0))}`}
									/>
								</ListItemButton>
							))}
						</List>
					) : (
						<Box sx={{ py: 2 }}>
							<Typography sx={{ fontSize: 13, color: "#64748b" }}>
								Belum ada fundraiser terkait
							</Typography>
						</Box>
					)}

					<Box sx={{ mt: 2 }}>
						<Divider sx={{ my: 2 }} />
						<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
							<Box
								onClick={() => {
									setOpenFundraiserModal(false);
									setOpenCreateFundraiser(true);
								}}
								sx={{
									bgcolor: "primary.main",
									color: "primary.contrastText",
									borderRadius: 2,
									textAlign: "center",
									fontWeight: 800,
									py: 1.25,
									cursor: "pointer",
									"&:hover": { opacity: 0.9 },
								}}
							>
								Jadi Fundraiser
							</Box>
						</Box>
					</Box>
				</DialogContent>
			</Dialog>

			{/* Copy-link snackbar */}
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={3000}
				onClose={() => setSnackbarOpen(false)}
				message="Tautan berhasil disalin"
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			/>

			{/* ✅ FIX TS ERROR: Alert children exists. If your TS says otherwise, it means your Alert import/type is wrong.
          This version avoids that mismatch by using message prop instead of children. */}
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
				onClose={() => setSnack((s) => ({ ...s, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setSnack((s) => ({ ...s, open: false }))}
					severity={snack.type}
					sx={{ width: "100%", borderRadius: "12px", boxShadow: 3 }}
				>
					{snack.msg}
				</Alert>
			</Snackbar>

			<Snackbar
				open={donationSuccessOpen}
				onClose={(_e, reason) => {
					if (reason === "clickaway") return;
					setDonationSuccessOpen(false);
				}}
				anchorOrigin={{ vertical: "top", horizontal: "center" }}
			>
				<Alert
					onClose={() => setDonationSuccessOpen(false)}
					severity="success"
					sx={{ width: "100%", borderRadius: "12px", boxShadow: 3 }}
				>
					{donationStatus === "paid"
						? `Terima kasih! Pembayaran donasi${donationSummary?.amount ? ` Rp ${donationSummary.amount.toLocaleString("id-ID")}` : ""}${
								donationSummary?.method ? ` via ${donationSummary.method}` : ""
							} telah kami terima.`
						: "Terima kasih! Donasi Anda berhasil dibuat. Silakan lakukan pembayaran."}
				</Alert>
			</Snackbar>

			<CreateFundraiserDialog
				open={openCreateFundraiser}
				onClose={() => setOpenCreateFundraiser(false)}
				campaignSlug={data.slug || data.id}
				campaignTitle={data.title}
				campaignTarget={Number(data.target)}
				userName={session?.user?.name || ""}
				userLoggedIn={!!session?.user}
			/>
		</Box>
	);
}
