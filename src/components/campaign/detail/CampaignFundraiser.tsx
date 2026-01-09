"use client";

import * as React from "react";
import Link from "next/link";
import {
	Box,
	Typography,
	Avatar,
	Chip,
	Divider,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

interface CampaignFundraiserProps {
	data: any;
	setOpenFundDetailsModal: (open: boolean) => void;
}

export default function CampaignFundraiser({
	data,
	setOpenFundDetailsModal,
}: CampaignFundraiserProps) {
	return (
		<Box sx={{ mb: 3 }}>
			<Typography
				variant="h6"
				sx={{
					fontSize: 16,
					fontWeight: 700,
					color: "#0f172a",
					mb: 2,
				}}
			>
				Informasi Penggalangan Dana
			</Typography>
			<Box
				sx={{
					border: "1px solid #e2e8f0",
					borderRadius: 3,
					overflow: "hidden",
				}}
			>
				<Box sx={{ p: 2 }}>
					<Typography
						sx={{
							fontSize: 13,
							fontWeight: 700,
							color: "#334155",
							mb: 2,
						}}
					>
						Penggalang Dana
					</Typography>
					<Link
						href={data.ownerId ? `/initiator/${data.ownerId}` : "#"}
						aria-disabled={!data.ownerId}
						onClick={(e) => {
							if (!data.ownerId) e.preventDefault();
						}}
						style={{ textDecoration: "none" }}
					>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 2,
								cursor: data.ownerId ? "pointer" : "default",
								"&:hover": data.ownerId ? { opacity: 0.9 } : undefined,
							}}
						>
							<Avatar
								sx={{ width: 48, height: 48, border: "1px solid #f1f5f9" }}
								src={data.ownerAvatar}
							>
								{data.ownerName.charAt(0)}
							</Avatar>
							<Box>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										gap: 0.5,
										mb: 0.25,
									}}
								>
									<Typography
										sx={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}
									>
										{data.ownerName}
									</Typography>
									<VerifiedUserIcon sx={{ fontSize: 16, color: "#3b82f6" }} />
									<Chip
										label="ORG"
										size="small"
										sx={{
											height: 16,
											fontSize: 9,
											fontWeight: 700,
											bgcolor: "#e0f2fe",
											color: "#0284c7",
											borderRadius: 1,
											px: 0.5,
											"& .MuiChip-label": { px: 0.5 },
										}}
									/>
								</Box>
								<Typography sx={{ fontSize: 12, color: "#64748b" }}>
									Identitas terverifikasi
								</Typography>
							</Box>
						</Box>
					</Link>
				</Box>

				<Divider />

				<Box
					onClick={() => setOpenFundDetailsModal(true)}
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						p: 2,
						cursor: "pointer",
						"&:hover": { bgcolor: "#f8fafc" },
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<AccountBalanceWalletOutlinedIcon
							sx={{ color: "#64748b", fontSize: 22 }}
						/>
						<Typography
							sx={{ fontSize: 14, fontWeight: 600, color: "#334155" }}
						>
							Rincian Penggunaan Dana
						</Typography>
					</Box>
					<NavigateNextIcon sx={{ color: "#94a3b8" }} />
				</Box>
			</Box>
		</Box>
	);
}
