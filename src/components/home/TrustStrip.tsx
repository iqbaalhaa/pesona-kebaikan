"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const PRIMARY = "#61ce70";

function TrustItem({
	icon,
	title,
	desc,
}: {
	icon: string;
	title: string;
	desc: string;
}) {
	return (
		<Box sx={{ display: "flex", gap: 1.1, minWidth: 0 }}>
			<Box
				sx={{
					width: 36,
					height: 36,
					borderRadius: "12px",
					display: "grid",
					placeItems: "center",
					bgcolor: "rgba(97,206,112,0.14)",
					border: "1px solid rgba(97,206,112,0.22)",
					boxShadow: "0 14px 26px rgba(97,206,112,.10)",
					flexShrink: 0,
				}}
			>
				<Box sx={{ fontSize: 18 }}>{icon}</Box>
			</Box>

			<Box sx={{ minWidth: 0 }}>
				<Typography
					sx={{
						fontSize: 12.5,
						fontWeight: 900,
						color: "#0f172a",
						lineHeight: 1.15,
						display: "-webkit-box",
						WebkitLineClamp: 1,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
					}}
				>
					{title}
				</Typography>
				<Typography
					sx={{
						mt: 0.35,
						fontSize: 11,
						color: "rgba(15,23,42,.60)",
						lineHeight: 1.2,
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
					}}
				>
					{desc}
				</Typography>
			</Box>
		</Box>
	);
}

export default function TrustStrip() {
	return (
		<Box sx={{ px: 2.5, mt: 2.5 }}>
			<Box
				sx={{
					borderRadius: "16px", // radius 16px (MUI spacing)
					p: 1.6,
					border: "1px solid rgba(15,23,42,0.08)",
					background:
						"linear-gradient(135deg, rgba(97,206,112,0.16) 0%, rgba(255,255,255,0.94) 55%, rgba(15,23,42,0.02) 100%)",
					boxShadow: "0 18px 34px rgba(15,23,42,.06)",
				}}
			>
				{/* Header mini */}
				<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.25 }}>
					<Box
						sx={{
							width: 10,
							height: 10,
							borderRadius: 999,
							bgcolor: PRIMARY,
							boxShadow: "0 10px 18px rgba(97,206,112,.25)",
						}}
					/>
					<Typography
						sx={{ fontSize: 13.5, fontWeight: 900, color: "#0f172a" }}
					>
						Aman & Transparan
					</Typography>
				</Box>

				{/* 3 kolom */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
						gap: 1.25,
					}}
				>
					<TrustItem
						icon="✅"
						title="Verifikasi penggalang"
						desc="Identitas & kampanye dicek sebelum tayang."
					/>
					<TrustItem
						icon="🔄"
						title="Update rutin kampanye"
						desc="Penggalang wajib memberi kabar perkembangan."
					/>
					<TrustItem
						icon="📄"
						title="Pelaporan penggunaan dana"
						desc="Ringkasan penyaluran dana bisa dipantau."
					/>
				</Box>
			</Box>
		</Box>
	);
}
