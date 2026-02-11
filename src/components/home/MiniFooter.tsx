"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";

function LinkBtn({ label, href }: { label: string; href: string }) {
	return (
		<Box
			component={Link}
			href={href}
			sx={{
				border: "none",
				background: "transparent",
				cursor: "pointer",
				padding: 0,
				fontSize: 12,
				fontWeight: 900,
				color: "rgba(15,23,42,.60)",
				transition: "color 120ms ease",
				"&:hover": { color: "rgba(15,23,42,.85)" },
			}}
		>
			{label}
		</Box>
	);
}

export default function MiniFooter() {
	return (
		<Box
			sx={{
				px: 2,
				py: 2,
				borderTop: "none",
				bgcolor: "#fff",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: 1.5,
				}}
			>
				<LinkBtn label="Tentang" href="/profil/tentang" />
				<Box
					sx={{
						width: 4,
						height: 4,
						borderRadius: 999,
						bgcolor: "rgba(15,23,42,.22)",
					}}
				/>
				<LinkBtn label="Bantuan" href="/profil/bantuan" />
				<Box
					sx={{
						width: 4,
						height: 4,
						borderRadius: 999,
						bgcolor: "rgba(15,23,42,.22)",
					}}
				/>
				<LinkBtn label="S&K" href="/profil/syarat-ketentuan" />
			</Box>

			<Typography
				sx={{
					mt: 0.6,
					fontSize: 10.5,
					color: "rgba(15,23,42,.45)",
					textAlign: "center",
				}}
			>
				© {new Date().getFullYear()} Pesona Kebaikan
			</Typography>
		</Box>
	);
}
