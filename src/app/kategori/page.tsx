"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import { alpha, useTheme } from "@mui/material/styles";
import { getCategoryIcon } from "@/lib/categoryIcons";

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

type DbCategory = { id: string; name: string; createdAt: string; updatedAt: string };

export default function KategoriPage() {
	const router = useRouter();
	const theme = useTheme();
	const [rows, setRows] = React.useState<DbCategory[]>([]);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				setLoading(true);
				const res = await fetch("/api/campaigns/categories", { cache: "no-store" });
				const data = await res.json();
				if (mounted) setRows(Array.isArray(data) ? data : []);
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

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
					{loading ? (
						Array.from({ length: 12 }).map((_, i) => (
							<Box
								key={i}
								sx={{
									bgcolor: "#fff",
									borderRadius: "16px",
									p: 2,
									border: "1px solid rgba(15,23,42,0.08)",
									boxShadow: "0 4px 12px rgba(15,23,42,0.03)",
									height: "100%",
								}}
							>
								<Box
									sx={{
										width: 56,
										height: 56,
										borderRadius: "16px",
										bgcolor: "action.hover",
									}}
								/>
								<Box sx={{ mt: 1.5, height: 16, bgcolor: "action.hover", borderRadius: 1 }} />
							</Box>
						))
					) : rows.map((cat) => {
						const { icon, color } = getCategoryIcon(cat.name);
						return (
						<Box
							key={cat.id}
							component="button"
							onClick={() => {
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
									bgcolor: alpha(color, 0.05),
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
									bgcolor: alpha(color, 0.1),
									color: color,
									mb: 1.5,
								}}
							>
								{icon}
							</Box>
							<Typography
								sx={{
									fontSize: 12.5,
									fontWeight: 700,
									color: "#334155",
									lineHeight: 1.25,
								}}
							>
								{cat.name}
							</Typography>
						</Box>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
}
