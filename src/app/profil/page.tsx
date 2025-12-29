"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import CampaignIcon from "@mui/icons-material/Campaign";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import DescriptionIcon from "@mui/icons-material/Description";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ProfileMenu from "@/components/profile/ProfileMenu";
import ProfileCard from "@/components/profile/ProfileCard";
import VerificationBanner from "@/components/profile/VerificationBanner";
import VerificationDialog from "@/components/profile/VerificationDialog";

function ProfilePageContent() {
	const router = useRouter();
	const { data: session, status } = useSession();

	// FIXME: Dummy user for development access as requested
	const user = session?.user;
	// const user = session?.user || dummyUser;

	const isDummy = user?.email === "tamu@pesonakebaikan.id";

	const [openVerification, setOpenVerification] = React.useState(false);
	const handleOpenVerification = () => setOpenVerification(true);

	// Step handling now lives inside VerificationDialog component

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
					<ProfileCard user={user} />

					{/* Verification Banner */}
					<VerificationBanner onClick={handleOpenVerification} />

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
							<ProfileMenu icon={<SecurityIcon />} label="Keamanan & Password" onClick={() => router.push("/profil/keamanan")} />
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
			<VerificationDialog open={openVerification} onClose={() => setOpenVerification(false)} userEmail={user?.email} />
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
