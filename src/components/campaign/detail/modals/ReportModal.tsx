"use client";

import * as React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	IconButton,
	Alert,
	AlertTitle,
	Stack,
	TextField,
	FormControl,
	Select,
	MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReportProblemRoundedIcon from "@mui/icons-material/ReportProblemRounded";
import { ReportReason } from "@prisma/client";
import { Transition } from "../utils";

interface ReportModalProps {
	open: boolean;
	onClose: () => void;
	loading: boolean;
	reason: ReportReason | "";
	setReason: (reason: ReportReason | "") => void;
	details: string;
	setDetails: (details: string) => void;
	name: string;
	setName: (name: string) => void;
	phone: string;
	setPhone: (phone: string) => void;
	email: string;
	setEmail: (email: string) => void;
	onSubmit: () => void;
	reportReasons: { value: ReportReason; label: string }[];
}

export default function ReportModal({
	open,
	onClose,
	loading,
	reason,
	setReason,
	details,
	setDetails,
	name,
	setName,
	phone,
	setPhone,
	email,
	setEmail,
	onSubmit,
	reportReasons,
}: ReportModalProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			TransitionComponent={Transition}
			fullWidth
			maxWidth="sm"
			PaperProps={{
				sx: {
					borderRadius: "24px",
					maxHeight: "90vh",
					bgcolor: "#ffffff",
					backgroundImage: "none",
					boxShadow: "0 20px 40px -4px rgba(0,0,0,0.1)",
				},
			}}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					p: 3,
					pb: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: "12px",
							bgcolor: "#fee2e2",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<ReportProblemRoundedIcon sx={{ color: "#ef4444" }} />
					</Box>
					<Box>
						<Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
							Laporkan Campaign
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Bantu kami menjaga keamanan platform
						</Typography>
					</Box>
				</Box>
				<IconButton
					onClick={onClose}
					sx={{
						bgcolor: "#f1f5f9",
						"&:hover": { bgcolor: "#e2e8f0" },
					}}
				>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ p: 3, pt: 1 }}>
				<Alert
					severity="info"
					icon={false}
					sx={{
						mb: 3,
						bgcolor: "#f0f9ff",
						color: "#0c4a6e",
						border: "1px solid #bae6fd",
						"& .MuiAlert-message": { width: "100%" },
						borderRadius: "16px",
					}}
				>
					<AlertTitle sx={{ fontWeight: 700, mb: 0.5 }}>
						Identitas Pelapor Dilindungi
					</AlertTitle>
					<Typography variant="body2" sx={{ opacity: 0.9 }}>
						Data diri Anda tidak akan dibagikan kepada penggalang dana. Kami
						menjaga kerahasiaan identitas pelapor sepenuhnya.
					</Typography>
				</Alert>

				<Stack spacing={2.5}>
					<Box>
						<Typography
							variant="subtitle2"
							fontWeight={700}
							sx={{ mb: 1, color: "#334155" }}
						>
							Data Pelapor
						</Typography>
						<Stack spacing={2}>
							<TextField
								fullWidth
								placeholder="Nama Lengkap"
								value={name}
								onChange={(e) => setName(e.target.value)}
								InputProps={{
									sx: { borderRadius: "12px", bgcolor: "#f8fafc" },
								}}
								sx={{
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "#e2e8f0",
									},
								}}
							/>
							<Box sx={{ display: "flex", gap: 2 }}>
								<TextField
									fullWidth
									placeholder="No. WhatsApp"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									InputProps={{
										sx: { borderRadius: "12px", bgcolor: "#f8fafc" },
									}}
									sx={{
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "#e2e8f0",
										},
									}}
								/>
								<TextField
									fullWidth
									placeholder="Email Aktif"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									InputProps={{
										sx: { borderRadius: "12px", bgcolor: "#f8fafc" },
									}}
									sx={{
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "#e2e8f0",
										},
									}}
								/>
							</Box>
						</Stack>
					</Box>

					<Box>
						<Typography
							variant="subtitle2"
							fontWeight={700}
							sx={{ mb: 1, color: "#334155" }}
						>
							Detail Masalah
						</Typography>
						<Stack spacing={2}>
							<FormControl fullWidth>
								<Select
									value={reason}
									onChange={(e) => setReason(e.target.value as ReportReason)}
									displayEmpty
									renderValue={(selected) => {
										if (!selected) {
											return (
												<Typography color="text.secondary">
													Pilih jenis pelanggaran
												</Typography>
											);
										}
										return reportReasons.find((r) => r.value === selected)
											?.label;
									}}
									sx={{
										borderRadius: "12px",
										bgcolor: "#f8fafc",
										"& .MuiOutlinedInput-notchedOutline": {
											borderColor: "#e2e8f0",
										},
									}}
								>
									{reportReasons.map((option) => (
										<MenuItem key={option.value} value={option.value}>
											{option.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<TextField
								fullWidth
								multiline
								rows={4}
								placeholder="Ceritakan detail masalah atau bukti yang Anda temukan..."
								value={details}
								onChange={(e) => setDetails(e.target.value)}
								InputProps={{
									sx: { borderRadius: "12px", bgcolor: "#f8fafc" },
								}}
								sx={{
									"& .MuiOutlinedInput-notchedOutline": {
										borderColor: "#e2e8f0",
									},
								}}
							/>
						</Stack>
					</Box>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ p: 3, pt: 1 }}>
				<Button
					onClick={onClose}
					disabled={loading}
					sx={{
						color: "#64748b",
						fontWeight: 700,
						textTransform: "none",
						borderRadius: "12px",
						px: 3,
					}}
				>
					Batal
				</Button>
				<Button
					variant="contained"
					onClick={onSubmit}
					disabled={loading}
					sx={{
						bgcolor: "#ef4444",
						color: "white",
						textTransform: "none",
						fontWeight: 700,
						px: 4,
						py: 1.2,
						borderRadius: "12px",
						boxShadow: "0 10px 20px -5px rgba(239, 68, 68, 0.3)",
						"&:hover": {
							bgcolor: "#dc2626",
							boxShadow: "0 15px 25px -5px rgba(239, 68, 68, 0.4)",
						},
					}}
				>
					{loading ? "Mengirim..." : "Kirim Laporan"}
				</Button>
			</DialogActions>
		</Dialog>
	);
}
