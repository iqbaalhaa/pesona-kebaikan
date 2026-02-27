"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import VolunteerActivismRoundedIcon from "@mui/icons-material/VolunteerActivismRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Link from "next/link";

const PRIMARY = "#0ba976";

export default function FundraiserCTA() {
	return (
		<Box sx={{ px: 2, mt: 3, mb: 4 }}>
			{/* CTA Card */}
			<Paper
				elevation={0}
				sx={{
					p: 2.5,
					position: "relative",
					overflow: "hidden",
					background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
					border: "1px solid rgba(11,169,118,0.15)",
					boxShadow: "0 10px 30px -10px rgba(11,169,118,0.15)",
					transition: "all 0.3s ease",
					"&:hover": {
						boxShadow: "0 20px 40px -12px rgba(11,169,118,0.25)",
						transform: "translateY(-2px)",
						borderColor: "rgba(11,169,118,0.3)",
					},
				}}
			>
				{/* Decorative Background Elements */}
				<Box
					sx={{
						position: "absolute",
						top: -20,
						right: -20,
						width: 120,
						height: 120,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, rgba(11,169,118,0.1) 0%, rgba(11,169,118,0) 70%)",
						pointerEvents: "none",
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						bottom: -30,
						left: -10,
						width: 100,
						height: 100,
						borderRadius: "50%",
						background:
							"radial-gradient(circle, rgba(11,169,118,0.08) 0%, rgba(11,169,118,0) 70%)",
						pointerEvents: "none",
					}}
				/>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 2,
						position: "relative",
						zIndex: 1,
					}}
				>
					{/* Icon Box */}
					<Box
						sx={{
							width: 52,
							height: 52,
							borderRadius: 3,
							display: "grid",
							placeItems: "center",
							background: "linear-gradient(135deg, #0ba976 0%, #067a54 100%)",
							boxShadow: "0 8px 16px rgba(11,169,118,0.25)",
							flexShrink: 0,
							color: "white",
						}}
					>
						<CampaignRoundedIcon sx={{ fontSize: 28 }} />
					</Box>

					{/* Text Content */}
					<Box sx={{ flex: 1, minWidth: 0 }}>
						<Typography
							variant="h6"
							sx={{
								fontSize: 16,
								fontWeight: 800,
								color: "#1e293b",
								lineHeight: 1.3,
								letterSpacing: "-0.01em",
								mb: 0.5,
							}}
						>
							Jadi Fundraiser
						</Typography>
						<Typography
							sx={{
								fontSize: 13,
								color: "#64748b",
								lineHeight: 1.4,
								display: "flex",
								alignItems: "center",
								gap: 0.5,
							}}
						>
							Bantu sebarkan kebaikan
							<ArrowForwardRoundedIcon sx={{ fontSize: 14, color: PRIMARY }} />
						</Typography>
					</Box>

					{/* Action Button */}
					<Link href="/panduan-fundraiser" style={{ textDecoration: "none" }}>
						<Box
							sx={{
								height: 40,
								px: 2.5,
								borderRadius: 10,
								border: "none",
								background: "rgba(11,169,118,0.1)",
								color: PRIMARY,
								fontSize: 13,
								fontWeight: 700,
								cursor: "pointer",
								transition: "all 0.2s ease",
								display: "flex",
								alignItems: "center",
								gap: 1,
								"&:hover": {
									background: PRIMARY,
									color: "white",
									transform: "scale(1.02)",
									boxShadow: "0 4px 12px rgba(11,169,118,0.2)",
								},
								"&:active": {
									transform: "scale(0.98)",
								},
							}}
						>
							Mulai
						</Box>
					</Link>
				</Box>

				{/* Footer Info */}
				<Box
					sx={{
						mt: 2,
						pt: 1.5,
						borderTop: "1px dashed rgba(11,169,118,0.2)",
						display: "flex",
						alignItems: "center",
						gap: 1,
					}}
				>
					<VolunteerActivismRoundedIcon sx={{ fontSize: 16, color: PRIMARY }} />
					<Typography sx={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
						Ajak orang berdonasi & jadilah jembatan kebaikan
					</Typography>
				</Box>
			</Paper>
		</Box>
	);
}
