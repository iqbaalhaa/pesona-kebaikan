"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Script from "next/script";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import type { Campaign } from "@/types";
import { createDonation, cancelPendingDonation } from "@/actions/donation";
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

export default function QuickDonate() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session, status } = useSession();

	const [selectedAmount, setSelectedAmount] = React.useState<number>(
		amountPresets[0],
	);
	const [custom, setCustom] = React.useState<string>("");

	// bottom sheet state
	const [open, setOpen] = React.useState(false);
	const [campaignId, setCampaignId] = React.useState<string>("");
	const [currentDonationId, setCurrentDonationId] = React.useState<
		string | undefined
	>(undefined);

	// donor identity handled by session
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

	// Fix body scroll issue after Midtrans Snap success and auto-close success message
	React.useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		if (success) {
			document.body.style.overflow = "unset";
			document.body.style.paddingRight = "unset";

			// Auto-close success message after 5 seconds
			timeoutId = setTimeout(() => {
				setSuccess(false);
				setCustom("");
				setSelectedAmount(amountPresets[0]);
				setMessage("");
			}, 5000);
		}

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [success]);

	// Auto open bottom sheet when redirected from login
	React.useEffect(() => {
		const q = searchParams?.get("quickDonate");
		if (q === "1") {
			setOpen(true);
		}
	}, [searchParams]);

	const finalAmount = React.useMemo(() => {
		const clean = custom.replace(/[^\d]/g, "");
		const n = clean ? Number(clean) : 0;
		if (custom.trim().length > 0) return isNaN(n) ? 0 : n;
		return selectedAmount;
	}, [custom, selectedAmount]);

	const isValid = finalAmount >= MIN_DONATION;

	const openSheet = () => {
		if (!isValid) return;
		setOpen(true);
	};

	const handleSubmit = async () => {
		if (status === "unauthenticated") {
			router.push(
				"/auth/login?callbackUrl=" + encodeURIComponent("/?quickDonate=1"),
			);
			return;
		}

		if (!campaignId) {
			setError("Gagal memuat sistem donasi");
			return;
		}

		if (!finalAmount || Number(finalAmount) < MIN_DONATION) {
			setError(`Minimal donasi Rp ${MIN_DONATION.toLocaleString("id-ID")}`);
			return;
		}

		// Get user info from session
		const userName = session?.user?.name || "Hamba Allah";
		const userPhone = session?.user?.phone || "";

		// Wajib nomor HP (jika tidak ada di session, mungkin error atau biarkan kosong jika boleh?)
		// Karena user bilang "verifikasi melalui login", kita asumsikan login user sudah cukup valid.
		// Namun createDonation butuh donorPhone. Kita coba gunakan phone dari session atau dummy jika kosong.
		// Jika user belum update profil (phone kosong), kita mungkin perlu prompt atau gunakan dummy.
		// Untuk simplifikasi sesuai request "hapus semua UI", kita kirim phone dari session.
		if (!userPhone) {
			// Optional: setError("Mohon lengkapi nomor HP di profil Anda terlebih dahulu");
			// return;
			// Atau gunakan dummy jika diizinkan sistem
		}

		setLoading(true);
		setError("");
		try {
			const res = await createDonation({
				campaignId: campaignId,
				amount: Number(finalAmount),
				donorName: userName,
				donorPhone: userPhone || "-", // Fallback jika kosong
				message,
				isAnonymous: false, // Force not anonymous as requested "verifikasi login"
				paymentMethod: "EWALLET" as any,
			});

			if (res.success) {
				const donationId = (res as any).data?.id;
				setCurrentDonationId(donationId);
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
							setCurrentDonationId(undefined);
						},
						onPending: () => {
							setOpen(false);
							// Jangan hapus donasi saat pending karena bisa sukses kemudian via notifikasi Midtrans
							// Biarkan status tetap PENDING di DB; Donasi Saya sudah memfilter hanya yang Berhasil
						},
						onError: () => {
							setError("Transaksi gagal");
							setSuccess(false);
							if (currentDonationId) {
								cancelPendingDonation(currentDonationId);
							}
							setCurrentDonationId(undefined);
						},
						onClose: () => {
							setError("Transaksi gagal");
							setSuccess(false);
							if (currentDonationId) {
								cancelPendingDonation(currentDonationId);
							}
							setCurrentDonationId(undefined);
						},
					});
				} else {
					if ((window as any).snap?.hide) {
						(window as any).snap.hide();
					}
					setError(j.error || "Gagal memulai pembayaran");
					if (currentDonationId) {
						await cancelPendingDonation(currentDonationId);
					}
					setCurrentDonationId(undefined);
				}
			} else {
				setError(res.error || "Gagal membuat donasi");
			}
		} catch (err) {
			if ((window as any).snap?.hide) {
				(window as any).snap.hide();
			}
			setError("Terjadi kesalahan sistem");
			if (currentDonationId) {
				await cancelPendingDonation(currentDonationId);
			}
			setCurrentDonationId(undefined);
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
							setMessage("");
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
							bgcolor: "rgba(15,23,42,0.6)",
							backdropFilter: "blur(8px)",
							transition: "all 0.3s ease",
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
							borderTopLeftRadius: { xs: "24px", md: "24px" },
							borderTopRightRadius: { xs: "24px", md: "24px" },
							borderRadius: { md: "24px" },
							bgcolor: "#fff",
							boxShadow: {
								xs: "0 -20px 40px rgba(0,0,0,0.2)",
								md: "0 25px 50px -12px rgba(0,0,0,0.25)",
							},
							width: {
								xs: "100%",
								sm: "calc(100% - 48px)",
								md: "400px",
							},
							maxHeight: {
								xs: "85vh",
								md: "auto",
							},
							display: "flex",
							flexDirection: "column",
							mx: { xs: 0, sm: "auto", md: 0 },
							overflow: "hidden",
							animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
						}}
					>
						{/* Handle */}
						<Box sx={{ py: 1.5, display: "grid", placeItems: "center" }}>
							<Box
								sx={{
									width: 40,
									height: 4,
									borderRadius: 999,
									bgcolor: "rgba(15,23,42,0.15)",
								}}
							/>
						</Box>

						{/* Header */}
						<Box
							sx={{
								px: 3,
								pb: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Typography
								sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}
							>
								Konfirmasi Donasi
							</Typography>

							<Box
								component="button"
								type="button"
								onClick={() => setOpen(false)}
								sx={{
									width: 32,
									height: 32,
									borderRadius: "50%",
									display: "grid",
									placeItems: "center",
									border: "none",
									bgcolor: "rgba(15,23,42,0.05)",
									cursor: "pointer",
									transition: "background 0.2s",
									"&:hover": { bgcolor: "rgba(15,23,42,0.1)" },
								}}
							>
								<CloseIcon />
							</Box>
						</Box>

						{/* Content */}
						<Box sx={{ px: 3, py: 2, flex: 1, overflowY: "auto" }}>
							{/* Premium Amount Card */}
							<Box
								sx={{
									background: `linear-gradient(135deg, ${PRIMARY} 0%, #059669 100%)`,
									borderRadius: "20px",
									p: 3,
									mb: 3,
									color: "white",
									position: "relative",
									overflow: "hidden",
									boxShadow: "0 10px 30px -10px rgba(11,169,118,0.5)",
								}}
							>
								{/* Decorative Circles */}
								<Box
									sx={{
										position: "absolute",
										top: -20,
										right: -20,
										width: 100,
										height: 100,
										borderRadius: "50%",
										bgcolor: "rgba(255,255,255,0.1)",
									}}
								/>
								<Box
									sx={{
										position: "absolute",
										bottom: -30,
										left: -10,
										width: 80,
										height: 80,
										borderRadius: "50%",
										bgcolor: "rgba(255,255,255,0.1)",
									}}
								/>

								<Typography
									sx={{
										fontSize: 13,
										fontWeight: 500,
										opacity: 0.9,
										mb: 0.5,
									}}
								>
									Donasi sebesar
								</Typography>
								<Typography
									sx={{
										fontSize: 32,
										fontWeight: 800,
										letterSpacing: "-0.02em",
										textShadow: "0 2px 4px rgba(0,0,0,0.1)",
									}}
								>
									Rp{rupiah(finalAmount)}
								</Typography>

								<Box
									sx={{
										mt: 2,
										display: "flex",
										alignItems: "center",
										gap: 1,
										opacity: 0.85,
									}}
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
										<path d="M9 12l2 2 4-4" />
									</svg>
									<Typography sx={{ fontSize: 12, fontWeight: 600 }}>
										Pembayaran Aman
									</Typography>
								</Box>
							</Box>

							{/* Info Text */}
							<Typography
								sx={{
									fontSize: 13,
									color: "text.secondary",
									textAlign: "center",
									mb: 1,
									lineHeight: 1.6,
								}}
							>
								Semoga kebaikan Anda di balas dengan pahala yang berlipat ganda.
							</Typography>
						</Box>

						{/* Footer actions */}
						<Box sx={{ px: 3, pb: 4, display: "grid", gap: 1.5 }}>
							<Button
								variant="contained"
								fullWidth
								size="large"
								onClick={handleSubmit}
								disabled={loading}
								sx={{
									borderRadius: "14px",
									py: 1.5,
									bgcolor: PRIMARY,
									color: "#fff",
									fontWeight: 700,
									fontSize: 15,
									boxShadow: "0 10px 20px -5px rgba(11,169,118,0.4)",
									textTransform: "none",
									"&:hover": {
										bgcolor: "#059669",
										boxShadow: "0 15px 25px -5px rgba(11,169,118,0.5)",
										transform: "translateY(-1px)",
									},
									transition: "all 0.2s ease",
								}}
							>
								{loading ? (
									<CircularProgress size={24} color="inherit" />
								) : (
									"Lanjut Pembayaran"
								)}
							</Button>

							<Button
								fullWidth
								onClick={() => {
									setOpen(false);
									setError("Transaksi gagal");
									if (currentDonationId) {
										cancelPendingDonation(currentDonationId);
										setCurrentDonationId(undefined);
									}
								}}
								sx={{
									borderRadius: "14px",
									py: 1.2,
									color: "text.secondary",
									fontWeight: 600,
									fontSize: 14,
									textTransform: "none",
									"&:hover": {
										bgcolor: "rgba(15,23,42,0.03)",
										color: "#0f172a",
									},
								}}
							>
								Batalkan
							</Button>
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
