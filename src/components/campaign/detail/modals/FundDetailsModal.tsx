"use client";

import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogActions,
	Button,
	Box,
	Typography,
	Chip,
	Stack,
	Divider,
} from "@mui/material";
import { Transition, formatIDR } from "../utils";

interface FundDetailsModalProps {
	open: boolean;
	onClose: () => void;
	totalCollected: number;
	fees: number;
	withdrawn: number;
	remaining: number;
	campaignDuration: number;
}

export default function FundDetailsModal({
	open,
	onClose,
	totalCollected,
	fees,
	withdrawn,
	remaining,
	campaignDuration,
}: FundDetailsModalProps) {
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
			<DialogContent>
				<Box sx={{ mb: 3 }}>
					<Chip
						label="Transparan"
						size="small"
						sx={{
							bgcolor: "#dcfce7",
							color: "#16a34a",
							fontWeight: 700,
							height: 24,
							mb: 2,
						}}
					/>
					<Box>
						<Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>
							Status Dana Terkumpul
						</Typography>
						<Typography sx={{ fontSize: 13, color: "#64748b" }}>
							Penggalang dana sudah mengumpulkan dana selama {campaignDuration}{" "}
							hari.
						</Typography>
					</Box>
				</Box>

				{/* Total Collected */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
					}}
				>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<Chip
							label="100%"
							size="small"
							sx={{
								bgcolor: "#0ea5e9",
								color: "white",
								fontWeight: 700,
								height: 24,
							}}
						/>
						<Typography sx={{ fontWeight: 700, fontSize: 14 }}>
							Dana terkumpul
						</Typography>
					</Box>
					<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
						{formatIDR(totalCollected)}
					</Typography>
				</Box>

				{/* Breakdown Box */}
				<Box
					sx={{
						bgcolor: "#e0f2fe",
						borderRadius: 2,
						p: 2,
						mb: 3,
					}}
				>
					<Box sx={{ mb: 1.5 }}>
						<Chip
							label="100%"
							size="small"
							sx={{
								bgcolor: "#0ea5e9",
								color: "white",
								fontWeight: 700,
								height: 20,
								fontSize: 11,
								mb: 1,
							}}
						/>
					</Box>

					<Stack spacing={1.5}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: 14,
							}}
						>
							<Typography sx={{ fontSize: 14, color: "#334155" }}>
								Dana untuk penggalangan dana
							</Typography>
							<Typography sx={{ fontSize: 14, fontWeight: 500 }}>
								{formatIDR(totalCollected)}
							</Typography>
						</Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: 14,
							}}
						>
							<Typography sx={{ fontSize: 14, color: "#334155" }}>
								Biaya transaksi dan teknologi*
							</Typography>
							<Typography sx={{ fontSize: 14, fontWeight: 500 }}>
								{formatIDR(fees)}
							</Typography>
						</Box>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: 14,
							}}
						>
							<Typography sx={{ fontSize: 14, color: "#334155" }}>
								Sudah dicairkan
							</Typography>
							<Typography sx={{ fontSize: 14, fontWeight: 500 }}>
								{formatIDR(withdrawn)}
							</Typography>
						</Box>

						<Divider sx={{ borderColor: "#bae6fd" }} />

						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: 14,
							}}
						>
							<Typography sx={{ fontSize: 14, fontWeight: 700 }}>
								Belum dicairkan**
							</Typography>
							<Typography sx={{ fontSize: 14, fontWeight: 700 }}>
								{formatIDR(remaining)}
							</Typography>
						</Box>
					</Stack>
				</Box>

				{/* Optional Donation */}
				<Box sx={{ mb: 3 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
						<Chip
							label="0%"
							size="small"
							sx={{
								bgcolor: "#e2e8f0",
								color: "#64748b",
								fontWeight: 700,
								height: 20,
								fontSize: 11,
							}}
						/>
						<Typography sx={{ fontSize: 14, color: "#64748b" }}>
							Donasi operasional yayasan pesona kebaikan
						</Typography>
					</Box>
				</Box>

				{/* Footnotes */}
				<Box
					sx={{
						bgcolor: "#fefce8",
						p: 2,
						borderRadius: 2,
						fontSize: 12,
						color: "#854d0e",
					}}
				>
					<Typography sx={{ fontSize: 12, mb: 1, lineHeight: 1.5 }}>
						* Biaya ini 100% dibayarkan kepada pihak ketiga penyedia layanan
						transaksi digital dan Virtual Account, dompet digital dan QRIS serta
						layanan notifikasi (SMS, WA & email) dan server. Pesona Kebaikan
						tidak mengambil keuntungan dari layanan ini.
					</Typography>
					<Typography sx={{ fontSize: 12, lineHeight: 1.5 }}>
						** Dana dapat dicairkan dan dikelola oleh penggalang dana. Jika
						terdapat sisa uang, belum dicairkan, maka uang tersebut akan
						disalurkan ke penerima manfaat yang ditunjuk.
					</Typography>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 2 }}>
				<Button
					fullWidth
					variant="contained"
					onClick={onClose}
					sx={{
						bgcolor: "#0ea5e9",
						textTransform: "none",
						fontWeight: 700,
						py: 1.5,
						borderRadius: 2,
						"&:hover": { bgcolor: "#0284c7" },
					}}
				>
					Tutup
				</Button>
			</DialogActions>
		</Dialog>
	);
}
