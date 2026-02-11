"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const MIDTRANS_BLUE = "#2C7BE5";

function Svg({ children }: { children: React.ReactNode }) {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ color: "rgba(15,23,42,.80)" }}
		>
			{children}
		</svg>
	);
}

function BankIcon() {
	return (
		<Svg>
			<path d="M3 10h18" />
			<path d="M4 10V8l8-4 8 4v2" />
			<path d="M5 10v9" />
			<path d="M9 10v9" />
			<path d="M15 10v9" />
			<path d="M19 10v9" />
			<path d="M4 19h16" />
		</Svg>
	);
}

function WalletIcon() {
	return (
		<Svg>
			<path d="M3 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
			<path d="M3 10h18" />
			<path d="M17 14h.01" />
		</Svg>
	);
}

function ReceiptIcon() {
	return (
		<Svg>
			<path d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1V2Z" />
			<path d="M9 7h6" />
			<path d="M9 11h6" />
			<path d="M9 15h4" />
		</Svg>
	);
}

function CardIcon() {
	return (
		<Svg>
			<rect x="3" y="5" width="18" height="14" rx="2" />
			<path d="M3 10h18" />
			<path d="M7 15h4" />
		</Svg>
	);
}

function ShieldIcon() {
	return (
		<Svg>
			<path d="M12 2 20 6v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z" />
			<path d="M9 12l2 2 4-5" />
		</Svg>
	);
}

function IconWrap({ children }: { children: React.ReactNode }) {
	return (
		<Box
			sx={{
				width: 28,
				height: 28,
				borderRadius: 0,
				display: "grid",
				placeItems: "center",
				bgcolor: "transparent",
				border: "none",
				flexShrink: 0,
			}}
		>
			{children}
		</Box>
	);
}

function PayChip({
	label,
	sub,
	icon,
}: {
	label: string;
	sub: string;
	icon: React.ReactNode;
}) {
	return (
		<Box
			sx={{
				minWidth: 0,
				flexShrink: 0,
				display: "flex",
				alignItems: "center",
				gap: 0.8,
				px: 1.1,
				py: 0.85,
				borderRadius: 0,
				border: "none",
				bgcolor: "transparent",
				boxShadow: "none",
			}}
		>
			<IconWrap>{icon}</IconWrap>
			<Box sx={{ minWidth: 0 }}>
				<Typography
					sx={{
						fontSize: 12,
						fontWeight: 1000,
						color: "rgba(15,23,42,.80)",
						lineHeight: 1.05,
					}}
				>
					{label}
				</Typography>
				<Typography
					sx={{
						mt: 0.25,
						fontSize: 11,
						fontWeight: 800,
						color: "rgba(15,23,42,.48)",
						whiteSpace: "nowrap",
					}}
				>
					{sub}
				</Typography>
			</Box>
		</Box>
	);
}

export default function DonationBanner() {
	const MIN_DONATION = Number(process.env.NEXT_PUBLIC_MIN_DONATION ?? 1);
	return (
		<Box sx={{ px: 2, mt: 2.5 }}>
			<Box
				sx={{
					borderRadius: 0,
					p: 2,
					border: "none",
					background: "transparent",
					boxShadow: "none",
				}}
			>
				{/* Top row */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 1,
					}}
				>
					<Box>
						<Typography
							sx={{
								fontSize: 13,
								fontWeight: 900,
								color: "rgba(15,23,42,.65)",
							}}
						>
							Minimum Donasi
						</Typography>
						<Typography
							sx={{
								fontSize: 20,
								fontWeight: 1000,
								color: "#0f172a",
								lineHeight: 1.1,
							}}
						>
							Rp{MIN_DONATION.toLocaleString("id-ID")}
						</Typography>
					</Box>

					<Box
						sx={{
							width: 40,
							height: 40,
							borderRadius: 0,
							display: "grid",
							placeItems: "center",
							bgcolor: "transparent",
							border: "none",
							boxShadow: "none",
							flexShrink: 0,
						}}
					>
						<ShieldIcon />
					</Box>
				</Box>

				<Box sx={{ mt: 1.25, height: 1, bgcolor: "rgba(15,23,42,0.06)" }} />

				{/* Payment header  */}
				<Box
					sx={{
						mt: 1.25,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 1,
					}}
				>
					<Typography
						sx={{
							fontSize: 13,
							fontWeight: 900,
							color: "rgba(15,23,42,.75)",
						}}
					>
						Metode Pembayaran Tersedia
					</Typography>
				</Box>

				{/* Chips */}
				<Box
					sx={{
						mt: 1,
						display: "flex",
						gap: 0.9,
						overflowX: "auto",
						pb: 0.5,
						WebkitOverflowScrolling: "touch",
						"&::-webkit-scrollbar": { height: 0 },
					}}
				>
					<PayChip
						label="E-Wallet"
						sub="GoPay • OVO • DANA • ShopeePay"
						icon={<WalletIcon />}
					/>
					<PayChip
						label="Virtual Account"
						sub="BCA • BRI • BNI • Mandiri"
						icon={<ReceiptIcon />}
					/>
					<PayChip
						label="Bank Transfer"
						sub="Transfer antar bank"
						icon={<BankIcon />}
					/>
					<PayChip label="Kartu" sub="Visa • Mastercard" icon={<CardIcon />} />
				</Box>
			</Box>
		</Box>
	);
}
