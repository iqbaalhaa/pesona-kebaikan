"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
	Box,
	Paper,
	Typography,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Divider,
} from "@mui/material";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import FloodRoundedIcon from "@mui/icons-material/FloodRounded";
import AccessibleRoundedIcon from "@mui/icons-material/AccessibleRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import Diversity3RoundedIcon from "@mui/icons-material/Diversity3Rounded";
import ParkRoundedIcon from "@mui/icons-material/ParkRounded";

type Cat = { key: string; label: string; icon: React.ReactNode };

const CATEGORIES: Cat[] = [
	{
		key: "pendidikan",
		label: "Bantuan Pendidikan",
		icon: <SchoolRoundedIcon />,
	},
	{ key: "bencana", label: "Bencana Alam", icon: <FloodRoundedIcon /> },
	{ key: "difabel", label: "Difabel", icon: <AccessibleRoundedIcon /> },
	{
		key: "infrastruktur",
		label: "Infrastruktur Umum",
		icon: <ApartmentRoundedIcon />,
	},
	{
		key: "usaha",
		label: "Karya Kreatif & Modal Usaha",
		icon: <LightbulbRoundedIcon />,
	},
	{ key: "sosial", label: "Kegiatan Sosial", icon: <GroupsRoundedIcon /> },
	{ key: "kemanusiaan", label: "Kemanusiaan", icon: <Diversity3RoundedIcon /> },
	{ key: "lingkungan", label: "Lingkungan", icon: <ParkRoundedIcon /> },
];

export default function PilihKategoriGalangDanaPage() {
	const router = useRouter();
	const BOTTOM_NAV_H = 64;

	const pick = (cat: Cat) => {
		// lempar ke wizard "lainnya" + kategori pilihan
		router.push(
			`/galang-dana/buat?type=lainnya&category=${encodeURIComponent(cat.key)}`
		);
	};

	return (
		<Box
			sx={{
				pb: `calc(${BOTTOM_NAV_H}px + env(safe-area-inset-bottom) + 12px)`,
			}}
		>
			{/* Header biru seperti screenshot */}
			<Paper
				elevation={0}
				sx={{
					borderRadius: 0,
					bgcolor: "primary.main",
					color: "primary.contrastText",
					px: 1,
					py: 1.25,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<IconButton
						onClick={() => router.back()}
						sx={{ color: "primary.contrastText" }}
					>
						<ArrowBackIosNewRoundedIcon fontSize="small" />
					</IconButton>

					<Typography sx={{ fontWeight: 1000, fontSize: 14.5 }}>
						Pilih kategori galang dana
					</Typography>
				</Box>
			</Paper>

			<Paper elevation={0} sx={{ borderRadius: 0 }}>
				<List disablePadding>
					{CATEGORIES.map((c, idx) => (
						<React.Fragment key={c.key}>
							<ListItemButton onClick={() => pick(c)} sx={{ py: 1.5 }}>
								<ListItemIcon sx={{ minWidth: 44, color: "primary.main" }}>
									{c.icon}
								</ListItemIcon>

								<ListItemText
									primary={
										<Typography sx={{ fontWeight: 900, fontSize: 13.5 }}>
											{c.label}
										</Typography>
									}
								/>

								<ChevronRightRoundedIcon sx={{ color: "text.disabled" }} />
							</ListItemButton>

							{idx !== CATEGORIES.length - 1 ? <Divider /> : null}
						</React.Fragment>
					))}
				</List>
			</Paper>
		</Box>
	);
}
