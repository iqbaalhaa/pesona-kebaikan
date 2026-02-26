"use client";

import * as React from "react";
import Link from "next/link";
import {
	Card,
	CardMedia,
	CardContent,
	Typography,
	Chip,
	Box,
	Stack,
	LinearProgress,
	useTheme,
	alpha,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";

export type CampaignCardProps = {
	id: string;
	slug?: string;
	title: string;
	category: string;
	ownerName: string;
	collected: number;
	target: number;
	daysLeft: number;
	thumbnail?: string;
	verifiedAt?: Date | string | null;
};

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

export function CampaignCardSkeleton() {
	const theme = useTheme();
	return (
		<Card
			elevation={0}
			sx={{
				borderRadius: 1,
				border: "1px solid",
				borderColor: "divider",
				height: "100%",
			}}
		>
			<Box sx={{ width: "100%", height: 110, bgcolor: "action.hover" }} />
			<CardContent sx={{ p: 1.25 }}>
				<Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
					<Box
						sx={{
							width: 60,
							height: 18,
							borderRadius: 1,
							bgcolor: "action.hover",
						}}
					/>
					<Box
						sx={{
							width: 74,
							height: 18,
							borderRadius: 1,
							bgcolor: "action.hover",
						}}
					/>
				</Box>
				<Box
					sx={{ height: 32, borderRadius: 1, bgcolor: "action.hover", mb: 1 }}
				/>
				<Box
					sx={{
						width: "60%",
						height: 12,
						borderRadius: 1,
						bgcolor: "action.hover",
					}}
				/>
				<Box sx={{ mt: 1.5 }}>
					<LinearProgress
						variant="indeterminate"
						sx={{
							height: 5,
							borderRadius: 3,
							bgcolor: alpha(theme.palette.primary.main, 0.1),
							"& .MuiLinearProgress-bar": { borderRadius: 3 },
						}}
					/>
				</Box>
			</CardContent>
		</Card>
	);
}

export default function CampaignCard(props: CampaignCardProps) {
	const theme = useTheme();
	const x = props;
	const isQuickDonate = x.slug === "donasi-cepat";
	const progress =
		x.target > 0
			? Math.min(100, Math.round((x.collected / x.target) * 100))
			: 0;

	const [img, setImg] = React.useState(x.thumbnail || "/defaultimg.webp");

	return (
		<Link href={`/donasi/${x.slug || x.id}`} style={{ textDecoration: "none" }}>
			<Card
				elevation={0}
				sx={{
					height: "100%",
					display: "flex",
					flexDirection: "column",
					borderRadius: 1,
					border: "1px solid",
					borderColor: "divider",
					overflow: "hidden",
					transition: "all 0.2s ease",
					"&:hover": {
						borderColor: "transparent",
						boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
						transform: "translateY(-4px)",
					},
				}}
			>
				<CardMedia
					component="img"
					image={img}
					alt={x.title}
					onError={() => setImg("/defaultimg.webp")}
					sx={{
						width: "100%",
						height: 110,
						objectFit: "cover",
						bgcolor: "#f1f5f9",
					}}
				/>
				<CardContent
					sx={{
						p: 1.25,
						"&:last-child": { pb: 1.25 },
						flex: 1,
						display: "flex",
						flexDirection: "column",
					}}
				>
					<Stack
						direction="row"
						spacing={0.5}
						alignItems="center"
						flexWrap="wrap"
						gap={0.5}
						sx={{ mb: 0.75 }}
					>
						<Chip
							label={x.category}
							size="small"
							sx={{
								borderRadius: 1.5,
								fontWeight: 600,
								height: 18,
								fontSize: 10,
								bgcolor: alpha(theme.palette.primary.main, 0.08),
								color: theme.palette.primary.main,
							}}
						/>
						{x.verifiedAt ? (
							<Chip
								icon={<VerifiedUserIcon sx={{ fontSize: "12px !important" }} />}
								label="Verified"
								size="small"
								variant="outlined"
								sx={{
									borderRadius: 1.5,
									height: 18,
									fontSize: 10,
									borderColor: alpha(theme.palette.primary.main, 0.3),
									color: theme.palette.primary.main,
								}}
							/>
						) : null}
					</Stack>

					<Typography
						sx={{
							fontWeight: 800,
							fontSize: 13,
							lineHeight: 1.35,
							color: "text.primary",
							mb: 0.25,
							minHeight: 34,
						}}
						className="line-clamp-2"
					>
						{x.title}
					</Typography>

					<Typography
						sx={{
							fontSize: 11,
							color: "text.secondary",
							mb: "auto",
						}}
					>
						{x.ownerName}
					</Typography>

					<Box sx={{ mt: 1.5 }}>
						{!isQuickDonate && (
							<LinearProgress
								variant="determinate"
								value={progress}
								sx={{
									height: 5,
									borderRadius: 3,
									bgcolor: alpha(theme.palette.primary.main, 0.1),
									"& .MuiLinearProgress-bar": { borderRadius: 3 },
								}}
							/>
						)}
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								mt: 0.75,
								alignItems: "flex-end",
							}}
						>
							<Box>
								<Typography
									sx={{
										fontSize: 10,
										color: "text.secondary",
										fontWeight: 500,
									}}
								>
									Terkumpul
								</Typography>
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 800,
										color: theme.palette.primary.main,
									}}
								>
									Rp{rupiah(x.collected)}
								</Typography>
							</Box>
							<Box sx={{ textAlign: "right" }}>
								<Typography
									sx={{
										fontSize: 10,
										color: "text.secondary",
										fontWeight: 500,
									}}
								>
									{isQuickDonate ? "Tanpa Batas" : "Sisa Hari"}
								</Typography>
								<Typography
									sx={{ fontSize: 12, fontWeight: 700, color: "text.primary" }}
								>
									{isQuickDonate ? "∞" : x.daysLeft}
								</Typography>
							</Box>
						</Box>
					</Box>
				</CardContent>
			</Card>
		</Link>
	);
}
