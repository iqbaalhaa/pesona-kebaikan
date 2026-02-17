"use client";

import React from "react";
import {
	Box,
	Typography,
	Stack,
	Paper,
	Avatar,
	Chip,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	IconButton,
} from "@mui/material";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

type DonationItem = {
	id: string;
	donorName: string | null;
	isAnonymous: boolean;
	amount: number;
	status: string | null;
	message: string | null;
	createdAt: string;
};

type OwnerDonationHistoryProps = {
	donations: DonationItem[];
};

export default function OwnerDonationHistory({
	donations,
}: OwnerDonationHistoryProps) {
	const [open, setOpen] = React.useState(false);

	const latestTen = donations.slice(0, 10);

	const renderList = (items: DonationItem[]) => (
		<Stack spacing={1.5}>
			{items.map((donation) => (
				<Paper
					key={donation.id}
					elevation={0}
					sx={{
						p: 2,
						borderRadius: 3,
						bgcolor: "white",
						border: "1px solid",
						borderColor: "divider",
					}}
				>
					<Stack direction="row" alignItems="center" spacing={2}>
						<Avatar
							sx={{
								width: 40,
								height: 40,
								bgcolor: donation.isAnonymous ? "grey.100" : "primary.50",
								color: donation.isAnonymous ? "grey.500" : "primary.main",
								fontWeight: 700,
								fontSize: 14,
							}}
						>
							{donation.isAnonymous
								? "A"
								: (donation.donorName || "U").charAt(0).toUpperCase()}
						</Avatar>
						<Box sx={{ flex: 1 }}>
							<Typography variant="body2" fontWeight={700}>
								{donation.isAnonymous
									? "Hamba Allah"
									: donation.donorName || "Hamba Allah"}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								{new Date(donation.createdAt).toLocaleDateString("id-ID", {
									day: "numeric",
									month: "short",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Typography>
						</Box>
						<Box sx={{ textAlign: "right" }}>
							<Typography variant="body2" fontWeight={700} color="success.main">
								+
								{new Intl.NumberFormat("id-ID", {
									style: "currency",
									currency: "IDR",
									maximumFractionDigits: 0,
								}).format(Number(donation.amount))}
							</Typography>
							<Chip
								label={donation.status || "Pending"}
								size="small"
								color={
									donation.status === "PAID" ||
									donation.status === "Berhasil" ||
									donation.status === "COMPLETED"
										? "success"
										: donation.status === "PENDING"
											? "warning"
											: "default"
								}
								sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
							/>
						</Box>
					</Stack>
					{donation.message && (
						<Box
							sx={{
								mt: 1.5,
								p: 1.5,
								bgcolor: "grey.50",
								borderRadius: 2,
							}}
						>
							<Typography
								variant="caption"
								color="text.secondary"
								fontStyle="italic"
							>
								"{donation.message}"
							</Typography>
						</Box>
					)}
				</Paper>
			))}
		</Stack>
	);

	return (
		<>
			<Box
				sx={{
					mb: 2,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Typography variant="subtitle2" fontWeight={700} sx={{ px: 0.5 }}>
					Riwayat Donasi Terbaru
				</Typography>
				<Button
					size="small"
					onClick={() => setOpen(true)}
					sx={{ textTransform: "none", fontSize: 12 }}
				>
					Lihat Semua
				</Button>
			</Box>

			{donations.length === 0 ? (
				<Paper
					elevation={0}
					sx={{
						p: 4,
						textAlign: "center",
						borderRadius: 3,
						bgcolor: "white",
						border: "1px dashed",
						borderColor: "divider",
					}}
				>
					<PaidRoundedIcon
						sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
					/>
					<Typography variant="body2" color="text.secondary">
						Belum ada donasi masuk
					</Typography>
				</Paper>
			) : (
				renderList(latestTen)
			)}

			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: {
						borderRadius: 3,
						m: 2,
					},
				}}
			>
				<DialogTitle
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						pr: 1.5,
					}}
				>
					<Typography component="span" variant="subtitle1" fontWeight={700}>
						Semua Donasi
					</Typography>
					<IconButton size="small" onClick={() => setOpen(false)}>
						<CloseRoundedIcon fontSize="small" />
					</IconButton>
				</DialogTitle>
				<DialogContent
					dividers
					sx={{
						maxHeight: 440,
						p: 2,
						bgcolor: "grey.50",
					}}
				>
					{donations.length === 0 ? (
						<Paper
							elevation={0}
							sx={{
								p: 4,
								textAlign: "center",
								borderRadius: 3,
								bgcolor: "white",
								border: "1px dashed",
								borderColor: "divider",
							}}
						>
							<PaidRoundedIcon
								sx={{ fontSize: 40, color: "text.disabled", mb: 1 }}
							/>
							<Typography variant="body2" color="text.secondary">
								Belum ada donasi masuk
							</Typography>
						</Paper>
					) : (
						renderList(donations)
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
