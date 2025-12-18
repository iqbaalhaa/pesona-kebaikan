"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MosqueIcon from "@mui/icons-material/Mosque";
import CampaignIcon from "@mui/icons-material/Campaign";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import HandshakeIcon from "@mui/icons-material/Handshake";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import SavingsIcon from "@mui/icons-material/Savings";

type MenuItem = {
	label: string;
	icon: React.ReactNode;
	isNew?: boolean;
	href?: string; // <— tambah ini
};

const menus: MenuItem[] = [
	{
		label: "Donasi",
		href: "/donasi", // <— ini yang kita arahkan
		icon: <VolunteerActivismIcon fontSize="large" color="primary" />,
	},
	{ label: "Zakat", icon: <MosqueIcon fontSize="large" color="primary" /> },
	{
		label: "Galang Dana",
		href: "/galang-dana", // <— ini yang kita arahkan
		icon: <CampaignIcon fontSize="large" color="primary" />,
	},
	{
		label: "Donasi Otomatis",
		icon: <EventRepeatIcon fontSize="large" color="primary" />,
	},
	{
		label: "Experience",
		isNew: true,
		icon: <AutoAwesomeIcon fontSize="large" color="primary" />,
	},
	{
		label: "Kolaborasi CSR",
		isNew: true,
		icon: <HandshakeIcon fontSize="large" color="primary" />,
	},
	{
		label: "SalingJaga",
		isNew: true,
		icon: <HealthAndSafetyIcon fontSize="large" color="primary" />,
	},
	{
		label: "Dana Abadi",
		icon: <SavingsIcon fontSize="large" color="primary" />,
	},
];

export default function QuickMenu() {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);
	const [msg, setMsg] = React.useState("");

	const toastSoon = (label: string) => {
		setMsg(`${label} — fitur segera hadir`);
		setOpen(true);
	};

	const handleActivate = (m: MenuItem) => {
		if (m.href) {
			router.push(m.href);
			return;
		}
		toastSoon(m.label);
	};

	return (
		<Box sx={{ px: 2.5, mt: 2 }}>
			<Typography
				sx={{ fontSize: 16, fontWeight: 800, color: "text.primary", mb: 1.5 }}
			>
				Mau berbuat baik apa hari ini?
			</Typography>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
					gap: 1.25,
					borderRadius: "12px",
					bgcolor: "background.paper",
				}}
			>
				{menus.map((m) => {
					const isLink = !!m.href;

					const cell = (
						<Box
							role={isLink ? "link" : "button"}
							tabIndex={0}
							onClick={() => handleActivate(m)}
							onKeyDown={(e) => e.key === "Enter" && handleActivate(m)}
							sx={{
								textAlign: "center",
								py: 1,
								position: "relative",
								borderRadius: "12px",
								cursor: "pointer",
								userSelect: "none",
								transition: "transform 120ms ease, background-color 120ms ease",
								"&:active": { transform: "scale(0.98)" },
								"&:hover": { backgroundColor: "action.hover" },
							}}
						>
							{/* Badge BARU */}
							{m.isNew && (
								<Box
									sx={{
										position: "absolute",
										top: 2,
										left: "50%",
										transform: "translateX(-50%)",
										px: 1,
										py: "2px",
										borderRadius: 999,
										fontSize: 9,
										fontWeight: 800,
										color: "#fff",
										bgcolor: "#e11d48",
										boxShadow: "0 10px 20px rgba(225,29,72,.22)",
										zIndex: 1,
									}}
								>
									BARU
								</Box>
							)}

							{/* Icon bubble */}
							<Box
								sx={{
									mx: "auto",
									width: 52,
									height: 52,
									borderRadius: 999,
									display: "grid",
									placeItems: "center",
									bgcolor: "rgba(97,206,112,0.14)",
									border: "1px solid rgba(97,206,112,0.28)",
									boxShadow: "0 10px 24px rgba(15,23,42,.06)",
									overflow: "hidden",
								}}
							>
								{m.icon}
							</Box>

							{/* Label */}
							<Typography
								sx={{
									mt: 0.9,
									fontSize: 12,
									fontWeight: 600,
									color: "text.primary",
									lineHeight: 1.2,
									px: 0.5,
									display: "-webkit-box",
									WebkitLineClamp: 2,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
								}}
							>
								{m.label}
							</Typography>
						</Box>
					);

					// Supaya aksesibilitas & SEO oke, kalau ada href bungkus Link
					return (
						<Box key={m.label}>
							{isLink ? (
								<Link
									href={m.href!}
									style={{ textDecoration: "none", color: "inherit" }}
								>
									{cell}
								</Link>
							) : (
								cell
							)}
						</Box>
					);
				})}
			</Box>

			<Box sx={{ mt: 2, height: 1, bgcolor: "divider" }} />

			{/* Toast */}
			<Snackbar
				open={open}
				autoHideDuration={2200}
				onClose={() => setOpen(false)}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setOpen(false)}
					severity="info"
					variant="filled"
					sx={{
						borderRadius: 3,
						bgcolor: "text.primary",
						color: "background.paper",
						"& .MuiAlert-icon": { color: "background.paper" },
					}}
				>
					{msg}
				</Alert>
			</Snackbar>
		</Box>
	);
}
