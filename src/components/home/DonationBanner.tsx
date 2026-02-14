"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SecurityIcon from "@mui/icons-material/Security";

const PRIMARY = "#0ba976";

function PayChip({
	label,
	icon: Icon,
}: {
	label: string;
	icon: React.ElementType;
}) {
	return (
		<Paper
			variant="outlined"
			sx={{
				minWidth: 140,
				flexShrink: 0,
				display: "flex",
				alignItems: "center",
				gap: 1.5,
				p: 1.5,
				borderRadius: 3,
				bgcolor: "white",
				borderColor: "rgba(226, 232, 240, 0.8)",
				transition: "all 0.3s ease",
				cursor: "default",
				"&:hover": {
					borderColor: PRIMARY,
					transform: "translateY(-2px)",
					boxShadow: "0 4px 12px rgba(11,169,118,0.08)",
					"& .icon-wrapper": {
						bgcolor: PRIMARY,
						color: "white",
					},
				},
			}}
		>
			<Box
				className="icon-wrapper"
				sx={{
					width: 36,
					height: 36,
					borderRadius: "10px",
					display: "grid",
					placeItems: "center",
					bgcolor: "rgba(11,169,118,0.1)",
					color: PRIMARY,
					flexShrink: 0,
					transition: "all 0.3s ease",
				}}
			>
				<Icon sx={{ fontSize: 18 }} />
			</Box>
			<Typography
				sx={{
					fontSize: 13,
					fontWeight: 700,
					color: "#1e293b",
					lineHeight: 1.2,
				}}
			>
				{label}
			</Typography>
		</Paper>
	);
}

export default function DonationBanner() {
	const MIN_DONATION = Number(process.env.NEXT_PUBLIC_MIN_DONATION ?? 1);

	return (
		<Box sx={{ px: 2, mt: 3 }}>
			<Box
				sx={{
					p: 3,
					bgcolor: "white",
					boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
					border: "1px solid rgba(241, 245, 249, 1)",
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Decorative Background Blob */}
				<Box
					sx={{
						position: "absolute",
						top: -20,
						right: -20,
						width: 100,
						height: 100,
						borderRadius: "50%",
						bgcolor: "rgba(11,169,118,0.03)",
						zIndex: 0,
					}}
				/>

				{/* Top row: Minimum Donation */}
				<Box
					sx={{
						display: "flex",
						alignItems: "flex-start",
						justifyContent: "space-between",
						gap: 2,
						position: "relative",
						zIndex: 1,
					}}
				>
					<Box>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
							<SecurityIcon sx={{ fontSize: 16, color: PRIMARY }} />
							<Typography
								sx={{
									fontSize: 12,
									fontWeight: 700,
									color: PRIMARY,
									letterSpacing: "0.05em",
									textTransform: "uppercase",
								}}
							>
								Donasi Aman
							</Typography>
						</Box>
						<Typography
							sx={{
								fontSize: 13,
								fontWeight: 600,
								color: "#64748b",
								mb: 0.5,
							}}
						>
							Minimum Donasi Mulai
						</Typography>
						<Typography
							sx={{
								fontSize: 28,
								fontWeight: 800,
								color: "#0f172a",
								lineHeight: 1,
								letterSpacing: "-0.02em",
							}}
						>
							Rp{MIN_DONATION.toLocaleString("id-ID")}
						</Typography>
					</Box>

					<Box
						sx={{
							p: 1.5,
							borderRadius: "16px",
							bgcolor: "rgba(11,169,118,0.06)",
							color: PRIMARY,
							display: { xs: "none", sm: "block" },
						}}
					>
						<SecurityIcon sx={{ fontSize: 32 }} />
					</Box>
				</Box>

				<Box
					sx={{
						my: 3,
						height: "1px",
						bgcolor: "rgba(226, 232, 240, 0.6)",
						width: "100%",
					}}
				/>

				{/* Payment Methods */}
				<Box sx={{ position: "relative", zIndex: 1 }}>
					<Typography
						sx={{
							fontSize: 14,
							fontWeight: 700,
							color: "#1e293b",
							mb: 2,
						}}
					>
						Metode Pembayaran Lengkap
					</Typography>

					<Box
						sx={{
							display: "flex",
							gap: 1.5,
							overflowX: "auto",
							pb: 1,
							mx: -1,
							px: 1,
							WebkitOverflowScrolling: "touch",
							"&::-webkit-scrollbar": { display: "none" },
							scrollbarWidth: "none",
						}}
					>
						<PayChip label="E-Wallet" icon={AccountBalanceWalletIcon} />
						<PayChip label="Virtual Account" icon={ReceiptLongIcon} />
						<PayChip label="Bank Transfer" icon={AccountBalanceIcon} />
						<PayChip label="Kartu Kredit" icon={CreditCardIcon} />
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
