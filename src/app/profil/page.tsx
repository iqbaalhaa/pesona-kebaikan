"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import Autocomplete from "@mui/material/Autocomplete";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import SecurityIcon from "@mui/icons-material/Security";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LoginIcon from "@mui/icons-material/Login";
import CloseIcon from "@mui/icons-material/Close";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CampaignIcon from "@mui/icons-material/Campaign";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";

function ProfileMenu({
	icon,
	label,
	onClick,
	danger = false,
}: {
	icon: React.ReactNode;
	label: string;
	onClick?: () => void;
	danger?: boolean;
}) {
	return (
		<ListItemButton
			onClick={onClick}
			sx={{
				borderRadius: 1,
				mb: 0.5,
				"&:hover": {
					bgcolor: danger ? "rgba(239,68,68,0.08)" : "rgba(0,0,0,0.04)",
				},
			}}
		>
			<ListItemIcon
				sx={{
					minWidth: 40,
					color: danger ? "#ef4444" : "rgba(15,23,42,0.6)",
				}}
			>
				{icon}
			</ListItemIcon>
			<ListItemText
				primary={label}
				primaryTypographyProps={{
					fontSize: 14,
					fontWeight: 600,
					color: danger ? "#ef4444" : "#0f172a",
				}}
			/>
			<ChevronRightIcon sx={{ fontSize: 20, color: "rgba(15,23,42,0.3)" }} />
		</ListItemButton>
	);
}

function ProfilePageContent() {
	const router = useRouter();
	const { data: session, status } = useSession();

	// FIXME: Dummy user for development access as requested
	const user = session?.user;
	// const user = session?.user || dummyUser;

	const isDummy = user?.email === "tamu@pesonakebaikan.id";

	// Verification State
	const [openVerification, setOpenVerification] = React.useState(false);
	const [verificationType, setVerificationType] = React.useState<
		"individu" | "organisasi" | null
	>(null);
	const [activeStep, setActiveStep] = React.useState(0);

	// Address State
	const [provinces, setProvinces] = React.useState<any[]>([]);
	const [regencies, setRegencies] = React.useState<any[]>([]);
	const [selectedProvince, setSelectedProvince] = React.useState<any>(null);
	const [selectedRegency, setSelectedRegency] = React.useState<any>(null);

	// Fetch Provinces
	React.useEffect(() => {
		if (openVerification) {
			fetch("/api/address?type=province")
				.then((res) => res.json())
				.then((data) => {
					if (Array.isArray(data)) setProvinces(data);
				})
				.catch((err) => console.error(err));
		}
	}, [openVerification]);

	// Fetch Regencies
	React.useEffect(() => {
		if (selectedProvince?.id) {
			fetch(`/api/address?type=regency&provinceId=${selectedProvince.id}`)
				.then((res) => res.json())
				.then((data) => {
					if (Array.isArray(data)) setRegencies(data);
				})
				.catch((err) => console.error(err));
		} else {
			setRegencies([]);
			setSelectedRegency(null);
		}
	}, [selectedProvince]);

	const handleOpenVerification = () => {
		setVerificationType(null);
		setActiveStep(0);
		setOpenVerification(true);
	};

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	// Mock Stats Data
	const userStats = [
		{
			label: "Total Donasi",
			value: "Rp 2.500.000",
			icon: <VolunteerActivismIcon />,
			color: "#3b82f6",
			bg: "#eff6ff",
		},
		{
			label: "Campaign Diikuti",
			value: "15",
			icon: <CampaignIcon />,
			color: "#8b5cf6",
			bg: "#f5f3ff",
		},
		{
			label: "Bergabung Sejak",
			value: "Jan 2024",
			icon: <CalendarMonthIcon />,
			color: "#10b981",
			bg: "#ecfdf5",
		},
	];

	// Mock Campaign History
	const campaignHistory = [
		{
			id: 1,
			title: "Bantu Korban Banjir Demak",
			date: "20 Jan 2024",
			amount: "Rp 50.000",
			status: "Berhasil",
		},
		{
			id: 2,
			title: "Sedekah Jumat Berkah",
			date: "12 Jan 2024",
			amount: "Rp 20.000",
			status: "Berhasil",
		},
		{
			id: 3,
			title: "Wakaf Al-Quran Pelosok",
			date: "05 Jan 2024",
			amount: "Rp 100.000",
			status: "Berhasil",
		},
	];

	return (
		<Box sx={{ px: 2, pt: 2.5, pb: 10 }}>
			<Box sx={{ mb: 3 }}>
				<Typography sx={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>
					Profil Saya
				</Typography>
			</Box>

			{status === "loading" ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<Typography color="text.secondary">Memuat profil...</Typography>
				</Box>
			) : !user ? (
				// Guest View
				<Button
					variant="contained"
					startIcon={<LoginIcon />}
					onClick={() => router.push("/auth/login")}
					sx={{
						width: "100%",
						p: 2,
						borderRadius: 4,
						fontSize: 16,
						fontWeight: 900,
						color: "#fff",
						mb: 3,
						background: "linear-gradient(to right, #61ce70, #4caf50)",
						boxShadow: "0 10px 20px rgba(97,206,112,0.3)",
						textTransform: "none",
						transition: "all 0.3s ease",
						"&:hover": {
							transform: "translateY(-2px)",
							boxShadow: "0 15px 30px rgba(97,206,112,0.4)",
						},
					}}
				>
					Masuk / Daftar
				</Button>
			) : (
				// Logged In View
				<>
					{/* Profile Card */}
					<Paper
						elevation={0}
						variant="outlined"
						sx={{
							p: 2.5,
							mb: 3,
							borderRadius: 4,
							display: "flex",
							alignItems: "center",
							gap: 2,
							bgcolor: "#fff",
							borderColor: "rgba(0,0,0,0.08)",
							position: "relative",
							overflow: "hidden",
						}}
					>
						<Avatar
							src={user.image || "/avatar-placeholder.jpg"}
							sx={{
								width: 72,
								height: 72,
								bgcolor: "#61ce70",
								fontSize: 28,
								fontWeight: 800,
								border: "3px solid #fff",
								boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
							}}
						>
							{user.name?.[0]?.toUpperCase() || "A"}
						</Avatar>
						<Box
							sx={{ flex: 1, cursor: "pointer" }}
							onClick={() => router.push("/profil/akun")}
						>
							<Stack direction="row" alignItems="center" gap={0.5}>
								<Typography
									sx={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}
								>
									{user.name || "Pengguna"}
								</Typography>
								{/* Simulated Verified State */}
								<Tooltip title="Verified User">
									<CheckCircleIcon sx={{ fontSize: 18, color: "#61ce70" }} />
								</Tooltip>
							</Stack>
							<Typography sx={{ fontSize: 14, color: "rgba(15,23,42,0.6)" }}>
								{user.email}
							</Typography>
							<Box
								sx={{
									mt: 0.5,
									display: "flex",
									alignItems: "center",
									gap: 0.5,
								}}
							>
								<Box
									sx={{
										width: 8,
										height: 8,
										borderRadius: "50%",
										bgcolor: "#61ce70",
									}}
								/>
								<Typography
									sx={{ fontSize: 12, fontWeight: 700, color: "#61ce70" }}
								>
									Member Basic
								</Typography>
							</Box>
						</Box>
						<IconButton
							sx={{
								bgcolor: "#f8fafc",
								color: "#334155",
								borderRadius: 3,
								p: 1.5,
								border: "1px solid #e2e8f0",
								"&:hover": { bgcolor: "#f1f5f9" },
							}}
							onClick={() => router.push("/profil/akun")}
						>
							<EditIcon />
						</IconButton>
					</Paper>

					{/* Verification Banner */}
					<Paper
						elevation={0}
						variant="outlined"
						sx={{
							p: 2,
							mb: 3,
							borderRadius: 2,
							bgcolor: "#f0fdf4",
							borderColor: "#bbf7d0",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							cursor: "pointer",
							transition: "all 0.2s",
							"&:hover": { bgcolor: "#dcfce7" },
						}}
						onClick={() => setOpenVerification(true)}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
							<Box
								sx={{
									width: 44,
									height: 44,
									borderRadius: "50%",
									bgcolor: "white",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									border: "1px solid #bbf7d0",
									boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
								}}
							>
								<VerifiedUserIcon sx={{ color: "#61ce70" }} />
							</Box>
							<Box>
								<Typography
									sx={{ fontWeight: 800, fontSize: 14, color: "#166534" }}
								>
									Verifikasi Akun
								</Typography>
								<Typography sx={{ fontSize: 12, color: "#15803d" }}>
									Lengkapi data diri Anda
								</Typography>
							</Box>
						</Box>
						<ChevronRightIcon sx={{ fontSize: 20, color: "#15803d" }} />
					</Paper>

					{/* Account Menus */}
					<Box sx={{ mb: 3 }}>
						<Typography
							sx={{
								fontSize: 13,
								fontWeight: 800,
								color: "rgba(15,23,42,0.5)",
								mb: 1,
								ml: 1,
								textTransform: "uppercase",
								letterSpacing: 0.5,
							}}
						>
							Akun
						</Typography>
						<List disablePadding>
							<ProfileMenu
								icon={<SecurityIcon />}
								label="Keamanan & Password"
								onClick={() => router.push("/profil/keamanan")}
							/>
						</List>
					</Box>
				</>
			)}

			{/* General Menus (Visible to all) */}
			<Box>
				<Typography
					sx={{
						fontSize: 13,
						fontWeight: 800,
						color: "rgba(15,23,42,0.5)",
						mb: 1,
						ml: 1,
						textTransform: "uppercase",
						letterSpacing: 0.5,
					}}
				>
					Info Lainnya
				</Typography>
				<List disablePadding>
					<ProfileMenu
						icon={<HelpOutlineIcon />}
						label="Pusat Bantuan"
						onClick={() => router.push("/profil/bantuan")}
					/>
					<ProfileMenu
						icon={<InfoOutlinedIcon />}
						label="Tentang Pesona Kebaikan"
						onClick={() => router.push("/profil/tentang")}
					/>
					<ProfileMenu
						icon={<DescriptionIcon />}
						label="Syarat dan Ketentuan"
						onClick={() => router.push("/profil/syarat-ketentuan")}
					/>
					{user && (
						<ProfileMenu
							icon={isDummy ? <LoginIcon /> : <LogoutIcon />}
							label={isDummy ? "Masuk ke Akun Asli" : "Keluar"}
							danger={!isDummy}
							onClick={() => {
								if (isDummy) {
									router.push("/auth/login");
								} else {
									signOut();
								}
							}}
						/>
					)}
				</List>
			</Box>

			{/* Verification Modal */}
			<Dialog
				open={openVerification}
				onClose={() => setOpenVerification(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
			>
				{!verificationType ? (
					<Box sx={{ p: 3 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 3,
							}}
						>
							<Typography variant="h6" sx={{ fontWeight: 900 }}>
								Pilih Jenis Akun
							</Typography>
							<IconButton onClick={() => setOpenVerification(false)}>
								<CloseIcon />
							</IconButton>
						</Box>

						<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
							Silakan pilih jenis akun yang sesuai dengan Anda untuk melanjutkan
							proses verifikasi.
						</Typography>

						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Box
									onClick={() => setVerificationType("individu")}
									sx={{
										p: 2,
										border: "2px solid #e2e8f0",
										borderRadius: 2,
										cursor: "pointer",
										transition: "all 0.2s",
										"&:hover": {
											borderColor: "#61ce70",
											bgcolor: "#f0fdf4",
											transform: "translateY(-2px)",
										},
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										textAlign: "center",
										gap: 1.5,
									}}
								>
									<Box
										sx={{
											width: 48,
											height: 48,
											borderRadius: "50%",
											bgcolor: "rgba(97,206,112,0.1)",
											display: "grid",
											placeItems: "center",
											color: "#61ce70",
										}}
									>
										<PersonIcon sx={{ fontSize: 24 }} />
									</Box>
									<Box>
										<Typography sx={{ fontWeight: 800, fontSize: 16, mb: 0.5 }}>
											Individu
										</Typography>
										<Typography variant="caption" color="text.secondary">
											Untuk penggunaan pribadi dan donasi perorangan
										</Typography>
									</Box>
								</Box>
							</Grid>

							<Grid item xs={12} sm={6}>
								<Box
									onClick={() => setVerificationType("organisasi")}
									sx={{
										p: 2,
										border: "2px solid #e2e8f0",
										borderRadius: 2,
										cursor: "pointer",
										transition: "all 0.2s",
										"&:hover": {
											borderColor: "#61ce70",
											bgcolor: "#f0fdf4",
											transform: "translateY(-2px)",
										},
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										textAlign: "center",
										gap: 1.5,
									}}
								>
									<Box
										sx={{
											width: 48,
											height: 48,
											borderRadius: "50%",
											bgcolor: "rgba(97,206,112,0.1)",
											display: "grid",
											placeItems: "center",
											color: "#61ce70",
										}}
									>
										<BusinessIcon sx={{ fontSize: 24 }} />
									</Box>
									<Box>
										<Typography sx={{ fontWeight: 800, fontSize: 16, mb: 0.5 }}>
											Organisasi
										</Typography>
										<Typography variant="caption" color="text.secondary">
											Untuk yayasan, lembaga, atau komunitas
										</Typography>
									</Box>
								</Box>
							</Grid>
						</Grid>
					</Box>
				) : (
					<>
						<Box
							sx={{
								p: 3,
								bgcolor: "#61ce70",
								color: "white",
								position: "relative",
							}}
						>
							<Typography variant="h6" sx={{ fontWeight: 900 }}>
								Verifikasi{" "}
								{verificationType === "individu" ? "Individu" : "Organisasi"}
							</Typography>
							<Typography variant="body2" sx={{ opacity: 0.9 }}>
								Lengkapi data untuk keamanan dan kepercayaan.
							</Typography>
							<IconButton
								onClick={() => setOpenVerification(false)}
								sx={{ position: "absolute", top: 8, right: 8, color: "white" }}
							>
								<CloseIcon />
							</IconButton>
							<Button
								onClick={() => setVerificationType(null)}
								size="small"
								sx={{
									color: "white",
									position: "absolute",
									top: 8,
									right: 48,
									minWidth: "auto",
									px: 1,
								}}
							>
								Ganti
							</Button>
						</Box>

						<DialogContent sx={{ p: 0 }}>
							<Stepper
								activeStep={activeStep}
								orientation="vertical"
								sx={{ p: 3 }}
							>
								{/* Step 1: Upload Identitas */}
								<Step>
									<StepLabel>
										<Typography sx={{ fontWeight: 700 }}>
											Upload{" "}
											{verificationType === "individu"
												? "Foto KTP"
												: "SK Kemenkumham"}
										</Typography>
									</StepLabel>
									<StepContent>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mb: 2 }}
										>
											{verificationType === "individu"
												? "Pastikan foto KTP terlihat jelas dan terbaca."
												: "Upload dokumen SK Kemenkumham yang sah."}
										</Typography>
										<Box
											sx={{
												border: "2px dashed #e2e8f0",
												borderRadius: 2,
												p: 3,
												textAlign: "center",
												bgcolor: "#f8fafc",
												cursor: "pointer",
												"&:hover": {
													borderColor: "#61ce70",
													bgcolor: "#f0fdf4",
												},
											}}
										>
											<UploadFileIcon
												sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }}
											/>
											<Typography
												sx={{ fontSize: 14, fontWeight: 600, color: "#475569" }}
											>
												Klik untuk upload{" "}
												{verificationType === "individu"
													? "foto KTP"
													: "SK Kemenkumham"}
											</Typography>
											<Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
												Format: JPG, PDF (Max 5MB)
											</Typography>
										</Box>

										<TextField
											label={
												verificationType === "individu"
													? "Nomor NIK KTP"
													: "Nomor SK Kemenkumham"
											}
											fullWidth
											size="small"
											placeholder={
												verificationType === "individu"
													? "16 digit NIK"
													: "Masukkan nomor SK"
											}
											sx={{ mt: 2 }}
											InputProps={{ sx: { borderRadius: 1 } }}
										/>

										<Box sx={{ mb: 2, mt: 2 }}>
											<Button
												variant="contained"
												onClick={handleNext}
												sx={{
													bgcolor: "#61ce70",
													textTransform: "none",
													fontWeight: 700,
													borderRadius: 1,
													boxShadow: "none",
												}}
											>
												Lanjut
											</Button>
										</Box>
									</StepContent>
								</Step>

								{/* Step 2: Alamat Domisili */}
								<Step>
									<StepLabel>
										<Typography sx={{ fontWeight: 700 }}>
											Alamat Domisili
										</Typography>
									</StepLabel>
									<StepContent>
										<Typography
											variant="body2"
											color="text.secondary"
											sx={{ mb: 2 }}
										>
											Pilih provinsi dan kabupaten/kota domisili Anda.
										</Typography>
										<Stack spacing={2} sx={{ mb: 2 }}>
											<Autocomplete
												options={provinces}
												getOptionLabel={(option) => option.name}
												isOptionEqualToValue={(option, value) =>
													option.id === value.id
												}
												value={selectedProvince}
												onChange={(_, newValue) =>
													setSelectedProvince(newValue)
												}
												renderInput={(params) => (
													<TextField
														{...params}
														label="Provinsi"
														size="small"
													/>
												)}
												noOptionsText="Tidak ada data"
											/>
											<Autocomplete
												options={regencies}
												getOptionLabel={(option) => option.name}
												isOptionEqualToValue={(option, value) =>
													option.id === value.id
												}
												value={selectedRegency}
												onChange={(_, newValue) => setSelectedRegency(newValue)}
												disabled={!selectedProvince}
												renderInput={(params) => (
													<TextField
														{...params}
														label="Kabupaten/Kota"
														size="small"
													/>
												)}
												noOptionsText={
													selectedProvince
														? "Tidak ada data"
														: "Pilih provinsi terlebih dahulu"
												}
											/>
										</Stack>
										<Box sx={{ mb: 2 }}>
											<Button
												variant="contained"
												onClick={handleNext}
												disabled={!selectedProvince || !selectedRegency}
												sx={{
													bgcolor: "#61ce70",
													textTransform: "none",
													fontWeight: 700,
													borderRadius: 1,
													boxShadow: "none",
													"&.Mui-disabled": {
														bgcolor: "#e2e8f0",
														color: "#94a3b8",
													},
												}}
											>
												Lanjut
											</Button>
											<Button
												onClick={handleBack}
												sx={{
													mt: 1,
													mr: 1,
													color: "text.secondary",
													textTransform: "none",
												}}
											>
												Kembali
											</Button>
										</Box>
									</StepContent>
								</Step>

								{/* Step 3: Email */}
								<Step>
									<StepLabel>
										<Typography sx={{ fontWeight: 700 }}>
											Verifikasi Email
										</Typography>
									</StepLabel>
									<StepContent>
										<Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
											Kode verifikasi akan dikirim ke{" "}
											<b>{user?.email || "email anda"}</b>
										</Alert>
										<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
											<TextField
												size="small"
												placeholder="Masukkan Kode OTP"
												fullWidth
												InputProps={{ sx: { borderRadius: 1 } }}
											/>
											<Button
												variant="outlined"
												sx={{
													borderRadius: 1,
													textTransform: "none",
													whiteSpace: "nowrap",
												}}
											>
												Kirim Kode
											</Button>
										</Stack>
										<Box sx={{ mb: 2 }}>
											<Button
												variant="contained"
												onClick={handleNext}
												sx={{
													bgcolor: "#61ce70",
													textTransform: "none",
													fontWeight: 700,
													borderRadius: 1,
													boxShadow: "none",
												}}
											>
												Lanjut
											</Button>
											<Button
												onClick={handleBack}
												sx={{
													mt: 1,
													mr: 1,
													color: "text.secondary",
													textTransform: "none",
												}}
											>
												Kembali
											</Button>
										</Box>
									</StepContent>
								</Step>

								{/* Step 4: Phone / WhatsApp (New) */}
								<Step>
									<StepLabel>
										<Typography sx={{ fontWeight: 700 }}>
											Verifikasi WhatsApp
										</Typography>
									</StepLabel>
									<StepContent>
										<Alert
											icon={<WhatsAppIcon fontSize="inherit" />}
											severity="success"
											sx={{
												mb: 2,
												borderRadius: 1,
												bgcolor: "#dcfce7",
												color: "#166534",
											}}
										>
											Kami akan mengirimkan kode OTP ke WhatsApp Anda.
										</Alert>
										<TextField
											label="Nomor WhatsApp"
											fullWidth
											size="small"
											defaultValue={""}
											placeholder="0812xxxx"
											sx={{ mb: 2 }}
											InputProps={{ sx: { borderRadius: 1 } }}
										/>
										<Stack direction="row" spacing={1} sx={{ mb: 2 }}>
											<TextField
												size="small"
												placeholder="Kode OTP WA"
												fullWidth
												InputProps={{ sx: { borderRadius: 1 } }}
											/>
											<Button
												variant="outlined"
												sx={{
													borderRadius: 2,
													textTransform: "none",
													whiteSpace: "nowrap",
												}}
											>
												Kirim Kode
											</Button>
										</Stack>
										<Box sx={{ mb: 2 }}>
											<Button
												variant="contained"
												onClick={handleNext}
												sx={{
													bgcolor: "#61ce70",
													textTransform: "none",
													fontWeight: 700,
													borderRadius: 2,
													boxShadow: "none",
												}}
											>
												Verifikasi & Lanjut
											</Button>
											<Button
												onClick={handleBack}
												sx={{
													mt: 1,
													mr: 1,
													color: "text.secondary",
													textTransform: "none",
												}}
											>
												Kembali
											</Button>
										</Box>
									</StepContent>
								</Step>

								{/* Step 5: Selesai */}
								<Step>
									<StepLabel>
										<Typography sx={{ fontWeight: 700 }}>Selesai</Typography>
									</StepLabel>
									<StepContent>
										<Box sx={{ textAlign: "center", py: 2 }}>
											<CheckCircleIcon
												sx={{ fontSize: 48, color: "#61ce70", mb: 2 }}
											/>
											<Typography variant="h6" sx={{ fontWeight: 800 }}>
												Terima Kasih!
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ mb: 2 }}
											>
												Data Anda telah kami terima dan sedang dalam proses
												verifikasi 1x24 jam.
											</Typography>
										</Box>
										<Button
											onClick={() => setOpenVerification(false)}
											variant="outlined"
											fullWidth
											sx={{
												borderRadius: 2,
												textTransform: "none",
												fontWeight: 700,
											}}
										>
											Tutup
										</Button>
									</StepContent>
								</Step>
							</Stepper>
						</DialogContent>
					</>
				)}
			</Dialog>
		</Box>
	);
}

export default function ProfilePage() {
	return (
		<SessionProvider>
			<ProfilePageContent />
		</SessionProvider>
	);
}
