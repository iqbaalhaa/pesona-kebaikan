"use client";

import * as React from "react";
import { Box, Typography, LinearProgress, Divider } from "@mui/material";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ArticleIcon from "@mui/icons-material/Article";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import { formatIDR } from "./utils";

interface CampaignHeaderProps {
	data: any;
	progress: number;
	updateCount: number;
	withdrawalCount: number;
	setOpenDonorsModal: (open: boolean) => void;
	setTabValue: (value: number) => void;
}

export default function CampaignHeader({
	data,
	progress,
	updateCount,
	withdrawalCount,
	setOpenDonorsModal,
	setTabValue,
}: CampaignHeaderProps) {
	const isMedis = data.category === "Bantuan Medis & Kesehatan";
	const isQuickDonate = data.slug === "donasi-cepat";

	return (
		<Box>
			{/* Title & Category */}
			<Box sx={{ mb: 2 }}>
				<Typography
					variant="h1"
					sx={{
						fontSize: { xs: 20, sm: 24 },
						fontWeight: 800,
						lineHeight: 1.4,
						color: "#0f172a",
						mb: 1,
					}}
				>
					{data.title}
				</Typography>
				{isMedis && (
					<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
						<MedicalServicesOutlinedIcon
							sx={{ fontSize: 16, color: "#e11d48" }}
						/>
						<Typography
							sx={{ fontSize: 12, color: "#e11d48", fontWeight: 600 }}
						>
							Bantuan Medis & Kesehatan
						</Typography>
					</Box>
				)}
			</Box>

			{/* Progress Stats */}
			<Box sx={{ mb: 3 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-end",
						mb: 1,
					}}
				>
					<Box>
						<Typography
							sx={{ fontSize: 20, fontWeight: 800, color: "#0ba976" }}
						>
							{formatIDR(data.collected)}
						</Typography>
						<Typography
							sx={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}
						>
							{isQuickDonate
								? "terkumpul"
								: `terkumpul dari ${formatIDR(data.target)}`}
						</Typography>
					</Box>
					<Box sx={{ textAlign: "right" }}>
						<Typography
							sx={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}
						>
							{isQuickDonate ? "∞" : data.daysLeft}
						</Typography>
						<Typography sx={{ fontSize: 12, color: "#64748b" }}>
							{isQuickDonate ? "Tanpa Batas" : "hari lagi"}
						</Typography>
					</Box>
				</Box>
				{!isQuickDonate && (
					<LinearProgress
						variant="determinate"
						value={progress}
						sx={{
							height: 8,
							borderRadius: 4,
							bgcolor: "#f1f5f9",
							"& .MuiLinearProgress-bar": {
								bgcolor: "#0ba976",
								borderRadius: 4,
							},
						}}
					/>
				)}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
						gap: 1,
						mt: 2,
						alignItems: "center",
					}}
				>
					{/* Donasi */}
					<Box
						onClick={() => setOpenDonorsModal(true)}
						sx={{
							textAlign: "center",
							cursor: "pointer",
							"&:hover": { opacity: 0.8 },
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 1,
								mb: 0.5,
							}}
						>
							<FavoriteIcon sx={{ color: "#0ea5e9", fontSize: 20 }} />
							<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
								{data.donors}
							</Typography>
						</Box>
						<Typography sx={{ fontSize: 12, color: "#64748b" }}>
							Donasi
						</Typography>
					</Box>

					<Divider orientation="vertical" sx={{ height: 30 }} />

					{/* Kabar Terbaru */}
					<Box
						onClick={() => setTabValue(1)}
						sx={{
							textAlign: "center",
							cursor: "pointer",
							"&:hover": { opacity: 0.8 },
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 1,
								mb: 0.5,
							}}
						>
							<ArticleIcon sx={{ color: "#64748b", fontSize: 20 }} />
							<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
								{updateCount}
							</Typography>
						</Box>
						<Typography sx={{ fontSize: 12, color: "#64748b" }}>
							Kabar Terbaru
						</Typography>
					</Box>

					<Divider orientation="vertical" sx={{ height: 30 }} />

					{/* Pencairan Dana */}
					<Box
						onClick={() => setTabValue(1)}
						sx={{
							textAlign: "center",
							cursor: "pointer",
							"&:hover": { opacity: 0.8 },
						}}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								gap: 1,
								mb: 0.5,
							}}
						>
							<RequestQuoteIcon sx={{ color: "#64748b", fontSize: 20 }} />
							<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
								{withdrawalCount} kali
							</Typography>
						</Box>
						<Typography sx={{ fontSize: 12, color: "#64748b" }}>
							Pencairan Dana
						</Typography>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
