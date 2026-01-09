"use client";

import * as React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Typography,
	IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Transition } from "../utils";

interface MedicalModalProps {
	open: boolean;
	onClose: () => void;
}

export default function MedicalModal({ open, onClose }: MedicalModalProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			TransitionComponent={Transition}
			fullWidth
			maxWidth="sm"
			PaperProps={{
				sx: { borderRadius: "20px" },
			}}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<Typography variant="h6" fontWeight={700} component="div">
					Informasi Medis
				</Typography>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<Typography sx={{ color: "text.secondary" }}>
					Detail informasi medis lengkap tersedia dalam cerita penggalangan dana.
					Silakan baca bagian cerita untuk mengetahui kondisi terkini penerima
					manfaat.
				</Typography>
			</DialogContent>
		</Dialog>
	);
}
