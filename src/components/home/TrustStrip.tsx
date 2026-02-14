"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "next/link";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CachedIcon from "@mui/icons-material/Cached";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const PRIMARY = "#0ba976";

function TrustItem({
	icon: Icon,
	title,
	desc,
	href,
}: {
	icon: React.ElementType;
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
				gap: 2,
				textAlign: "left",
				width: "100%",
				justifyContent: "flex-start",
				p: 2,
				borderRadius: 3,
				transition: "all 0.3s ease",
				border: "1px solid transparent",
				"&:hover": {
					bgcolor: "rgba(11,169,118,0.04)",
					borderColor: "rgba(11,169,118,0.2)",
					transform: "translateY(-2px)",
					boxShadow: "0 4px 12px rgba(11,169,118,0.08)",
					"& .icon-box": {
						bgcolor: PRIMARY,
						color: "white",
						transform: "scale(1.1)",
					},
				},
			}}
		>
			<Box
				className="icon-box"
				sx={{
					width: 48,
					height: 48,
					borderRadius: "14px",
					display: "grid",
					placeItems: "center",
					bgcolor: "rgba(11,169,118,0.1)",
					color: PRIMARY,
					flexShrink: 0,
					transition: "all 0.3s ease",
				}}
			>
				<Icon sx={{ fontSize: 24 }} />
			</Box>

			<Box
				sx={{
					minWidth: 0,
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				<Typography
					sx={{
						fontSize: 14,
						fontWeight: 700,
						color: "#1e293b",
						lineHeight: 1.2,
						mb: 0.5,
						letterSpacing: "-0.01em",
					}}
				>
					{title}
				</Typography>
				{desc && (
					<Typography
						sx={{
							fontSize: 12,
							color: "#64748b",
							lineHeight: 1.4,
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
		<Box sx={{ px: 2, mt: 3 }}>
			<Box
				sx={{
					p: 2,
					bgcolor: "white",
					boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
					border: "1px solid rgba(241, 245, 249, 1)",
				}}
			>
				{/* Header */}
				<Box
					sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, px: 1 }}
				>
					<Box
						sx={{
							width: 4,
							height: 24,
							borderRadius: 4,
							bgcolor: PRIMARY,
						}}
					/>
					<Typography
						sx={{
							fontSize: 16,
							fontWeight: 800,
							color: "#0f172a",
							letterSpacing: "-0.02em",
						}}
					>
						Aman & Transparan
					</Typography>
				</Box>

				{/* 3 kolom */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "1fr",
						gap: 1.5,
					}}
				>
					<TrustItem
						icon={VerifiedUserIcon}
						title="Verifikasi Penggalang"
						desc="Identitas penggalang dana terverifikasi valid"
						href="/profil/tentang"
					/>
					<TrustItem
						icon={CachedIcon}
						title="Update Rutin Kampanye"
						desc="Kabar terbaru penggunaan dana secara berkala"
						href="/profil/syarat-ketentuan"
					/>
					<TrustItem
						icon={ReceiptLongIcon}
						title="Laporan Transparan"
						desc="Bukti penyaluran dana dapat diakses publik"
						href="/profil/bantuan"
					/>
				</Box>
			</Box>
		</Box>
	);
}
