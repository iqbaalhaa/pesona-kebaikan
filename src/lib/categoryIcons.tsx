import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import MosqueIcon from "@mui/icons-material/Mosque";
import SchoolIcon from "@mui/icons-material/School";
import ForestIcon from "@mui/icons-material/Forest";
import HomeIcon from "@mui/icons-material/Home";
import AccessibleIcon from "@mui/icons-material/Accessible";
import ConstructionIcon from "@mui/icons-material/Construction";
import SoupKitchenIcon from "@mui/icons-material/SoupKitchen";
import HandshakeIcon from "@mui/icons-material/Handshake";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Box } from "@mui/material";
import React from "react";
import { SYSTEM_ICONS_MAP } from "@/lib/systemIcons";

export const CATEGORY_ICON_MAP: Record<
	string,
	{ icon: React.ReactElement; color: string }
> = {
	"bencana alam": {
		icon: <ThunderstormIcon sx={{ fontSize: 28 }} />,
		color: "#ef4444",
	},
	bencana: {
		icon: <ThunderstormIcon sx={{ fontSize: 28 }} />,
		color: "#ef4444",
	},
	"balita & anak sakit": {
		icon: <ChildCareIcon sx={{ fontSize: 28 }} />,
		color: "#f59e0b",
	},
	"bantuan medis": {
		icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />,
		color: "#3b82f6",
	},
	"bantuan medis & kesehatan": {
		icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />,
		color: "#3b82f6",
	},
	medis: {
		icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />,
		color: "#3b82f6",
	},
	zakat: {
		icon: <VolunteerActivismIcon sx={{ fontSize: 28 }} />,
		color: "#10b981",
	},
	wakaf: { icon: <MosqueIcon sx={{ fontSize: 28 }} />, color: "#059669" },
	pendidikan: { icon: <SchoolIcon sx={{ fontSize: 28 }} />, color: "#8b5cf6" },
	lingkungan: { icon: <ForestIcon sx={{ fontSize: 28 }} />, color: "#22c55e" },
	"panti asuhan": {
		icon: <HomeIcon sx={{ fontSize: 28 }} />,
		color: "#ec4899",
	},
	difabel: { icon: <AccessibleIcon sx={{ fontSize: 28 }} />, color: "#6366f1" },
	infrastruktur: {
		icon: <ConstructionIcon sx={{ fontSize: 28 }} />,
		color: "#64748b",
	},
	kemanusiaan: {
		icon: <HandshakeIcon sx={{ fontSize: 28 }} />,
		color: "#f43f5e",
	},
	"bantuan pangan": {
		icon: <SoupKitchenIcon sx={{ fontSize: 28 }} />,
		color: "#ea580c",
	},
	"rumah ibadah": {
		icon: <MosqueIcon sx={{ fontSize: 28 }} />,
		color: "#059669",
	},
	sosial: {
		icon: <VolunteerActivismIcon sx={{ fontSize: 28 }} />,
		color: "#10b981",
	},
	usaha: { icon: <StorefrontIcon sx={{ fontSize: 28 }} />, color: "#64748b" },
};

export function getCategoryIcon(rawName?: string) {
	const raw = (rawName || "").toLowerCase();
	// Format: "name|color"
	const [key, colorOverride] = raw.includes("|")
		? raw.split("|")
		: [raw, undefined];

	// Handle uploaded icons (URLs)
	if (key?.startsWith("/") || key?.startsWith("http")) {
		return {
			icon: (
				<Box
					component="img"
					src={key}
					alt="Category Icon"
					sx={{ width: 28, height: 28, objectFit: "contain" }}
				/>
			),
			color: colorOverride || "#64748b",
		};
	}

	// Check if it's a known system icon
	if (SYSTEM_ICONS_MAP[key]) {
		return {
			icon: React.cloneElement(SYSTEM_ICONS_MAP[key].icon as React.ReactElement<any>, {
				sx: { fontSize: 28 },
			}),
			color: colorOverride || "inherit",
		};
	}

	return CATEGORY_ICON_MAP[key]
		? {
				...CATEGORY_ICON_MAP[key],
				color: colorOverride || CATEGORY_ICON_MAP[key].color,
			}
		: {
				icon: <CategoryRoundedIcon sx={{ fontSize: 28 }} />,
				color: colorOverride || "#64748b",
			};
}
