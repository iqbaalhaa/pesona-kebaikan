"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { alpha, useTheme } from "@mui/material/styles";

// Icons
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MosqueIcon from "@mui/icons-material/Mosque";
import SchoolIcon from "@mui/icons-material/School";
import ForestIcon from "@mui/icons-material/Forest";
import HomeIcon from "@mui/icons-material/Home";
import AccessibleIcon from "@mui/icons-material/Accessible";
import ConstructionIcon from "@mui/icons-material/Construction";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import HandshakeIcon from "@mui/icons-material/Handshake";

const allCategories = [
	{
		id: "bencana",
		label: "Bencana Alam",
		icon: <ThunderstormIcon sx={{ fontSize: 28 }} />,
		color: "#ef4444", // red
	},
	{
		id: "anak",
		label: "Balita & Anak Sakit",
		icon: <ChildCareIcon sx={{ fontSize: 28 }} />,
		color: "#f59e0b", // amber
	},
	{
		id: "kesehatan",
		label: "Bantuan Medis",
		icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />,
		color: "#3b82f6", // blue
	},
	{
		id: "zakat",
		label: "Zakat",
		icon: <VolunteerActivismIcon sx={{ fontSize: 28 }} />,
		color: "#10b981", // emerald
	},
	{
		id: "wakaf",
		label: "Wakaf",
		icon: <MosqueIcon sx={{ fontSize: 28 }} />,
		color: "#059669", // green
	},
	{
		id: "pendidikan",
		label: "Pendidikan",
		icon: <SchoolIcon sx={{ fontSize: 28 }} />,
		color: "#8b5cf6", // violet
	},
	{
		id: "lingkungan",
		label: "Lingkungan",
		icon: <ForestIcon sx={{ fontSize: 28 }} />,
		color: "#22c55e", // green
	},
	{
		id: "panti",
		label: "Panti Asuhan",
		icon: <HomeIcon sx={{ fontSize: 28 }} />,
		color: "#ec4899", // pink
	},
	{
		id: "difabel",
		label: "Difabel",
		icon: <AccessibleIcon sx={{ fontSize: 28 }} />,
		color: "#6366f1", // indigo
	},
	{
		id: "infrastruktur",
		label: "Infrastruktur",
		icon: <ConstructionIcon sx={{ fontSize: 28 }} />,
		color: "#64748b", // slate
	},
	{
		id: "kemanusiaan",
		label: "Kemanusiaan",
		icon: <HandshakeIcon sx={{ fontSize: 28 }} />,
		color: "#f43f5e", // rose
	},
	{
		id: "pangan",
		label: "Bantuan Pangan",
		icon: <SoupKitchenIcon sx={{ fontSize: 28 }} />,
		color: "#ea580c", // orange
	},
];

export default function KategoriPage() {
	const router = useRouter();
	const theme = useTheme();

	return (
		<Box>
			{/* Header */}
			<Box
				sx={{
					position: "sticky",
					top: 0,
					zIndex: 50,
					bgcolor: "rgba(255,255,255,0.8)",
					backdropFilter: "blur(12px)",
					borderBottom: "1px solid rgba(15,23,42,0.06)",
					px: 2,
					py: 1.5,
					display: "flex",
					alignItems: "center",
					gap: 1.5,
				}}
			>
				<Box
					component="button"
					onClick={() => router.back()}
					sx={{
						width: 36,
						height: 36,
						borderRadius: 999,
						display: "grid",
						placeItems: "center",
						border: "1px solid rgba(15,23,42,0.1)",
						bgcolor: "#fff",
						color: "#0f172a",
						cursor: "pointer",
						transition: "all 0.2s",
						"&:active": { transform: "scale(0.95)" },
					}}
				>
					<ChevronLeftIcon />
				</Box>
				<Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
					Semua Kategori
				</Typography>
			</Box>

			{/* Grid */}
			<Box sx={{ p: 2 }}>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
						gap: 2,
					}}
				>
					{allCategories.map((cat) => (
						<Box
							key={cat.id}
							component="button"
							onClick={() => {
								// Handle click - maybe navigate to filter page or just show toast for now
								// For now, let's just assume it goes to a filter view or stays here
								console.log("Clicked", cat.id);
							}}
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								justifyContent: "center",
								textAlign: "center",
								bgcolor: "#fff",
								borderRadius: "16px",
								p: 2,
								border: "1px solid rgba(15,23,42,0.08)",
								boxShadow: "0 4px 12px rgba(15,23,42,0.03)",
								cursor: "pointer",
								transition: "all 0.2s ease",
								"&:active": {
									transform: "scale(0.96)",
									bgcolor: alpha(cat.color, 0.05),
								},
								height: "100%",
							}}
						>
							<Box
								sx={{
									width: 56,
									height: 56,
									borderRadius: "16px",
									display: "grid",
									placeItems: "center",
									bgcolor: alpha(cat.color, 0.1),
									color: cat.color,
									mb: 1.5,
								}}
							>
								{cat.icon}
							</Box>
							<Typography
								sx={{
									fontSize: 12.5,
									fontWeight: 700,
									color: "#334155",
									lineHeight: 1.25,
								}}
							>
								{cat.label}
							</Typography>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}
