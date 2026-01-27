"use client";

import React from "react";
import { Box, Paper, Stack, Typography, Chip, Button } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { getBankName } from "@/lib/banks";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

export type WithdrawalStatus =
	| "PENDING"
	| "APPROVED"
	| "REJECTED"
	| "COMPLETED";

export type WithdrawalRow = {
	id: string;
	amount: number;
	status: WithdrawalStatus;
	bankName: string;
	bankAccount: string;
	accountHolder: string;
	createdAt: string;
	campaignTitle: string;
	campaignId: string;
	campaignSlug?: string | null;
	proofUrl?: string | null;
	referenceNo?: string | null;
};

function idr(n: number) {
	if (!n) return "Rp0";
	const s = Math.round(n).toString();
	return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function statusMeta(status: WithdrawalStatus) {
	switch (status) {
		case "COMPLETED":
			return {
				label: "Selesai",
				icon: <CheckCircleRoundedIcon fontSize="small" />,
				tone: "success" as const,
			};
		case "APPROVED":
			return {
				label: "Disetujui",
				icon: <CheckCircleRoundedIcon fontSize="small" />,
				tone: "info" as const,
			};
		case "PENDING":
			return {
				label: "Menunggu",
				icon: <HourglassBottomRoundedIcon fontSize="small" />,
				tone: "warning" as const,
			};
		case "REJECTED":
			return {
				label: "Ditolak",
				icon: <ErrorRoundedIcon fontSize="small" />,
				tone: "error" as const,
			};
	}
}

interface WithdrawalCardProps {
	row: WithdrawalRow;
	onUpdateStatus: (
		id: string,
		status: Exclude<WithdrawalStatus, "PENDING">
	) => void;
	onApproveClick: (row: WithdrawalRow) => void;
}

export default function WithdrawalCard({
	row,
	onUpdateStatus,
	onApproveClick,
}: WithdrawalCardProps) {
	const theme = useTheme();
	const meta = statusMeta(row.status);

	return (
		<Paper
			variant="outlined"
			sx={{
				p: 2,
				borderRadius: 3,
				borderColor: alpha(theme.palette.divider, 0.6),
				bgcolor: alpha(
					theme.palette.background.default,
					theme.palette.mode === "dark" ? 0.4 : 0.8
				),
				backdropFilter: "blur(12px)",
				boxShadow: theme.shadows[1],
			}}
		>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={2}
				alignItems={{ xs: "start", sm: "center" }}
			>
				<Box
					sx={{
						width: 48,
						height: 48,
						borderRadius: 2.5,
						display: "grid",
						placeItems: "center",
						bgcolor: alpha(
							meta.tone === "success"
								? "#22c55e"
								: meta.tone === "warning"
								? "#f59e0b"
								: meta.tone === "info"
								? "#3b82f6"
								: "#ef4444",
							0.12
						),
						color:
							meta.tone === "success"
								? "#22c55e"
								: meta.tone === "warning"
								? "#f59e0b"
								: meta.tone === "info"
								? "#3b82f6"
								: "#ef4444",
					}}
				>
					{meta.icon}
				</Box>

				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Stack
						direction="row"
						alignItems="center"
						spacing={1}
						flexWrap="wrap"
						sx={{ mb: 0.5 }}
					>
						<Typography sx={{ fontSize: 16, fontWeight: 1000 }}>
							{idr(row.amount)}
						</Typography>
						<Chip
							label={meta.label}
							size="small"
							color={meta.tone}
							sx={{ fontWeight: 800, height: 20 }}
						/>
					</Stack>
					<Typography
						sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}
						noWrap
					>
						{row.campaignTitle}
					</Typography>
					<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
						{getBankName(row.bankName)} • {row.bankAccount} a.n{" "}
						{row.accountHolder}
					</Typography>
					{row.referenceNo && (
						<Typography
							sx={{
								fontSize: 11,
								fontFamily: "monospace",
								color: "text.secondary",
								mt: 0.25,
							}}
						>
							Ref: {row.referenceNo}
						</Typography>
					)}
					<Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.5 }}>
						{row.createdAt}
					</Typography>
				</Box>

				{row.status === "PENDING" && (
					<Stack direction="row" spacing={1}>
						<Button
							variant="outlined"
							color="error"
							size="small"
							onClick={() => onUpdateStatus(row.id, "REJECTED")}
						>
							Tolak
						</Button>
						<Button
							variant="contained"
							size="small"
							onClick={() => onApproveClick(row)}
						>
							Setujui
						</Button>
					</Stack>
				)}
				{row.status === "APPROVED" && (
					<Button
						variant="contained"
						color="success"
						size="small"
						onClick={() => onUpdateStatus(row.id, "COMPLETED")}
					>
						Selesai Transfer
					</Button>
				)}
			</Stack>
		</Paper>
	);
}
