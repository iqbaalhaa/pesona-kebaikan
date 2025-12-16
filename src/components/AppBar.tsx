"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";

export default function SimpleAppBar() {
	const [searchValue, setSearchValue] = React.useState("");

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
				bgcolor: "transparent",
				boxShadow: "none",
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
							filter: "drop-shadow(0 10px 18px rgba(0,0,0,.45))",
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
								bgcolor: "rgba(255,255,255,0.14)",
								backdropFilter: "blur(10px)",
								"& fieldset": { border: "1px solid rgba(255,255,255,0.28)" },
								"&:hover fieldset": { borderColor: "rgba(255,255,255,0.45)" },
								"&.Mui-focused fieldset": { borderColor: "#61ce70" },
							},
							"& input": { fontSize: 13, color: "#fff" },
							"& .MuiInputBase-input::placeholder": {
								color: "rgba(255,255,255,0.72)",
								opacity: 1,
							},
						}}
						InputProps={{
							startAdornment: (
								<Box
									sx={{ pl: 1.25, pr: 0.75, color: "rgba(255,255,255,0.9)" }}
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
						border: "1px solid rgba(255,255,255,0.18)",
						bgcolor: "rgba(255,255,255,0.10)",
						backdropFilter: "blur(10px)",
					}}
				>
					<Badge badgeContent={3} color="error">
						<NotificationsIcon sx={{ color: "#ffffff" }} />
					</Badge>
				</IconButton>
			</Toolbar>
		</AppBar>
	);
}
