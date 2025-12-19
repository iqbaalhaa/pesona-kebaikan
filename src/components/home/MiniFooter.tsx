"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function LinkBtn({ label, onClick }: { label: string; onClick: () => void }) {
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
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
				borderTop: "1px solid rgba(15,23,42,0.06)",
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
				<LinkBtn
					label="Tentang"
					onClick={() => alert("Route Tentang menyusul")}
				/>
				<Box
					sx={{
						width: 4,
						height: 4,
						borderRadius: 999,
						bgcolor: "rgba(15,23,42,.22)",
					}}
				/>
				<LinkBtn
					label="Bantuan"
					onClick={() => alert("Route Bantuan menyusul")}
				/>
				<Box
					sx={{
						width: 4,
						height: 4,
						borderRadius: 999,
						bgcolor: "rgba(15,23,42,.22)",
					}}
				/>
				<LinkBtn label="S&K" onClick={() => alert("Route S&K menyusul")} />
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
