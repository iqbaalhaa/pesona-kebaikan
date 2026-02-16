"use client";

import * as React from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Typography,
	IconButton,
	Box,
	Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Transition } from "../utils";

interface PatientModalProps {
	open: boolean;
	onClose: () => void;
	data: any;
}

export default function PatientModal({ open, onClose, data }: PatientModalProps) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			TransitionComponent={Transition}
			fullWidth
			maxWidth="sm"
			PaperProps={{
				sx: { borderRadius: "16px" },
			}}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					p: 2.5,
					borderBottom: "1px solid #f1f5f9",
				}}
			>
				<Typography
					variant="h6"
					component="div"
					fontWeight={700}
					fontSize={18}
				>
					Data Pasien
				</Typography>
				<IconButton onClick={onClose} size="small">
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent sx={{ p: 3 }}>
				<Typography
					variant="h6"
					sx={{ fontSize: 16, fontWeight: 700, mb: 2.5 }}
				>
					Pasien
				</Typography>

				<Stack spacing={3}>
					{/* Patient Name */}
					<Box sx={{ display: "flex", gap: 2 }}>
						<PersonOutlineOutlinedIcon
							sx={{ color: "#0ea5e9", fontSize: 28 }}
						/>
						<Box>
							<Typography
								sx={{ fontWeight: 700, fontSize: 16, color: "#0f172a", mb: 0.5 }}
							>
								{data.beneficiaryName || data.title}
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								<Typography sx={{ fontSize: 13, color: "#64748b" }}>
									Identitas sesuai dokumen medis
								</Typography>
								<CheckCircleIcon sx={{ fontSize: 16, color: "#84cc16" }} />
							</Box>
						</Box>
					</Box>

					{/* Disease Info */}
					<Box sx={{ display: "flex", gap: 2 }}>
						<MedicalServicesOutlinedIcon
							sx={{ color: "#0ea5e9", fontSize: 28 }}
						/>
						<Box>
							<Typography
								sx={{ fontWeight: 700, fontSize: 16, color: "#0f172a", mb: 0.5 }}
							>
								{data.medicalCondition || "Kondisi Medis"}
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
								<Typography sx={{ fontSize: 13, color: "#64748b" }}>
									Disertai dokumen medis
								</Typography>
								<CheckCircleIcon sx={{ fontSize: 16, color: "#84cc16" }} />
							</Box>
						</Box>
					</Box>

					{/* Foundation Info */}
					{data.facilitatorName && (
						<Box
							sx={{
								bgcolor: "#e0f2fe",
								borderRadius: 2,
								p: 2,
								mt: 2,
							}}
						>
							<Typography
								sx={{ fontSize: 14, color: "#0f172a", textAlign: "center" }}
							>
								Pasien berada dalam pendampingan{" "}
								<Box component="span" sx={{ fontWeight: 700, color: "#0284c7" }}>
									{data.facilitatorName}
								</Box>
							</Typography>
						</Box>
					)}
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
