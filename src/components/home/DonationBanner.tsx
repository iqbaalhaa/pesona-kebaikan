"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const MIDTRANS_BLUE = "#2C7BE5"; // nuansa midtrans-ish

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
				borderRadius: 999,
				display: "grid",
				placeItems: "center",
				bgcolor: "rgba(97,206,112,0.14)",
				border: "1px solid rgba(97,206,112,0.22)",
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
				borderRadius: 999,
				border: "1px solid rgba(15,23,42,0.08)",
				bgcolor: "rgba(255,255,255,0.92)",
				boxShadow: "0 14px 22px rgba(15,23,42,.05)",
			}}
		>
			<IconWrap>{icon}</IconWrap>
			<Box sx={{ minWidth: 0 }}>
				<Typography
					sx={{
						fontSize: 11.5,
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
						fontSize: 10.5,
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
	return (
		<Box sx={{ px: 2.5, mt: 2.5 }}>
			<Box
				sx={{
					borderRadius: { md: 1 },
					p: 1.6,
					border: "1px solid rgba(97,206,112,0.22)",
					background:
						"linear-gradient(135deg, rgba(97,206,112,0.20) 0%, rgba(255,255,255,0.94) 55%, rgba(15,23,42,0.02) 100%)",
					boxShadow: "0 18px 34px rgba(15,23,42,.06)",
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
								color: "rgba(15,23,42,.70)",
							}}
						>
							Donasi mulai
						</Typography>
						<Typography
							sx={{
								fontSize: 18,
								fontWeight: 1100,
								color: "#0f172a",
								lineHeight: 1.1,
							}}
						>
							Rp10.000
						</Typography>
					</Box>

					<Box
						sx={{
							width: 44,
							height: 44,
							borderRadius: 3,
							display: "grid",
							placeItems: "center",
							bgcolor: "rgba(97,206,112,0.18)",
							border: "1px solid rgba(97,206,112,0.26)",
							boxShadow: "0 14px 26px rgba(97,206,112,.10)",
							flexShrink: 0,
						}}
					>
						<ShieldIcon />
					</Box>
				</Box>

				<Box sx={{ mt: 1.25, height: 1, bgcolor: "rgba(15,23,42,0.06)" }} />

				{/* Payment header + powered by */}
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
						sx={{ fontSize: 12, fontWeight: 900, color: "rgba(15,23,42,.78)" }}
					>
						Metode pembayaran
					</Typography>

					<Box
						sx={{
							flexShrink: 0,
							display: "inline-flex",
							alignItems: "center",
							gap: 0.7,
							px: 1,
							py: "4px",
							borderRadius: 999,
							border: "1px solid rgba(44,123,229,0.18)",
							bgcolor: "rgba(44,123,229,0.08)",
						}}
					>
						<Box
							sx={{
								width: 18,
								height: 18,
								borderRadius: 999,
								display: "grid",
								placeItems: "center",
								bgcolor: MIDTRANS_BLUE,
								color: "#fff",
								fontWeight: 1000,
								fontSize: 11,
								lineHeight: 1,
							}}
						>
							M
						</Box>
						<Typography
							sx={{
								fontSize: 10.5,
								fontWeight: 900,
								color: "rgba(15,23,42,.65)",
							}}
						>
							Powered by Midtrans
						</Typography>
					</Box>
				</Box>

				{/* Chips */}
				<Box
					sx={{
						mt: 1,
						display: "flex",
						gap: 1,
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

				<Typography sx={{ mt: 1, fontSize: 11, color: "rgba(15,23,42,.55)" }}>
					Metode bisa berbeda tergantung campaign & ketersediaan gateway.
				</Typography>
			</Box>
		</Box>
	);
}
