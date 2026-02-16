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
	Chip,
	Stack,
	Divider,
	IconButton,
	Collapse,
	Link,
} from "@mui/material";
import { Transition, formatIDR } from "../utils";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";

export interface AllocationItem {
	title: string;
	amount: number;
}

interface FundDetailsModalProps {
	open: boolean;
	onClose: () => void;
	totalCollected: number;
	fees: number;
	withdrawn: number;
	remaining: number;
	campaignDuration: number;
	foundationFeePercentage?: number;
	foundationFeeAmount?: number;
	target?: number;
	updatedAt?: string | Date;
	allocations?: AllocationItem[];
}

export default function FundDetailsModal({
	open,
	onClose,
	totalCollected,
	fees,
	withdrawn,
	remaining,
	campaignDuration,
	foundationFeePercentage = 0,
	foundationFeeAmount = 0,
	target = 0,
	updatedAt,
	allocations = [],
}: FundDetailsModalProps) {
	const [expandFoundation, setExpandFoundation] = React.useState(true);
	const [expandFAQ, setExpandFAQ] = React.useState(true);

	// Format Duration
	const years = Math.floor(campaignDuration / 365);
	const days = campaignDuration % 365;
	const durationText =
		years > 0 ? `${years} tahun, ${days} hari` : `${days} hari`;

	// Format UpdatedAt
	const formattedDate = updatedAt
		? new Intl.DateTimeFormat("id-ID", {
				day: "numeric",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}).format(new Date(updatedAt))
		: "-";

	return (
		<Dialog
			open={open}
			onClose={onClose}
			TransitionComponent={Transition}
			fullWidth
			maxWidth="sm"
			PaperProps={{
				sx: { borderRadius: "12px" },
			}}
			scroll="paper"
		>
			<DialogTitle
				sx={{
					fontWeight: 800,
					fontSize: 18,
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					pb: 1,
				}}
			>
				Rincian Penggunaan Dana
				{/* <IconButton onClick={onClose} size="small">
					<CloseRoundedIcon />
				</IconButton> */}
			</DialogTitle>
			<DialogContent dividers sx={{ p: 0 }}>
				<Box sx={{ p: 3 }}>
					{/* Status Dana Terkumpul Header */}
					<Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
						<AccountBalanceWalletRoundedIcon
							color="primary"
							sx={{ fontSize: 28, color: "#0ba976" }}
						/>
						<Box>
							<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
								Status Dana Terkumpul
							</Typography>
							<Typography sx={{ fontSize: 13, color: "#64748b" }}>
								Penggalang dana sudah mengumpulkan dana selama {durationText}.
							</Typography>
						</Box>
					</Box>

					{/* Total Collected Row */}
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mt: 3,
							mb: 2,
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Chip
								label="100%"
								size="small"
								sx={{
									bgcolor: "#0ba976",
									color: "white",
									fontWeight: 800,
									height: 24,
									fontSize: 12,
								}}
							/>
							<Typography sx={{ fontWeight: 800, fontSize: 14 }}>
								Dana terkumpul
							</Typography>
						</Box>
						<Typography sx={{ fontWeight: 800, fontSize: 16 }}>
							{formatIDR(totalCollected)}
						</Typography>
					</Box>

					{/* Breakdown Box */}
					<Box
						sx={{
							bgcolor: "rgba(11,169,118,0.3)",
							borderRadius: 2,
							p: 2,
							mb: 3,
						}}
					>
						<Stack spacing={1.5}>
							{/* Dana Penggalangan */}
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "flex-start",
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
									<Chip
										label={`${100 - (foundationFeePercentage || 0)}%`}
										size="small"
										sx={{
											bgcolor: "#0ba976",
											color: "white",
											fontWeight: 800,
											height: 20,
											fontSize: 11,
										}}
									/>
									<Typography sx={{ fontSize: 14, color: "#334155" }}>
										Dana untuk penggalangan dana
									</Typography>
								</Box>
								<Typography sx={{ fontSize: 14, fontWeight: 500 }}>
									{formatIDR(totalCollected)}
								</Typography>
							</Box>

							{/* Fees */}
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									pl: 4.5, // Indent to align with text above
								}}
							>
								<Typography sx={{ fontSize: 14, color: "#334155" }}>
									Biaya transaksi dan teknologi*
								</Typography>
								<Typography sx={{ fontSize: 14, fontWeight: 500 }}>
									{formatIDR(fees)}
								</Typography>
							</Box>

							{/* Withdrawn */}
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									pl: 4.5,
								}}
							>
								<Typography sx={{ fontSize: 14, color: "#334155" }}>
									Sudah dicairkan
								</Typography>
								<Typography sx={{ fontSize: 14, fontWeight: 500 }}>
									{formatIDR(withdrawn)}
								</Typography>
							</Box>

							<Divider sx={{ borderColor: "#bae6fd", ml: 4.5 }} />

							{/* Remaining */}
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									pl: 4.5,
								}}
							>
								<Typography sx={{ fontSize: 14, fontWeight: 800 }}>
									Belum dicairkan**
								</Typography>
								<Typography sx={{ fontSize: 14, fontWeight: 800 }}>
									{formatIDR(remaining)}
								</Typography>
							</Box>
						</Stack>
					</Box>

					{/* Foundation Fee Section */}
					<Box sx={{ mb: 3 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								cursor: "pointer",
							}}
							onClick={() => setExpandFoundation(!expandFoundation)}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<Chip
									label={`${foundationFeePercentage}%`}
									size="small"
									sx={{
										bgcolor: "rgba(11,169,118,0.08)",
										color: "#0ba976",
										fontWeight: 800,
										height: 24,
										fontSize: 12,
									}}
								/>
								<Typography sx={{ fontSize: 14, color: "#334155" }}>
									Donasi operasional yayasan pesona kebaikan
								</Typography>
							</Box>
							<ExpandMoreIcon
								sx={{
									transform: expandFoundation
										? "rotate(180deg)"
										: "rotate(0deg)",
									transition: "0.2s",
									color: "#0ba976",
								}}
							/>
						</Box>
						<Collapse in={expandFoundation}>
							<Box sx={{ mt: 1, pl: 0 }}>
								<Typography sx={{ fontSize: 14, fontWeight: 800, mb: 0.5 }}>
									{formatIDR(foundationFeeAmount)}
								</Typography>
								<Typography
									sx={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}
								>
									Donasi untuk operasional Yayasan Pesona Kebaikan agar donasi
									semakin aman, mudah & transparan. Maksimal{" "}
									{foundationFeePercentage}% dari donasi terkumpul,{" "}
									<Link href="#" underline="hover">
										selengkapnya
									</Link>
									.
								</Typography>
							</Box>
						</Collapse>
					</Box>

					{/* Footnotes */}
					<Box
						sx={{
							bgcolor: "#fefce8",
							p: 2,
							borderRadius: 2,
							fontSize: 12,
							color: "#854d0e",
							mb: 3,
						}}
					>
						<Typography sx={{ fontSize: 12, mb: 1, lineHeight: 1.5 }}>
							* Biaya ini 100% dibayarkan kepada pihak ketiga penyedia layanan
							transaksi digital dan Virtual Account, dompet digital dan QRIS
							serta layanan notifikasi (SMS, WA & email) dan server. Pesona
							Kebaikan tidak mengambil keuntungan dari layanan ini.{" "}
							<Link href="#" sx={{ color: "#0ba976", textDecoration: "none" }}>
								Baca lebih lengkap.
							</Link>
						</Typography>
						<Typography sx={{ fontSize: 12, lineHeight: 1.5 }}>
							** Dana dapat dicairkan dan dikelola oleh penggalang dana. Jika
							terdapat donasi yang belum disalurkan/dicairkan{" "}
							<Link href="#" sx={{ color: "#0ba976", textDecoration: "none" }}>
								baca selengkapnya di sini.
							</Link>
						</Typography>
					</Box>

					{/* Updated At */}
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 4 }}>
						<AccessTimeRoundedIcon sx={{ fontSize: 20, color: "#64748b" }} />
						<Typography sx={{ fontSize: 13, color: "#64748b" }}>
							Terakhir diperbarui pada {formattedDate} WIB
						</Typography>
					</Box>
				</Box>

				<Divider />

				{/* Rencana Penggunaan Dana */}
				<Box sx={{ p: 3, bgcolor: "#f8fafc" }}>
					<Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
						<ReceiptLongRoundedIcon sx={{ fontSize: 28, color: "#64748b" }} />
						<Box>
							<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
								Rencana Penggunaan Dana
							</Typography>
						</Box>
					</Box>

					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 4,
						}}
					>
						<Typography sx={{ fontWeight: 800, fontSize: 14 }}>
							Target donasi
						</Typography>
						<Typography sx={{ fontWeight: 800, fontSize: 16 }}>
							{formatIDR(target)}
						</Typography>
					</Box>

					<Divider sx={{ mb: 4 }} />

					{/* Rencana Alokasi Dana */}
					<Box sx={{ display: "flex", gap: 1.5, mb: 1 }}>
						<FavoriteRoundedIcon
							color="primary"
							sx={{ fontSize: 28, color: "#0ba976" }}
						/>
						<Box>
							<Typography sx={{ fontWeight: 700, fontSize: 16 }}>
								Rencana Alokasi Dana
							</Typography>
						</Box>
						<Box sx={{ flexGrow: 1 }} />
						<Typography sx={{ fontWeight: 800, fontSize: 16 }}>
							{formatIDR(target)}
						</Typography>
					</Box>

					<Typography sx={{ fontSize: 14, color: "#475569", mb: 2 }}>
						Penggalang dana ikut serta dalam menentukan target donasi dan
						rencana alokasinya sebagai berikut:
					</Typography>

					<Stack spacing={2} sx={{ mb: 3 }}>
						{allocations.length > 0 ? (
							allocations.map((item, index) => (
								<Box
									key={index}
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
										<KeyboardArrowRightRoundedIcon
											sx={{ color: "#0ba976", fontSize: 24 }}
										/>
										<Typography sx={{ fontSize: 14, color: "#334155" }}>
											{item.title}
										</Typography>
									</Box>
									<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
										{formatIDR(item.amount)}
									</Typography>
								</Box>
							))
						) : (
							<Typography
								sx={{ fontSize: 14, color: "#94a3b8", fontStyle: "italic" }}
							>
								Belum ada rincian alokasi dana
							</Typography>
						)}
					</Stack>

					<Box
						sx={{
							bgcolor: "#fffbeb",
							p: 2,
							borderRadius: 2,
							color: "#422006",
						}}
					>
						<Typography sx={{ fontSize: 13, lineHeight: 1.6 }}>
							Total target dan penggunaan donasi dapat berubah menyesuaikan
							kondisi dan kebutuhan selama galang dana berlangsung
						</Typography>
					</Box>

					{/* FAQ Section */}
					<Box sx={{ mt: 4 }}>
						<Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
							<ChatBubbleOutlineRoundedIcon
								sx={{ fontSize: 24, color: "#64748b" }}
							/>
							<Typography sx={{ fontWeight: 800, fontSize: 16 }}>
								FAQ
							</Typography>
						</Box>

						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								cursor: "pointer",
							}}
							onClick={() => setExpandFAQ(!expandFAQ)}
						>
							<Typography sx={{ fontWeight: 700, fontSize: 14, pr: 2 }}>
								Bagaimana jika donasi terkumpul melebihi target Rencana
								Penggunaan Dana
							</Typography>
							<ExpandMoreIcon
								sx={{
									transform: expandFAQ ? "rotate(180deg)" : "rotate(0deg)",
									transition: "0.2s",
									color: "#64748b",
								}}
							/>
						</Box>
						<Collapse in={expandFAQ}>
							<Box sx={{ mt: 2 }}>
								<ul style={{ paddingLeft: 20, margin: 0 }}>
									<li style={{ marginBottom: 12 }}>
										<Typography sx={{ fontSize: 14, fontWeight: 700 }}>
											Galang Dana Pesona Kebaikan/mitra Pesona Kebaikan
										</Typography>
										<Typography
											sx={{ fontSize: 13, color: "#475569", mt: 0.5 }}
										>
											Kelebihan donasi dari target Rencana Penggunaan Dana akan
											disalurkan ke banyak penerima manfaat, dengan persetujuan
											penerima manfaat utama.
										</Typography>
									</li>
									<li>
										<Typography sx={{ fontSize: 14, fontWeight: 700 }}>
											Galang dana individu
										</Typography>
										<Typography
											sx={{ fontSize: 13, color: "#475569", mt: 0.5 }}
										>
											Berapa pun donasi terkumpul akan disalurkan seluruhnya ke
											penerima manfaat.
										</Typography>
									</li>
								</ul>
							</Box>
						</Collapse>
					</Box>
				</Box>
			</DialogContent>
			<DialogActions sx={{ p: 2, bgcolor: "#f8fafc" }}>
				<Button
					fullWidth
					variant="contained"
					onClick={onClose}
					sx={{
						bgcolor: "#0ba976",
						textTransform: "none",
						fontWeight: 700,
						py: 1.5,
						borderRadius: 2,
						boxShadow: "none",
						"&:hover": { bgcolor: "#059669", boxShadow: "none" },
					}}
				>
					Tutup
				</Button>
			</DialogActions>
		</Dialog>
	);
}
