"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const PRIMARY = "#61ce70";

type Method = "ewallet" | "va" | "bank" | "card";

type Campaign = {
	id: string;
	title: string;
	organizer: string;
};

const campaigns: Campaign[] = [
	{
		id: "c1",
		title: "DARURAT! Bantu Korban Banjir Sumut, Aceh & Sumbar",
		organizer: "Rumah Zakat",
	},
	{
		id: "c2",
		title: "Bantu Operasi Darurat untuk Pasien Tidak Mampu",
		organizer: "Yayasan Harapan",
	},
	{
		id: "c3",
		title: "Beasiswa Anak Desa untuk Tetap Sekolah",
		organizer: "Relawan Pesona",
	},
];

const amountPresets = [10000, 25000, 50000, 100000];

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

function methodLabel(m: Method) {
	switch (m) {
		case "ewallet":
			return "E-Wallet";
		case "va":
			return "Virtual Account";
		case "bank":
			return "Transfer Bank";
		case "card":
			return "Kartu";
	}
}

function methodSub(m: Method) {
	switch (m) {
		case "ewallet":
			return "GoPay • OVO • DANA • ShopeePay";
		case "va":
			return "BCA • BRI • BNI • Mandiri";
		case "bank":
			return "Transfer antar bank";
		case "card":
			return "Visa • Mastercard";
	}
}

function CloseIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ color: "rgba(15,23,42,.65)" }}
		>
			<path d="M18 6 6 18" />
			<path d="M6 6l12 12" />
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="3"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ display: "block" }}
		>
			<path d="M20 6 9 17l-5-5" />
		</svg>
	);
}

function MethodChip({
	active,
	label,
	sub,
	onClick,
}: {
	active: boolean;
	label: string;
	sub: string;
	onClick: () => void;
}) {
	return (
		<Box
			component="button"
			type="button"
			onClick={onClick}
			sx={{
				textAlign: "left",
				width: "100%",
				borderRadius: "12px",
				p: 1.1,
				cursor: "pointer",
				border: active
					? "1px solid rgba(97,206,112,0.45)"
					: "1px solid rgba(15,23,42,0.10)",
				bgcolor: active ? "rgba(97,206,112,0.10)" : "rgba(15,23,42,0.02)",
				boxShadow: active ? "0 16px 28px rgba(97,206,112,.10)" : "none",
				transition: "transform 120ms ease, background-color 120ms ease",
				"&:active": { transform: "scale(0.995)" },
			}}
		>
			<Typography
				sx={{
					fontSize: 12,
					fontWeight: 1100,
					color: "rgba(15,23,42,.85)",
					lineHeight: 1.1,
				}}
			>
				{label}
			</Typography>
			<Typography
				sx={{
					mt: 0.4,
					fontSize: 10.5,
					fontWeight: 800,
					color: "rgba(15,23,42,.50)",
				}}
			>
				{sub}
			</Typography>
		</Box>
	);
}

function Toggle({
	checked,
	onChange,
}: {
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<Box
			component="button"
			type="button"
			onClick={() => onChange(!checked)}
			sx={{
				width: 46,
				height: 28,
				borderRadius: 999,
				border: checked
					? "1px solid rgba(97,206,112,0.40)"
					: "1px solid rgba(15,23,42,0.12)",
				bgcolor: checked ? "rgba(97,206,112,0.35)" : "rgba(15,23,42,0.06)",
				position: "relative",
				cursor: "pointer",
				transition: "all 140ms ease",
			}}
			aria-pressed={checked}
		>
			<Box
				sx={{
					width: 22,
					height: 22,
					borderRadius: 999,
					bgcolor: "#fff",
					position: "absolute",
					top: 2.5,
					left: checked ? 22 : 3,
					boxShadow: "0 10px 18px rgba(15,23,42,.18)",
					transition: "left 140ms ease",
					display: "grid",
					placeItems: "center",
					color: checked ? "rgba(15,23,42,.70)" : "rgba(15,23,42,.35)",
				}}
			>
				{checked ? <CheckIcon /> : null}
			</Box>
		</Box>
	);
}

export default function QuickDonate() {
	const [selectedAmount, setSelectedAmount] = React.useState<number>(
		amountPresets[0]
	);
	const [custom, setCustom] = React.useState<string>("");
	const [method, setMethod] = React.useState<Method>("ewallet");

	// bottom sheet state
	const [open, setOpen] = React.useState(false);
	const [campaignId, setCampaignId] = React.useState<string>(
		campaigns[0]?.id ?? ""
	);

	// donor identity
	const [isAnonymous, setIsAnonymous] = React.useState<boolean>(true);
	const [donorName, setDonorName] = React.useState<string>("");

	const selectedCampaign = React.useMemo(
		() => campaigns.find((c) => c.id === campaignId) ?? campaigns[0],
		[campaignId]
	);

	const finalAmount = React.useMemo(() => {
		const clean = custom.replace(/[^\d]/g, "");
		const n = clean ? Number(clean) : 0;
		if (custom.trim().length > 0) return isNaN(n) ? 0 : n;
		return selectedAmount;
	}, [custom, selectedAmount]);

	const isValid = finalAmount >= 10000;

	const displayName = React.useMemo(() => {
		if (isAnonymous) return "Anonim";
		const clean = donorName.trim();
		return clean.length ? clean : "Tanpa Nama";
	}, [isAnonymous, donorName]);

	const openSheet = () => {
		if (!isValid) return;
		setOpen(true);
	};

	const onPay = () => {
		if (!isValid) return;

		// nanti: route checkout / midtrans snap + include campaign_id + amount + method + donor_name + is_anonymous
		alert(
			`Checkout:\n- Campaign: ${selectedCampaign?.title}\n- Nominal: Rp${rupiah(
				finalAmount
			)}\n- Metode: ${methodLabel(method)}\n- Nama: ${displayName}`
		);
	};

	return (
		<Box sx={{ px: 2.5, mt: 2.5 }}>
			{/* Card */}
			<Box
				sx={{
					borderRadius: { md: 1 },
					p: 1.6,
					border: "1px solid rgba(15,23,42,0.08)",
					background:
						"linear-gradient(135deg, rgba(97,206,112,0.16) 0%, rgba(255,255,255,0.96) 55%, rgba(15,23,42,0.02) 100%)",
					boxShadow: "0 18px 34px rgba(15,23,42,.06)",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<Box
					sx={{
						position: "absolute",
						right: -40,
						bottom: -40,
						width: 160,
						height: 160,
						borderRadius: 999,
						bgcolor: "rgba(97,206,112,0.14)",
						pointerEvents: "none",
					}}
				/>

				{/* Header */}
				<Box
					sx={{
						position: "relative",
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 1,
					}}
				>
					<Box>
						<Typography
							sx={{
								fontSize: 14.5,
								fontWeight: 1100,
								color: "#0f172a",
								lineHeight: 1.15,
							}}
						>
							Donasi Cepat
						</Typography>
						<Typography
							sx={{ mt: 0.35, fontSize: 11.5, color: "rgba(15,23,42,.60)" }}
						>
							Pilih nominal, langsung bayar. Minimal Rp10.000.
						</Typography>
					</Box>

					<Box
						sx={{
							fontSize: 10.5,
							fontWeight: 1000,
							px: 1,
							py: "4px",
							borderRadius: "8px",
							color: PRIMARY,
							bgcolor: "rgba(97,206,112,0.10)",
							border: "1px solid rgba(97,206,112,0.22)",
							flexShrink: 0,
						}}
					>
						via Midtrans
					</Box>
				</Box>

				{/* Amount */}
				<Box sx={{ position: "relative", mt: 1.4 }}>
					<Typography
						sx={{ fontSize: 12, fontWeight: 1000, color: "rgba(15,23,42,.80)" }}
					>
						Nominal
					</Typography>

					<Box
						sx={{
							mt: 1,
							display: "flex",
							gap: 1,
							overflowX: "auto",
							pb: 0.5,
							"&::-webkit-scrollbar": { height: 0 },
						}}
					>
						{amountPresets.map((a) => {
							const active = custom.trim().length === 0 && selectedAmount === a;
							return (
								<Box
									key={a}
									component="button"
									type="button"
									onClick={() => {
										setCustom("");
										setSelectedAmount(a);
									}}
									sx={{
										flexShrink: 0,
										borderRadius: "12px",
										px: 1.5,
										py: 0.85,
										cursor: "pointer",
										fontWeight: 1100,
										fontSize: 12.5,
										border: active
											? "1px solid rgba(97,206,112,0.45)"
											: "1px solid rgba(15,23,42,0.10)",
										bgcolor: active
											? "rgba(97,206,112,0.12)"
											: "rgba(255,255,255,0.92)",
										color: "rgba(15,23,42,.82)",
										boxShadow: active
											? "0 16px 28px rgba(97,206,112,.10)"
											: "0 14px 22px rgba(15,23,42,.05)",
										"&:active": { transform: "scale(0.99)" },
									}}
								>
									Rp{rupiah(a)}
								</Box>
							);
						})}

						{/* Custom */}
						<Box
							sx={{
								flexShrink: 0,
								display: "flex",
								alignItems: "center",
								gap: 0.8,
								borderRadius: "12px",
								px: 1.2,
								py: 0.55,
								border:
									custom.trim().length > 0
										? "1px solid rgba(97,206,112,0.45)"
										: "1px solid rgba(15,23,42,0.10)",
								bgcolor: "rgba(255,255,255,0.92)",
								boxShadow: "0 14px 22px rgba(15,23,42,.05)",
							}}
						>
							<Typography
								sx={{
									fontSize: 12,
									fontWeight: 1000,
									color: "rgba(15,23,42,.55)",
								}}
							>
								Rp
							</Typography>
							<Box
								component="input"
								inputMode="numeric"
								placeholder="Custom"
								value={custom}
								onChange={(e) => setCustom(e.target.value)}
								style={{
									width: 86,
									outline: "none",
									border: "none",
									background: "transparent",
									fontWeight: 1100,
									fontSize: 12.5,
									color: "rgba(15,23,42,.82)",
								}}
							/>
						</Box>
					</Box>

					{!isValid && (
						<Typography
							sx={{
								mt: 0.75,
								fontSize: 11,
								color: "rgba(239,68,68,.90)",
								fontWeight: 900,
							}}
						>
							Minimal donasi Rp10.000
						</Typography>
					)}
				</Box>

				{/* Methods */}
				<Box sx={{ position: "relative", mt: 1.4 }}>
					<Typography
						sx={{ fontSize: 12, fontWeight: 1000, color: "rgba(15,23,42,.80)" }}
					>
						Metode
					</Typography>

					<Box
						sx={{
							mt: 1,
							display: "grid",
							gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
							gap: 1,
						}}
					>
						<MethodChip
							active={method === "ewallet"}
							label="E-Wallet"
							sub={methodSub("ewallet")}
							onClick={() => setMethod("ewallet")}
						/>
						<MethodChip
							active={method === "va"}
							label="Virtual Account"
							sub={methodSub("va")}
							onClick={() => setMethod("va")}
						/>
						<MethodChip
							active={method === "bank"}
							label="Transfer Bank"
							sub={methodSub("bank")}
							onClick={() => setMethod("bank")}
						/>
						<MethodChip
							active={method === "card"}
							label="Kartu"
							sub={methodSub("card")}
							onClick={() => setMethod("card")}
						/>
					</Box>
				</Box>

				{/* CTA */}
				<Box sx={{ position: "relative", mt: 1.5 }}>
					<Box
						component="button"
						type="button"
						onClick={openSheet}
						disabled={!isValid}
						sx={{
							width: "100%",
							borderRadius: 3,
							py: 1.2,
							border: "1px solid rgba(97,206,112,0.35)",
							bgcolor: isValid ? PRIMARY : "rgba(15,23,42,0.08)",
							color: isValid ? "#0b1220" : "rgba(15,23,42,.40)",
							fontWeight: 1100,
							fontSize: 13.5,
							cursor: isValid ? "pointer" : "not-allowed",
							boxShadow: isValid ? "0 16px 28px rgba(97,206,112,.22)" : "none",
							transition: "transform 120ms ease, filter 120ms ease",
							"&:active": { transform: isValid ? "scale(0.99)" : "none" },
						}}
					>
						Donasi Sekarang • Rp{rupiah(finalAmount || 0)}
					</Box>

					<Typography
						sx={{ mt: 0.85, fontSize: 11, color: "rgba(15,23,42,.55)" }}
					>
						Pilih campaign + identitas di langkah berikutnya.
					</Typography>
				</Box>
			</Box>

			{/* Bottom sheet */}
			{open && (
				<Box sx={{ position: "fixed", inset: 0, zIndex: 2500 }}>
					{/* Backdrop */}
					<Box
						onClick={() => setOpen(false)}
						sx={{
							position: "absolute",
							inset: 0,
							bgcolor: "rgba(15,23,42,0.45)",
							backdropFilter: "blur(2px)",
						}}
					/>

					{/* Sheet */}
					<Box
						sx={{
							position: "fixed",
							left: { xs: 0, md: "50%" },
							right: { xs: 0, md: "auto" },
							bottom: { xs: 0, md: "auto" },
							top: { md: "50%" },
							transform: { md: "translate(-50%, -50%)" },
							borderTopLeftRadius: { xs: 10, md: 10 },
							borderTopRightRadius: { xs: 10, md: 10 },
							borderRadius: { md: 1 },
							bgcolor: "#fff",
							boxShadow: {
								xs: "0 -18px 40px rgba(15,23,42,.22)",
								md: "0 18px 40px rgba(15,23,42,.22)",
							},
							width: {
								xs: "100%",
								sm: "calc(100% - 48px)",
								md: "420px",
							},
							maxHeight: {
								xs: "85vh",
								md: "70vh",
							},
							display: "flex",
							flexDirection: "column",
							mx: { xs: 0, sm: "auto", md: 0 },
							overflow: "hidden",
						}}
					>
						{/* Handle */}
						<Box sx={{ py: 1, display: "grid", placeItems: "center" }}>
							<Box
								sx={{
									width: 48,
									height: 5,
									borderRadius: 999,
									bgcolor: "rgba(15,23,42,0.10)",
								}}
							/>
						</Box>

						{/* Header */}
						<Box
							sx={{
								px: 2.2,
								pb: 1.2,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: 1,
							}}
						>
							<Box>
								<Typography
									sx={{ fontSize: 14.5, fontWeight: 1100, color: "#0f172a" }}
								>
									Konfirmasi Donasi
								</Typography>
								<Typography
									sx={{ mt: 0.35, fontSize: 11.5, color: "rgba(15,23,42,.60)" }}
								>
									Pilih campaign, isi identitas, lalu lanjut bayar.
								</Typography>
							</Box>

							<Box
								component="button"
								type="button"
								onClick={() => setOpen(false)}
								sx={{
									width: 38,
									height: 38,
									borderRadius: 999,
									display: "grid",
									placeItems: "center",
									border: "1px solid rgba(15,23,42,0.10)",
									bgcolor: "rgba(15,23,42,0.02)",
									cursor: "pointer",
									"&:hover": { bgcolor: "rgba(15,23,42,0.04)" },
								}}
							>
								<CloseIcon />
							</Box>
						</Box>

						<Box sx={{ height: 1, bgcolor: "rgba(15,23,42,0.06)" }} />

						{/* Content */}
						<Box sx={{ px: 2.2, py: 1.4, flex: 1, overflowY: "auto" }}>
							{/* Summary */}
							<Box
								sx={{
									borderRadius: 3,
									border: "1px solid rgba(15,23,42,0.10)",
									bgcolor: "#fff",
									p: 1.2,
								}}
							>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										gap: 1,
									}}
								>
									<Typography
										sx={{
											fontSize: 11.5,
											fontWeight: 900,
											color: "rgba(15,23,42,.60)",
										}}
									>
										Nominal
									</Typography>
									<Typography
										sx={{ fontSize: 12.5, fontWeight: 1100, color: "#0f172a" }}
									>
										Rp{rupiah(finalAmount)}
									</Typography>
								</Box>

								<Box
									sx={{
										mt: 0.7,
										display: "flex",
										justifyContent: "space-between",
										gap: 1,
									}}
								>
									<Typography
										sx={{
											fontSize: 11.5,
											fontWeight: 900,
											color: "rgba(15,23,42,.60)",
										}}
									>
										Metode
									</Typography>
									<Typography
										sx={{
											fontSize: 12,
											fontWeight: 1100,
											color: "rgba(15,23,42,.78)",
										}}
									>
										{methodLabel(method)}
									</Typography>
								</Box>

								<Typography
									sx={{ mt: 0.7, fontSize: 11, color: "rgba(15,23,42,.55)" }}
								>
									{methodSub(method)}
								</Typography>

								<Box
									sx={{
										mt: 0.9,
										display: "flex",
										justifyContent: "space-between",
										gap: 1,
									}}
								>
									<Typography
										sx={{
											fontSize: 11.5,
											fontWeight: 900,
											color: "rgba(15,23,42,.60)",
										}}
									>
										Nama tampil
									</Typography>
									<Typography
										sx={{
											fontSize: 12,
											fontWeight: 1100,
											color: "rgba(15,23,42,.78)",
										}}
									>
										{displayName}
									</Typography>
								</Box>
							</Box>

							{/* Identity */}
							<Typography
								sx={{
									mt: 1.4,
									fontSize: 12,
									fontWeight: 1000,
									color: "rgba(15,23,42,.80)",
								}}
							>
								Identitas Donatur
							</Typography>

							<Box
								sx={{
									mt: 1,
									borderRadius: 3,
									border: "1px solid rgba(15,23,42,0.10)",
									bgcolor: "#fff",
									p: 1.2,
								}}
							>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										gap: 1,
									}}
								>
									<Box sx={{ minWidth: 0 }}>
										<Typography
											sx={{
												fontSize: 12.5,
												fontWeight: 1100,
												color: "rgba(15,23,42,.85)",
											}}
										>
											Donasi sebagai Anonim
										</Typography>
										<Typography
											sx={{
												mt: 0.35,
												fontSize: 11,
												color: "rgba(15,23,42,.55)",
											}}
										>
											Nama kamu tidak akan ditampilkan.
										</Typography>
									</Box>
									<Toggle
										checked={isAnonymous}
										onChange={(v) => setIsAnonymous(v)}
									/>
								</Box>

								<Box sx={{ mt: 1.1 }}>
									<Typography
										sx={{
											fontSize: 11.5,
											fontWeight: 900,
											color: "rgba(15,23,42,.60)",
										}}
									>
										Nama (opsional)
									</Typography>
									<Box
										component="input"
										placeholder="Tulis nama kamu"
										value={donorName}
										onChange={(e) => setDonorName(e.target.value)}
										disabled={isAnonymous}
										style={{
											width: "100%",
											marginTop: 8,
											outline: "none",
											border: "1px solid rgba(15,23,42,0.10)",
											borderRadius: 12,
											padding: "10px 12px",
											background: isAnonymous ? "rgba(15,23,42,0.04)" : "#fff",
											fontWeight: 900,
											fontSize: 12.5,
											color: "rgba(15,23,42,.82)",
										}}
									/>
								</Box>
							</Box>

							{/* Campaign list */}
							<Typography
								sx={{
									mt: 1.4,
									fontSize: 12,
									fontWeight: 1000,
									color: "rgba(15,23,42,.80)",
								}}
							>
								Pilih campaign
							</Typography>

							<Box sx={{ mt: 1, display: "grid", gap: 1 }}>
								{campaigns.map((c) => {
									const active = c.id === campaignId;

									return (
										<Box
											key={c.id}
											component="button"
											type="button"
											onClick={() => setCampaignId(c.id)}
											sx={{
												textAlign: "left",
												width: "100%",
												borderRadius: 3,
												p: 1.2,
												cursor: "pointer",
												border: active
													? "1px solid rgba(97,206,112,0.45)"
													: "1px solid rgba(15,23,42,0.10)",
												bgcolor: active
													? "rgba(97,206,112,0.10)"
													: "rgba(255,255,255,0.92)",
												boxShadow: active
													? "0 16px 28px rgba(97,206,112,.10)"
													: "0 14px 22px rgba(15,23,42,.05)",
												transition: "transform 120ms ease",
												"&:active": { transform: "scale(0.995)" },
											}}
										>
											<Typography
												sx={{
													fontSize: 12.5,
													fontWeight: 1100,
													color: "#0f172a",
													lineHeight: 1.2,
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
													overflow: "hidden",
												}}
											>
												{c.title}
											</Typography>
											<Typography
												sx={{
													mt: 0.5,
													fontSize: 11,
													color: "rgba(15,23,42,.60)",
												}}
											>
												{c.organizer}
											</Typography>
										</Box>
									);
								})}
							</Box>

							<Typography
								sx={{ mt: 1.2, fontSize: 11, color: "rgba(15,23,42,.55)" }}
							>
								Dana langsung masuk ke campaign terpilih.
							</Typography>
						</Box>

						{/* Footer actions */}
						<Box sx={{ px: 2.2, pb: 2, display: "grid", gap: 1 }}>
							<Box
								component="button"
								type="button"
								onClick={onPay}
								sx={{
									width: "100%",
									borderRadius: 3,
									py: 1.15,
									border: "1px solid rgba(97,206,112,0.35)",
									bgcolor: PRIMARY,
									color: "#0b1220",
									fontWeight: 1100,
									fontSize: 13,
									cursor: "pointer",
									boxShadow: "0 16px 28px rgba(97,206,112,.22)",
									"&:active": { transform: "scale(0.99)" },
								}}
							>
								Lanjut Bayar
							</Box>

							<Box
								component="button"
								type="button"
								onClick={() => setOpen(false)}
								sx={{
									width: "100%",
									borderRadius: 3,
									py: 1.1,
									border: "1px solid rgba(15,23,42,0.12)",
									bgcolor: "rgba(15,23,42,0.02)",
									color: "rgba(15,23,42,.78)",
									fontWeight: 1000,
									fontSize: 13,
									cursor: "pointer",
								}}
							>
								Nanti dulu
							</Box>
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	);
}
