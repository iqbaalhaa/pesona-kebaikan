"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "next/link";

const PRIMARY = "#0ba976";

function TrustItem({
	icon,
	title,
	desc,
	href,
}: {
	icon: string;
	title: string;
	desc?: string;
	href: string;
}) {
	return (
		<ButtonBase
			component={Link}
			href={href}
			sx={{
				display: "flex",
				gap: 1.1,
				minWidth: 0,
				textAlign: "left",
				width: "100%",
				justifyContent: "flex-start",
				p: 0.5,
				borderRadius: 2,
				transition: "all 0.2s",
				"&:hover": {
					bgcolor: "rgba(11,169,118,0.05)",
				},
			}}
		>
			<Box
				sx={{
					width: 36,
					height: 36,
					borderRadius: 999,
					display: "grid",
					placeItems: "center",
					bgcolor: "rgba(11,169,118,0.14)",
					border: "none",
					boxShadow: "none",
					flexShrink: 0,
				}}
			>
				<Box sx={{ fontSize: 18 }}>{icon}</Box>
			</Box>

			<Box sx={{ minWidth: 0 }}>
				<Typography
					sx={{
						fontSize: 12,
						fontWeight: 800,
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
				{desc && (
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
				)}
			</Box>
		</ButtonBase>
	);
}

export default function TrustStrip() {
	return (
		<Box sx={{ px: 2, mt: 2.5 }}>
			<Box
				sx={{
					borderRadius: 4,
					p: 1.6,
					border: "none",
					background:
						"linear-gradient(135deg, rgba(11,169,118,0.16) 0%, rgba(255,255,255,0.94) 55%, rgba(15,23,42,0.02) 100%)",
					boxShadow: "none",
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
							boxShadow: "none",
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
						href="/profil/tentang"
					/>
					<TrustItem
						icon="🔄"
						title="Update rutin kampanye"
						href="/profil/syarat-ketentuan"
					/>
					<TrustItem
						icon="📄"
						title="Pelaporan Useran dana"
						href="/profil/bantuan"
					/>
				</Box>
			</Box>
		</Box>
	);
}
