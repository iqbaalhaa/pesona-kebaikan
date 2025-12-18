"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SecurityIcon from "@mui/icons-material/Security";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

function ProfileMenu({
	icon,
	label,
	onClick,
	danger = false,
}: {
	icon: React.ReactNode;
	label: string;
	onClick?: () => void;
	danger?: boolean;
}) {
	return (
		<ListItemButton
			onClick={onClick}
			sx={{
				borderRadius: 2,
				mb: 0.5,
				"&:hover": { bgcolor: danger ? "rgba(239,68,68,0.08)" : "rgba(0,0,0,0.04)" },
			}}
		>
			<ListItemIcon
				sx={{
					minWidth: 40,
					color: danger ? "#ef4444" : "rgba(15,23,42,0.6)",
				}}
			>
				{icon}
			</ListItemIcon>
			<ListItemText
				primary={label}
				primaryTypographyProps={{
					fontSize: 14,
					fontWeight: 600,
					color: danger ? "#ef4444" : "#0f172a",
				}}
			/>
			<ChevronRightIcon
				sx={{ fontSize: 20, color: "rgba(15,23,42,0.3)" }}
			/>
		</ListItemButton>
	);
}

export default function ProfilePage() {
	const router = useRouter();
	return (
		<Box sx={{ px: 2.5, pt: 2.5, pb: 6 }}>
			<Box sx={{ mb: 3 }}>
				<Typography sx={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
					Profil Saya
				</Typography>
			</Box>

			{/* Profile Card */}
			<Paper
				elevation={0}
				variant="outlined"
				sx={{
					p: 2.5,
					mb: 3,
					borderRadius: 4,
					display: "flex",
					alignItems: "center",
					gap: 2,
					bgcolor: "#fff",
					borderColor: "rgba(0,0,0,0.08)",
				}}
			>
				<Avatar
					src="/avatar-placeholder.jpg" // Ganti dengan user.avatar
					sx={{
						width: 64,
						height: 64,
						bgcolor: "#61ce70",
						fontSize: 24,
						fontWeight: 800,
					}}
				>
					A
				</Avatar>
				<Box
					sx={{ flex: 1, cursor: "pointer" }}
					onClick={() => router.push("/profil/akun")}
				>
					<Typography sx={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
						Ahmad Fulan
					</Typography>
					<Typography sx={{ fontSize: 13, color: "rgba(15,23,42,0.6)" }}>
						ahmad@example.com
					</Typography>
					<Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
						<Box
							sx={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								bgcolor: "#61ce70",
							}}
						/>
						<Typography
							sx={{ fontSize: 11, fontWeight: 700, color: "#61ce70" }}
						>
							Member Basic
						</Typography>
					</Box>
				</Box>
				<Button
					variant="text"
					size="small"
					sx={{
						minWidth: 0,
						p: 1,
						borderRadius: "50%",
						color: "rgba(15,23,42,0.5)",
					}}
				>
					<EditIcon fontSize="small" />
				</Button>
			</Paper>

			{/* Menus */}
			<Box>
				<Typography
					sx={{
						fontSize: 13,
						fontWeight: 800,
						color: "rgba(15,23,42,0.5)",
						mb: 1,
						ml: 1,
						textTransform: "uppercase",
						letterSpacing: 0.5,
					}}
				>
					Akun
				</Typography>
				<List disablePadding>
					<ProfileMenu
						icon={<AccountCircleIcon />}
						label="Edit Profil"
					/>
					<ProfileMenu
						icon={<SecurityIcon />}
						label="Keamanan & Password"
					/>
				</List>

				<Divider sx={{ my: 2, borderStyle: "dashed" }} />

				<Typography
					sx={{
						fontSize: 13,
						fontWeight: 800,
						color: "rgba(15,23,42,0.5)",
						mb: 1,
						ml: 1,
						textTransform: "uppercase",
						letterSpacing: 0.5,
					}}
				>
					Info Lainnya
				</Typography>
				<List disablePadding>
					<ProfileMenu
						icon={<HelpOutlineIcon />}
						label="Pusat Bantuan"
					/>
					<ProfileMenu
						icon={<InfoOutlinedIcon />}
						label="Tentang Aplikasi"
					/>
					<ProfileMenu
						icon={<LogoutIcon />}
						label="Keluar"
						danger
						onClick={() => alert("Logout clicked")}
					/>
				</List>
			</Box>
		</Box>
	);
}
