"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import type { Campaign } from "@/types";
import { createDonation, cancelPendingDonation } from "@/actions/donation";
import { getQuickDonationCampaignId } from "@/actions/campaign-public";

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

function validatePhone(raw: string): string {
	const d = raw.replace(/\D/g, "");
	if (!d) return "Nomor HP wajib diisi";
	if (!/^(0|62|8)/.test(d)) return "Format nomor HP tidak valid (contoh: 08xxxxxxxxxx)";
	if (d.length < 10) return "Nomor HP minimal 10 digit";
	if (d.length > 15) return "Nomor HP terlalu panjang";
	return "";
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
	const [mounted, setMounted] = React.useState(false);
	const [campaignId, setCampaignId] = React.useState<string>("");
	const [currentDonationId, setCurrentDonationId] = React.useState<
		string | undefined
	>(undefined);

	// Donor identity — login is optional, only used to prefill these so a
	// returning donor doesn't have to retype them. Guests fill them in manually.
	const [donorName, setDonorName] = React.useState("");
	const [donorPhone, setDonorPhone] = React.useState("");
	const [fieldErrors, setFieldErrors] = React.useState<{
		name?: string;
		phone?: string;
	}>({});
	const [message, setMessage] = React.useState<string>("");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState("");
	const [success, setSuccess] = React.useState(false);

	React.useEffect(() => {
		if (session?.user) {
			if (session.user.name && !donorName) setDonorName(session.user.name);
			const phone = (session.user as any)?.phone;
			if (phone && !donorPhone) setDonorPhone(phone);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session]);

	// Fetch quick donation campaign ID on mount
	React.useEffect(() => {
		setMounted(true);

		const fetchId = async () => {
			const id = await getQuickDonationCampaignId();
			if (id) {
				setCampaignId(id);
			}
		};
		fetchId();
	}, []);

	React.useEffect(() => {
		if (!mounted || !open) return;

		const previousOverflow = document.body.style.overflow;
		const previousPaddingRight = document.body.style.paddingRight;

		document.body.style.overflow = "hidden";
		document.body.style.paddingRight = "0px";

		return () => {
			document.body.style.overflow = previousOverflow;
			document.body.style.paddingRight = previousPaddingRight;
		};
	}, [mounted, open]);

	// Fix body scroll issue after payment success and auto-close success message
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

	// Show success state when redirected back from DOKU payment
	React.useEffect(() => {
		if (searchParams?.get("donation_success") !== "true") return;

		setSuccess(true);
		setOpen(false);

		// The payment gateway page is the previous history entry (cross-origin);
		// pressing Back should skip it rather than return to a dead session. Replace
		// the current (donation_success) entry with /galang-dana, then push the clean
		// home URL on top — so the visible page is "/", and a Back press lands on
		// /galang-dana instead of the gateway page. Must go through router.replace/push
		// (not raw window.history) so it doesn't race with Next's own popstate handling.
		router.replace("/galang-dana", { scroll: false });
		router.push("/", { scroll: false });
	}, [searchParams, router]);

	const finalAmount = React.useMemo(() => {
		const clean = custom.replace(/[^\d]/g, "");
		const n = clean ? Number(clean) : 0;
		if (custom.trim().length > 0) return isNaN(n) ? 0 : n;
		return selectedAmount;
	}, [custom, selectedAmount]);

	const isValid = finalAmount >= MIN_DONATION;

	const openSheet = () => {
		if (!isValid) return;
		setFieldErrors({});
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

		const errs: { name?: string; phone?: string } = {};
		if (!donorName.trim()) errs.name = "Nama wajib diisi";
		const phoneErr = validatePhone(donorPhone);
		if (phoneErr) errs.phone = phoneErr;
		if (errs.name || errs.phone) {
			setFieldErrors(errs);
			setError("Periksa kembali data yang ditandai merah");
			return;
		}
		setFieldErrors({});

		setLoading(true);
		setError("");
		try {
			const res = await createDonation({
				campaignId: campaignId,
				amount: Number(finalAmount),
				donorName: donorName.trim(),
				donorPhone,
				message,
				isAnonymous: false,
				paymentMethod: "EWALLET" as any,
			});

			if (res.success) {
				const donationId = (res as any).data?.id;
				setCurrentDonationId(donationId);

				const r = await fetch("/api/payment/checkout", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ donationId }),
				});
				const j = await r.json();
				if (j.success && j.redirect_url) {
					window.location.href = j.redirect_url;
				} else {
					setError(j.error || "Gagal memulai pembayaran");
					if (currentDonationId) await cancelPendingDonation(currentDonationId);
					setCurrentDonationId(undefined);
				}
			} else {
				setError(res.error || "Gagal membuat donasi");
			}
		} catch (err) {
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
						borderRadius: "20px",
						bgcolor: "#fff",
						boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
						mx: 2,
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
				mt: "-40px",
				position: "relative",
				zIndex: 2,
				"@media (min-width:1024px)": { mt: 0 },
			}}
		>
			<Box
				sx={{
					borderRadius: "0 0 20px 20px",
					bgcolor: "#fff",
					boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
					mx: 0,
					p: 2,
					position: "relative",
					overflow: "hidden",
					"@media (min-width:1024px)": { mx: 0, height: "100%" },
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
						aria-label={`Donasi sekarang Rp${rupiah(finalAmount || 0)}`}
						onClick={openSheet}
						disabled={!isValid}
						sx={{
							width: "100%",
							borderRadius: "16px",
							py: 1.2,
							border: "1px solid rgba(11,169,118,0.35)",
							bgcolor: isValid ? PRIMARY : "rgba(15,23,42,0.08)",
							color: isValid ? "#ffffff" : "rgba(15,23,42,.40)",
							fontWeight: 900,
							fontSize: 13.5,
							cursor: isValid ? "pointer" : "not-allowed",
							boxShadow: "none",
							transition: "transform 120ms ease, filter 120ms ease",
							"&:active": { transform: isValid ? "scale(0.99)" : "none" },
							"&:focus-visible": { outline: "2px solid #0ba976", outlineOffset: "2px" },
						}}
					>
						Donasi Sekarang • Rp{rupiah(finalAmount || 0)}
					</Box>
				</Box>
			</Box>

			{/* Bottom sheet */}
			{mounted &&
				open &&
				createPortal(
					<Box sx={{ position: "fixed", inset: 0, zIndex: 15000 }}>
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
								xs: "min(85vh, calc(100dvh - 20px))",
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

							{/* Donor Identity — optional login just prefills these */}
							<Box sx={{ mb: 2.5 }}>
								<Typography
									sx={{
										fontSize: 12,
										fontWeight: 800,
										color: "rgba(15,23,42,.7)",
										mb: 0.75,
									}}
								>
									Data Diri
								</Typography>
								<Box sx={{ display: "grid", gap: 1 }}>
									<Box>
										<Box
											component="input"
											placeholder="Nama Lengkap"
											value={donorName}
											onChange={(e) => {
												setDonorName(e.target.value);
												if (fieldErrors.name)
													setFieldErrors((p) => ({ ...p, name: undefined }));
											}}
											sx={{
												width: "100%",
												boxSizing: "border-box",
												borderRadius: "12px",
												px: 1.4,
												py: 1.1,
												fontSize: 13.5,
												fontWeight: 600,
												border: fieldErrors.name
													? "1px solid rgba(239,68,68,.6)"
													: "1px solid rgba(15,23,42,0.12)",
												outline: "none",
												color: "rgba(15,23,42,.85)",
												bgcolor: "rgba(255,255,255,0.92)",
											}}
										/>
										{fieldErrors.name && (
											<Typography
												sx={{
													fontSize: 11,
													color: "rgba(239,68,68,.9)",
													fontWeight: 700,
													mt: 0.5,
												}}
											>
												{fieldErrors.name}
											</Typography>
										)}
									</Box>
									<Box>
										<Box
											component="input"
											inputMode="numeric"
											placeholder="Nomor WhatsApp (contoh: 08xxxxxxxxxx)"
											value={donorPhone}
											onChange={(e) => {
												setDonorPhone(e.target.value);
												if (fieldErrors.phone)
													setFieldErrors((p) => ({ ...p, phone: undefined }));
											}}
											sx={{
												width: "100%",
												boxSizing: "border-box",
												borderRadius: "12px",
												px: 1.4,
												py: 1.1,
												fontSize: 13.5,
												fontWeight: 600,
												border: fieldErrors.phone
													? "1px solid rgba(239,68,68,.6)"
													: "1px solid rgba(15,23,42,0.12)",
												outline: "none",
												color: "rgba(15,23,42,.85)",
												bgcolor: "rgba(255,255,255,0.92)",
											}}
										/>
										{fieldErrors.phone && (
											<Typography
												sx={{
													fontSize: 11,
													color: "rgba(239,68,68,.9)",
													fontWeight: 700,
													mt: 0.5,
												}}
											>
												{fieldErrors.phone}
											</Typography>
										)}
									</Box>
								</Box>

								{status === "unauthenticated" && (
									<Box
										component="button"
										type="button"
										onClick={() =>
											router.push(
												"/auth/login?callbackUrl=" +
													encodeURIComponent("/?quickDonate=1"),
											)
										}
										sx={{
											mt: 1,
											p: 0,
											border: "none",
											bgcolor: "transparent",
											cursor: "pointer",
											fontSize: 11.5,
											fontWeight: 700,
											color: PRIMARY,
											textAlign: "left",
										}}
									>
										Sudah punya akun? Login untuk isi otomatis
									</Box>
								)}
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
						<Box
							sx={{
								px: 3,
								pb: "calc(16px + env(safe-area-inset-bottom))",
								display: "grid",
								gap: 1.5,
							}}
						>
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
				</Box>,
					document.body,
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
