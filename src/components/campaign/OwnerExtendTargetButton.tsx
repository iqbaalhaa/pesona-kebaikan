"use client";

import React from "react";
import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Stack,
	Typography,
	InputAdornment,
} from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { requestCampaignChange } from "@/actions/campaign";

type OwnerExtendTargetButtonProps = {
	campaignId: string;
	campaignTitle: string;
};

export default function OwnerExtendTargetButton({
	campaignId,
	campaignTitle,
}: OwnerExtendTargetButtonProps) {
	const [open, setOpen] = React.useState(false);
	const [extraDays, setExtraDays] = React.useState<string>("7");
	const [extraTarget, setExtraTarget] = React.useState<string>("");
	const [submitting, setSubmitting] = React.useState(false);

	const handleOpen = () => setOpen(true);
	const handleClose = () => {
		if (submitting) return;
		setOpen(false);
	};

	const handleSubmit = async () => {
		if (submitting) return;

		const days = parseInt(extraDays || "0", 10);
		const target = parseInt(extraTarget || "0", 10);

		setSubmitting(true);

		try {
			await requestCampaignChange(
				campaignId,
				Number.isNaN(days) ? 0 : days,
				Number.isNaN(target) ? 0 : target,
			);
			setOpen(false);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Button
				fullWidth
				variant="outlined"
				startIcon={<TrendingUpRoundedIcon />}
				onClick={handleOpen}
				sx={{
					borderRadius: 3,
					py: 1.2,
					borderColor: "divider",
					color: "text.primary",
					textTransform: "none",
					fontWeight: 600,
					justifyContent: "flex-start",
				}}
			>
				Ajukan Perpanjangan & Tambah Target
			</Button>

			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth
				maxWidth="sm"
				PaperProps={{
					sx: {
						borderRadius: 3,
						m: 2,
					},
				}}
			>
				<DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>
					Ajukan Perubahan Campaign
				</DialogTitle>
				<DialogContent sx={{ pt: 1.5, pb: 2 }}>
					<Stack spacing={2}>
						<Typography sx={{ fontSize: 13.5, color: "text.secondary" }}>
							Campaign: {campaignTitle}
						</Typography>

						<Stack spacing={1}>
							<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
								Perpanjangan masa aktif
							</Typography>
							<TextField
								fullWidth
								size="small"
								type="number"
								value={extraDays}
								onChange={(e) => setExtraDays(e.target.value)}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">hari</InputAdornment>
									),
								}}
								placeholder="Contoh: 7"
							/>
						</Stack>

						<Stack spacing={1}>
							<Typography sx={{ fontWeight: 600, fontSize: 14 }}>
								Penambahan target donasi
							</Typography>
							<TextField
								fullWidth
								size="small"
								type="number"
								value={extraTarget}
								onChange={(e) => setExtraTarget(e.target.value)}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">Rp</InputAdornment>
									),
								}}
								placeholder="Contoh: 5000000"
							/>
							<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
								Kosongkan jika tidak ingin menambah target donasi.
							</Typography>
						</Stack>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2 }}>
					<Button onClick={handleClose} disabled={submitting}>
						Batal
					</Button>
					<Button
						variant="contained"
						onClick={handleSubmit}
						disabled={submitting}
						sx={{ fontWeight: 700, borderRadius: 2 }}
					>
						{submitting ? "Mengirim..." : "Kirim Pengajuan"}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
