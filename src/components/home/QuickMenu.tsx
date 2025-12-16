"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Image from "next/image";

type MenuItem = {
	label: string;
	emoji: string;
	isNew?: boolean;
	iconSrc?: string; // nanti taruh icon di public/quick-menu/
};

const menus: MenuItem[] = [
	{ label: "Donasi", emoji: "💚", iconSrc: "/quick-menu/donasi.png" },
	{ label: "Zakat", emoji: "🕌", iconSrc: "/quick-menu/zakat.png" },
	{ label: "Galang Dana", emoji: "📣", iconSrc: "/quick-menu/galang.png" },
	{
		label: "Donasi Otomatis",
		emoji: "🗓️",
		iconSrc: "/quick-menu/otomatis.png",
	},
	{
		label: "Kitabisa Experience",
		emoji: "✨",
		isNew: true,
		iconSrc: "/quick-menu/experience.png",
	},
	{
		label: "Kolaborasi CSR",
		emoji: "🤝",
		isNew: true,
		iconSrc: "/quick-menu/csr.png",
	},
	{
		label: "Asuransi SalingJaga",
		emoji: "🛡️",
		isNew: true,
		iconSrc: "/quick-menu/asuransi.png",
	},
	{ label: "Dana Abadi", emoji: "🌿", iconSrc: "/quick-menu/abadi.png" },
];

export default function QuickMenu() {
	const [open, setOpen] = React.useState(false);
	const [msg, setMsg] = React.useState("");

	const handleClick = (label: string) => {
		setMsg(`${label} — fitur segera hadir`);
		setOpen(true);
	};

	return (
		<Box sx={{ px: 2.5, mt: 2 }}>
			<Typography
				sx={{ fontSize: 16, fontWeight: 800, color: "#0f172a", mb: 1.5 }}
			>
				Mau berbuat baik apa hari ini?
			</Typography>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
					gap: 1.25,
					borderRadius: 3,
					bgcolor: "#fff",
				}}
			>
				{menus.map((m) => (
					<Box
						key={m.label}
						role="button"
						tabIndex={0}
						onClick={() => handleClick(m.label)}
						onKeyDown={(e) => e.key === "Enter" && handleClick(m.label)}
						sx={{
							textAlign: "center",
							py: 1,
							position: "relative",
							borderRadius: 3,
							cursor: "pointer",
							userSelect: "none",
							transition: "transform 120ms ease, background-color 120ms ease",
							"&:active": { transform: "scale(0.98)" },
							"&:hover": { backgroundColor: "rgba(15,23,42,0.03)" },
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
							{m.iconSrc ? (
								<Image
									src={m.iconSrc}
									alt={m.label}
									width={34}
									height={34}
									style={{ objectFit: "contain" }}
								/>
							) : (
								<Box sx={{ fontSize: 22 }}>{m.emoji}</Box>
							)}
						</Box>

						{/* Label */}
						<Typography
							sx={{
								mt: 0.9,
								fontSize: 12,
								fontWeight: 600,
								color: "rgba(15,23,42,.85)",
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
				))}
			</Box>

			<Box sx={{ mt: 2, height: 1, bgcolor: "rgba(15,23,42,0.06)" }} />

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
						bgcolor: "rgba(15,23,42,0.92)",
						color: "#fff",
						"& .MuiAlert-icon": { color: "#fff" },
					}}
				>
					{msg}
				</Alert>
			</Snackbar>
		</Box>
	);
}
