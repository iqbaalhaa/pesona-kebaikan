"use client";

import * as React from "react";
import Image from "next/image";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import { alpha, useTheme } from "@mui/material/styles";

interface SimpleAppBarProps {
	variant?: "solid" | "overlay";
}

export default function SimpleAppBar({ variant = "solid" }: SimpleAppBarProps) {
	const theme = useTheme();
	const [searchValue, setSearchValue] = React.useState("");
	const [logoSrc, setLogoSrc] = React.useState("/brand/logo.png");
	const isOverlay = variant === "overlay";

	// Colors depend on variant
	const textColor = isOverlay ? "#ffffff" : theme.palette.text.primary;
	const iconBg = isOverlay
		? "rgba(255,255,255,0.10)"
		: alpha(theme.palette.text.primary, 0.05);
	const iconBorder = isOverlay
		? "rgba(255,255,255,0.18)"
		: alpha(theme.palette.divider, 0.5);

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
				bgcolor: isOverlay ? "rgba(255,255,255,0.06)" : "background.paper",
				backdropFilter: isOverlay ? "blur(12px)" : "none",
				borderBottom: isOverlay ? "none" : `1px solid ${theme.palette.divider}`,
				transition: "all 300ms ease",
			}}
		>
			<Toolbar sx={{ px: 2, minHeight: 64, gap: 1.25 }}>
				<Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
					<Image
						src={logoSrc}
						alt="Pesona Kebaikan"
						width={140}
						height={32}
						priority
						style={{
							height: 32,
							width: "auto",
							objectFit: "contain",
							display: "block",
							filter: isOverlay
								? "drop-shadow(0 10px 18px rgba(0,0,0,.45))"
								: "none",
						}}
						onError={() => setLogoSrc("/defaultimg.webp")}
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
								borderRadius: 3,
								bgcolor: isOverlay
									? "rgba(255,255,255,0.14)"
									: alpha(theme.palette.text.primary, 0.04),
								backdropFilter: "blur(10px)",
								"& fieldset": {
									borderWidth: 1,
									borderColor: isOverlay
										? "rgba(255,255,255,0.28)"
										: "transparent",
									transition: "all 0.2s ease",
								},
								"&:hover fieldset": {
									borderColor: isOverlay
										? "rgba(255,255,255,0.45)"
										: theme.palette.primary.main,
								},
								"&.Mui-focused fieldset": {
									borderColor: theme.palette.primary.main,
								},
							},
							"& input": {
								fontSize: 13,
								color: isOverlay ? "#fff" : theme.palette.text.primary,
							},
							"& .MuiInputBase-input::placeholder": {
								color: isOverlay
									? "rgba(255,255,255,0.72)"
									: theme.palette.text.secondary,
								opacity: 1,
							},
						}}
						InputProps={{
							startAdornment: (
								<Box
									sx={{
										pl: 1.25,
										pr: 0.75,
										color: isOverlay
											? "rgba(255,255,255,0.9)"
											: theme.palette.text.secondary,
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
						borderRadius: 3,
						border: `1px solid ${iconBorder}`,
						bgcolor: iconBg,
						backdropFilter: "blur(10px)",
						color: textColor,
					}}
				>
					<Badge badgeContent={3} color="error">
						<NotificationsIcon color="inherit" />
					</Badge>
				</IconButton>
			</Toolbar>
		</AppBar>
	);
}
