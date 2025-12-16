"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import ArticleIcon from "@mui/icons-material/Article";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CampaignIcon from "@mui/icons-material/Campaign";
import PersonIcon from "@mui/icons-material/Person";

const PRIMARY = "#61ce70";

const menus = [
	{ label: "Donasi", path: "/", icon: <VolunteerActivismIcon /> },
	{ label: "Blog", path: "/blog", icon: <ArticleIcon /> },
	{ label: "Donasi Saya", path: "/donasi-saya", icon: <ReceiptLongIcon /> },
	{ label: "Galang Dana", path: "/galang-dana", icon: <CampaignIcon /> },
	{ label: "Profil", path: "/profil", icon: <PersonIcon /> },
];

function isActive(pathname: string, path: string) {
	if (path === "/") return pathname === "/";
	return pathname === path || pathname.startsWith(path + "/");
}

// helper buat warna rgba tanpa lib
function hexToRgba(hex: string, alpha: number) {
	const h = hex.replace("#", "");
	const bigint = parseInt(
		h.length === 3
			? h
					.split("")
					.map((c) => c + c)
					.join("")
			: h,
		16
	);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;
	return `rgba(${r},${g},${b},${alpha})`;
}

export default function SimpleBottomNavigation() {
	const router = useRouter();
	const pathname = usePathname();

	const currentIndex = React.useMemo(() => {
		const idx = menus.findIndex((m) => isActive(pathname, m.path));
		return idx === -1 ? 0 : idx;
	}, [pathname]);

	return (
		<Paper
			elevation={0}
			sx={{
				position: "fixed",
				left: "50%",
				transform: "translateX(-50%)",
				bottom: 0,
				width: "100%",
				maxWidth: 420,
				zIndex: 1300,
				borderTop: "1px solid rgba(0,0,0,0.08)",
				borderTopLeftRadius: 18,
				borderTopRightRadius: 18,
				overflow: "hidden",
				pb: "env(safe-area-inset-bottom)",
				bgcolor: "rgba(255,255,255,0.92)",
				backdropFilter: "blur(10px)",
			}}
		>
			<BottomNavigation
				showLabels
				value={currentIndex}
				onChange={(_, newValue) => router.push(menus[newValue].path)}
				sx={{
					height: 72,
					px: 1,

					// Base state (inactive)
					"& .MuiBottomNavigationAction-root": {
						minWidth: 0,
						px: 1,
						color: "rgba(15,23,42,0.55)",
						transition: "all 180ms ease",
					},

					"& .MuiBottomNavigationAction-label": {
						fontSize: 11,
						marginTop: "2px",
						transition: "all 180ms ease",
					},

					// Ikon default
					"& .MuiSvgIcon-root": {
						fontSize: 24,
						transition: "transform 180ms ease, filter 180ms ease",
					},

					// Wrapper biar kita bisa bikin “bubble”
					"& .MuiBottomNavigationAction-wrapper": {
						gap: "4px",
					},

					// Active state (premium)
					"& .Mui-selected": {
						color: PRIMARY,
					},
					"& .Mui-selected .MuiBottomNavigationAction-label": {
						fontWeight: 700,
					},

					// Bubble di belakang ikon saat active
					"& .MuiBottomNavigationAction-root.Mui-selected .MuiSvgIcon-root": {
						transform: "scale(1.06)",
						filter: `drop-shadow(0 10px 18px ${hexToRgba(PRIMARY, 0.22)})`,
					},
					"& .MuiBottomNavigationAction-root.Mui-selected .MuiBottomNavigationAction-wrapper":
						{
							// kasih “pill” di sekitar ikon+label
							paddingTop: "6px",
							paddingBottom: "6px",
							borderRadius: 14,
							backgroundColor: hexToRgba(PRIMARY, 0.12),
						},
				}}
			>
				{menus.map((menu) => (
					<BottomNavigationAction
						key={menu.path}
						label={menu.label}
						icon={menu.icon}
					/>
				))}
			</BottomNavigation>
		</Paper>
	);
}
