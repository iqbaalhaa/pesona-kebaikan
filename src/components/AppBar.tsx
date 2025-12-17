"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";

export default function SimpleAppBar({
	variant = "solid",
}: {
	variant?: "solid" | "overlay";
}) {
	const [searchValue, setSearchValue] = React.useState("");
	const isSolid = variant === "solid";

	return (
		<AppBar
			position="absolute"
			elevation={0}
			color="transparent"
			sx={{
				top: 0,
				left: 0,
				right: 0,
				zIndex: 50,
				bgcolor: isSolid ? "rgba(255,255,255,0.92)" : "transparent",
				backdropFilter: isSolid ? "blur(12px)" : "none",
				boxShadow: isSolid ? "0 4px 20px rgba(15,23,42,0.08)" : "none",
				borderBottom: isSolid
					? "1px solid rgba(15,23,42,0.08)"
					: "1px solid transparent",
				transition: "all 300ms ease",
			}}
		>
			<Toolbar sx={{ px: 2, minHeight: 64, gap: 1.25 }}>
				<Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
					<img
						src="/brand/logo.png"
						alt="Pesona Kebaikan"
						style={{
							height: 32,
							width: "auto",
							objectFit: "contain",
							display: "block",
							filter: isSolid
								? "none"
								: "drop-shadow(0 4px 8px rgba(0,0,0,.45))",
							transition: "filter 300ms ease",
						}}
					/>
				</Box>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<TextField
						size="small"
						placeholder="Cari donasi…"
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						fullWidth
						sx={{
							minWidth: 0,
							"& .MuiOutlinedInput-root": {
								height: 40,
								borderRadius: 12,
								bgcolor: isSolid
									? "rgba(15,23,42,0.05)"
									: "rgba(255,255,255,0.14)",
								backdropFilter: "blur(10px)",
								transition: "all 300ms ease",
								"& fieldset": {
									border: isSolid
										? "1px solid rgba(15,23,42,0.08)"
										: "1px solid rgba(255,255,255,0.28)",
									transition: "all 300ms ease",
								},
								"&:hover fieldset": {
									borderColor: isSolid
										? "rgba(15,23,42,0.2)"
										: "rgba(255,255,255,0.45)",
								},
								"&.Mui-focused fieldset": { borderColor: "#61ce70" },
							},
							"& input": {
								fontSize: 13,
								color: isSolid ? "#0f172a" : "#fff",
								transition: "color 300ms ease",
							},
							"& .MuiInputBase-input::placeholder": {
								color: isSolid
									? "rgba(15,23,42,0.55)"
									: "rgba(255,255,255,0.72)",
								opacity: 1,
								transition: "color 300ms ease",
							},
						}}
						InputProps={{
							startAdornment: (
								<Box
									sx={{
										pl: 1.25,
										pr: 0.75,
										color: isSolid
											? "rgba(15,23,42,0.45)"
											: "rgba(255,255,255,0.9)",
										transition: "color 300ms ease",
									}}
								>
									🔎
								</Box>
							),
						}}
					/>
				</Box>

				<IconButton
					sx={{
						width: 40,
						height: 40,
						flexShrink: 0,
						borderRadius: 12,
						border: isSolid
							? "1px solid rgba(15,23,42,0.08)"
							: "1px solid rgba(255,255,255,0.18)",
						bgcolor: isSolid ? "rgba(15,23,42,0.05)" : "rgba(255,255,255,0.10)",
						backdropFilter: "blur(10px)",
						transition: "all 300ms ease",
					}}
				>
					<Badge badgeContent={3} color="error">
						<NotificationsIcon
							sx={{
								color: isSolid ? "#0f172a" : "#ffffff",
								transition: "color 300ms ease",
							}}
						/>
					</Badge>
				</IconButton>
			</Toolbar>
		</AppBar>
	);
}
