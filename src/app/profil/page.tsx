"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
				borderRadius: 2,
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

export default function ProfilePage() {
	const router = useRouter();
	const { data: session, status } = useSession();

	// FIXME: Dummy user for development access as requested
	// const dummyUser = {
	// 	name: "Pengguna Tamu",
	// 	email: "tamu@pesonakebaikan.id",
	// 	image: null,
	// };
	// const user = session?.user || dummyUser;
	const user = session?.user;

	// Verification State
	const [openVerification, setOpenVerification] = React.useState(false);
	const [activeStep, setActiveStep] = React.useState(0);

	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	const handleBack = () => {
		setActiveStep((prevActiveStep) => prevActiveStep - 1);
	};

	return (
		<Box sx={{ px: 2, pt: 2.5 }}>
			<Box sx={{ mb: 3 }}>
				<Typography sx={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
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
						}}
					>
						<Avatar
							src={user.image || "/avatar-placeholder.jpg"}
							sx={{
								width: 64,
								height: 64,
								bgcolor: "#61ce70",
								fontSize: 24,
								fontWeight: 800,
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
									sx={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}
								>
									{user.name || "Pengguna"}
								</Typography>
								{/* Simulated Verified State - could be real later */}
								<CheckCircleIcon sx={{ fontSize: 16, color: "#61ce70" }} />
							</Stack>
							<Typography sx={{ fontSize: 13, color: "rgba(15,23,42,0.6)" }}>
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
									sx={{ fontSize: 11, fontWeight: 700, color: "#61ce70" }}
								>
									Member Basic
								</Typography>
							</Box>
						</Box>
						<IconButton
							sx={{
								bgcolor: "#f1f5f9",
								color: "#334155",
								borderRadius: 3,
								p: 1.5,
								"&:hover": { bgcolor: "#e2e8f0" },
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
							borderRadius: 4,
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
									3 langkah mudah menjadi Verified
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
					<ProfileMenu icon={<HelpOutlineIcon />} label="Pusat Bantuan" />
					<ProfileMenu
						icon={<InfoOutlinedIcon />}
						label="Tentang Pesona Kebaikan"
					/>
					{user && (
						<ProfileMenu
							icon={<LogoutIcon />}
							label="Keluar"
							danger
							onClick={() => signOut()}
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
				PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
			>
				<Box
					sx={{
						p: 3,
						bgcolor: "#61ce70",
						color: "white",
						position: "relative",
					}}
				>
					<Typography variant="h6" sx={{ fontWeight: 900 }}>
						Verifikasi Akun
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
				</Box>

				<DialogContent sx={{ p: 0 }}>
					<Stepper activeStep={activeStep} orientation="vertical" sx={{ p: 3 }}>
						{/* Step 1: Upload KTP */}
						<Step>
							<StepLabel>
								<Typography sx={{ fontWeight: 700 }}>
									Upload Foto KTP
								</Typography>
							</StepLabel>
							<StepContent>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 2 }}
								>
									Pastikan foto KTP terlihat jelas dan terbaca.
								</Typography>
								<Box
									sx={{
										border: "2px dashed #e2e8f0",
										borderRadius: 3,
										p: 3,
										textAlign: "center",
										bgcolor: "#f8fafc",
										cursor: "pointer",
										"&:hover": { borderColor: "#61ce70", bgcolor: "#f0fdf4" },
									}}
								>
									<UploadFileIcon
										sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }}
									/>
									<Typography
										sx={{ fontSize: 14, fontWeight: 600, color: "#475569" }}
									>
										Klik untuk upload foto KTP
									</Typography>
									<Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
										Format: JPG, PNG (Max 2MB)
									</Typography>
								</Box>
								<Box sx={{ mb: 2, mt: 2 }}>
									<Button
										variant="contained"
										onClick={handleNext}
										sx={{
											bgcolor: "#61ce70",
											textTransform: "none",
											fontWeight: 700,
											borderRadius: 2,
										}}
									>
										Lanjut
									</Button>
								</Box>
							</StepContent>
						</Step>

						{/* Step 2: Email */}
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
										InputProps={{ sx: { borderRadius: 2 } }}
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

						{/* Step 3: Selesai */}
						<Step>
							<StepLabel>
								<Typography sx={{ fontWeight: 700 }}>Selesai</Typography>
							</StepLabel>
							<StepContent>
								<Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
									Data Anda sedang ditinjau oleh tim kami.
								</Alert>
								<Button
									onClick={() => setOpenVerification(false)}
									variant="outlined"
									sx={{
										borderRadius: 2,
										textTransform: "none",
									}}
								>
									Tutup
								</Button>
							</StepContent>
						</Step>
					</Stepper>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
