"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import type { Campaign } from "@/types";
import { createDonation } from "@/actions/donation";
import { getQuickDonationCampaignId } from "@/actions/campaign";

const PRIMARY = "#0ba976";
const MIN_DONATION = Number(process.env.NEXT_PUBLIC_MIN_DONATION ?? 1);

const amountPresets = [10000, 25000, 50000, 75000, 100000];

function rupiah(n: number) {
	return new Intl.NumberFormat("id-ID").format(n);
}

function formatIDR(numStr: string) {
	const n = numStr.replace(/\D/g, "");
	if (!n) return "";
	return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
					? "1px solid rgba(11,169,118,0.40)"
					: "1px solid rgba(15,23,42,0.12)",
				bgcolor: checked ? "rgba(11,169,118,0.35)" : "rgba(15,23,42,0.06)",
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
	const router = useRouter();

	const [selectedAmount, setSelectedAmount] = React.useState<number>(
		amountPresets[0],
	);
	const [custom, setCustom] = React.useState<string>("");

	// bottom sheet state
	const [open, setOpen] = React.useState(false);
	const [campaignId, setCampaignId] = React.useState<string>("");

	// donor identity
	const [isAnonymous, setIsAnonymous] = React.useState<boolean>(true);
	const [donorName, setDonorName] = React.useState<string>("");
	const [donorPhone, setDonorPhone] = React.useState<string>("");
	const [message, setMessage] = React.useState<string>("");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState("");
	const [success, setSuccess] = React.useState(false);

	// Fetch quick donation campaign ID on mount
	React.useEffect(() => {
		const fetchId = async () => {
			const id = await getQuickDonationCampaignId();
			if (id) {
				setCampaignId(id);
			}
		};
		fetchId();
	}, []);

	const finalAmount = React.useMemo(() => {
		const clean = custom.replace(/[^\d]/g, "");
		const n = clean ? Number(clean) : 0;
		if (custom.trim().length > 0) return isNaN(n) ? 0 : n;
		return selectedAmount;
	}, [custom, selectedAmount]);

	const isValid = finalAmount >= MIN_DONATION;

	const displayName = React.useMemo(() => {
		if (isAnonymous) return "Anonim";
		const clean = donorName.trim();
		return clean.length ? clean : "Tanpa Nama";
	}, [isAnonymous, donorName]);

	const openSheet = () => {
		if (!isValid) return;
		setOpen(true);
	};

	const handleSubmit = async () => {
		if (!campaignId) {
			setError("Gagal memuat sistem donasi");
			return;
		}

		if (!finalAmount || Number(finalAmount) < MIN_DONATION) {
			setError(`Minimal donasi Rp ${MIN_DONATION.toLocaleString("id-ID")}`);
			return;
		}
		// Wajib nomor HP
		if (!donorPhone) {
			setError("Nomor HP wajib diisi");
			return;
		}
		// Nama wajib jika tidak anonim
		if (!isAnonymous && !donorName) {
			setError("Nama donatur wajib diisi");
			return;
		}

		setLoading(true);
		setError("");
		try {
			const res = await createDonation({
				campaignId: campaignId,
				amount: Number(finalAmount),
				donorName: isAnonymous ? "Hamba Allah" : donorName || "Tanpa Nama",
				donorPhone,
				message,
				isAnonymous,
				paymentMethod: "EWALLET" as any,
			});

			if (res.success) {
				const donationId = (res as any).data?.id;
				const slug = "donasi-cepat"; // Fixed slug for quick donation

				if ((window as any).snap?.show) {
					(window as any).snap.show();
				}
				const r = await fetch("/api/midtrans/snap-token", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ donationId }),
				});
				const j = await r.json();
				if (j.success && j.token && (window as any).snap) {
					const isProd =
						process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
					(window as any).snap.pay(j.token, {
						language: "id",
						...(isProd ? { uiMode: "qr" } : {}),
						onSuccess: () => {
							setSuccess(true);
							setOpen(false);
						},
						onPending: () => {
							setSuccess(true);
							setOpen(false);
						},
						onError: () => {
							setError("Pembayaran gagal");
						},
						onClose: () => {
							setError("Pembayaran belum selesai");
						},
					});
				} else {
					if ((window as any).snap?.hide) {
						(window as any).snap.hide();
					}
					setError(j.error || "Gagal memulai pembayaran");
				}
			} else {
				setError(res.error || "Gagal membuat donasi");
			}
		} catch (err) {
			if ((window as any).snap?.hide) {
				(window as any).snap.hide();
			}
			setError("Terjadi kesalahan sistem");
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<Box
				sx={{
					px: 0,
					mt: 2,
					position: "relative",
				}}
			>
				<Box
					sx={{
						borderRadius: 0,
						bgcolor: "#fff",
						boxShadow: "none",
						p: 3,
						position: "relative",
						overflow: "hidden",
						textAlign: "center",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 2,
					}}
				>
					<Box
						sx={{
							width: 60,
							height: 60,
							borderRadius: "50%",
							bgcolor: "rgba(11,169,118,0.1)",
							color: PRIMARY,
							display: "grid",
							placeItems: "center",
						}}
					>
						<CheckIcon />
					</Box>
					<Box>
						<Typography sx={{ fontSize: 16, fontWeight: 900, mb: 0.5 }}>
							Terima Kasih!
						</Typography>
						<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
							Donasi Anda telah kami terima. Semoga menjadi amal jariyah yang
							tak terputus pahalanya.
						</Typography>
					</Box>
					<Button
						variant="outlined"
						onClick={() => {
							setSuccess(false);
							setCustom("");
							setSelectedAmount(amountPresets[0]);
							setDonorName("");
							setDonorPhone("");
							setMessage("");
							setIsAnonymous(true);
						}}
						sx={{
							borderRadius: "12px",
							textTransform: "none",
							fontWeight: 700,
							borderColor: PRIMARY,
							color: PRIMARY,
							"&:hover": {
								borderColor: PRIMARY,
								bgcolor: "rgba(11,169,118,0.05)",
							},
						}}
					>
						Donasi Lagi
					</Button>
				</Box>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				px: 0,
				mt: 2,
				position: "relative",
			}}
		>
			<Script
				src={
					process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
						? "https://app.midtrans.com/snap/snap.js"
						: "https://app.sandbox.midtrans.com/snap/snap.js"
				}
				data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
				strategy="afterInteractive"
			/>
			<Box
				sx={{
					borderRadius: 0,
					bgcolor: "#fff",
					boxShadow: "none",
					p: 2,
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
						bgcolor: "rgba(11,169,118,0.14)",
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
								fontWeight: 900,
								color: "#0f172a",
								lineHeight: 1.15,
							}}
						>
							Donasi Cepat
						</Typography>
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
							display: "grid",
							gridTemplateColumns: "repeat(3, 1fr)",
							gap: 1,
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
										width: "100%",
										borderRadius: "12px",
										px: 1,
										py: 0.85,
										cursor: "pointer",
										fontWeight: 1100,
										fontSize: 12.5,
										border: active
											? "1px solid rgba(11,169,118,0.45)"
											: "1px solid rgba(15,23,42,0.10)",
										bgcolor: active
											? "rgba(11,169,118,0.12)"
											: "rgba(255,255,255,0.92)",
										color: "rgba(15,23,42,.82)",
										boxShadow: "none",
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
								gridColumn: "span 1",
								display: "flex",
								alignItems: "center",
								gap: 0.5,
								borderRadius: "12px",
								px: 1.2,
								py: 0.55,
								border:
									custom.trim().length > 0
										? "1px solid rgba(11,169,118,0.45)"
										: "1px solid rgba(15,23,42,0.10)",
								bgcolor: "rgba(255,255,255,0.92)",
								boxShadow: "none",
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
								onChange={(e) => setCustom(formatIDR(e.target.value))}
								style={{
									width: "100%",
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
							Minimal donasi Rp{MIN_DONATION.toLocaleString("id-ID")}
						</Typography>
					)}
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
							borderRadius: "16px",
							py: 1.2,
							border: "1px solid rgba(11,169,118,0.35)",
							bgcolor: isValid ? PRIMARY : "rgba(15,23,42,0.08)",
							color: isValid ? "#0b1220" : "rgba(15,23,42,.40)",
							fontWeight: 900,
							fontSize: 13.5,
							cursor: isValid ? "pointer" : "not-allowed",
							boxShadow: "none",
							transition: "transform 120ms ease, filter 120ms ease",
							"&:active": { transform: isValid ? "scale(0.99)" : "none" },
						}}
					>
						Donasi Sekarang • Rp{rupiah(finalAmount || 0)}
					</Box>
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
							borderTopLeftRadius: { xs: "16px", md: "16px" },
							borderTopRightRadius: { xs: "16px", md: "16px" },
							borderRadius: { md: "16px" },
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
							{/* Summary Nominal */}
							<Box
								sx={{
									borderRadius: "12px",
									border: "1px solid rgba(15,23,42,0.10)",
									bgcolor: "#f8fafc",
									p: 1.5,
									mb: 3,
								}}
							>
								<Box
									sx={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<Typography
										sx={{
											fontSize: 12,
											fontWeight: 900,
											color: "rgba(15,23,42,.60)",
										}}
									>
										Nominal Donasi
									</Typography>
									<Typography
										sx={{ fontSize: 14, fontWeight: 1100, color: "#0f172a" }}
									>
										Rp{rupiah(finalAmount)}
									</Typography>
								</Box>
							</Box>

							{/* Identity */}
							<Box sx={{ mb: 3 }}>
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 1000,
										color: "rgba(15,23,42,.80)",
										mb: 1,
									}}
								>
									Identitas Donatur
								</Typography>

								<Box
									sx={{
										borderRadius: "12px",
										border: "1px solid rgba(15,23,42,0.10)",
										bgcolor: "#fff",
										p: 1.5,
									}}
								>
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											mb: 2,
										}}
									>
										<Box>
											<Typography
												sx={{
													fontSize: 12.5,
													fontWeight: 1100,
													color: "rgba(15,23,42,.85)",
												}}
											>
												Sembunyikan nama (Hamba Allah)
											</Typography>
										</Box>
										<Toggle
											checked={isAnonymous}
											onChange={(v) => {
												setIsAnonymous(v);
												if (v) {
													setDonorName("");
												}
											}}
										/>
									</Box>

									{!isAnonymous && (
										<TextField
											fullWidth
											placeholder="Nama Lengkap"
											value={donorName}
											onChange={(e) => setDonorName(e.target.value)}
											sx={{
												mb: 2,
												"& .MuiOutlinedInput-root": {
													borderRadius: "10px",
													fontSize: "13px",
												},
											}}
											size="small"
										/>
									)}

									<TextField
										fullWidth
										placeholder="Nomor WhatsApp / HP"
										value={donorPhone}
										onChange={(e) => setDonorPhone(e.target.value)}
										type="tel"
										sx={{
											"& .MuiOutlinedInput-root": {
												borderRadius: "10px",
												fontSize: "13px",
											},
										}}
										size="small"
									/>
								</Box>
							</Box>

							{/* Message removed as requested */}

							{/* Payment Method removed as requested */}
						</Box>

						{/* Footer actions */}
						<Box sx={{ px: 2.2, pb: 2, display: "grid", gap: 1 }}>
							<Button
								variant="contained"
								fullWidth
								size="large"
								onClick={handleSubmit}
								disabled={loading}
								sx={{
									borderRadius: 3,
									py: 1.15,
									bgcolor: PRIMARY,
									color: "#0b1220",
									fontWeight: 1100,
									fontSize: 13,
									boxShadow: "0 16px 28px rgba(11,169,118,.22)",
									"&:hover": { bgcolor: "#4bbf59" },
								}}
							>
								{loading ? (
									<CircularProgress size={24} color="inherit" />
								) : (
									"Lanjut Bayar"
								)}
							</Button>

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
			<Snackbar
				open={!!error}
				autoHideDuration={6000}
				onClose={() => setError("")}
			>
				<Alert
					onClose={() => setError("")}
					severity="error"
					sx={{ width: "100%" }}
				>
					{error}
				</Alert>
			</Snackbar>
		</Box>
	);
}
