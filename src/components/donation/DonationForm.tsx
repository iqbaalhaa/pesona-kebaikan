"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	Container,
	Grid,
	TextField,
	Typography,
	Paper,
	InputAdornment,
	Switch,
	CircularProgress,
	Snackbar,
	Alert,
	FormControlLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createDonation } from "@/actions/donation";
import Script from "next/script";
import { useTheme, alpha, darken } from "@mui/material/styles";

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];
const MIN_DONATION = Number(process.env.NEXT_PUBLIC_MIN_DONATION ?? 1);

type Props = {
	campaignId: string;
	campaignTitle: string;
	campaignSlug: string;
	fundraiserId?: string;
};

function formatIDR(numStr: string) {
	const n = numStr.replace(/\D/g, "");
	if (!n) return "";
	return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function DonationForm({
	campaignId,
	campaignTitle,
	campaignSlug,
	fundraiserId,
}: Props) {
	const router = useRouter();
	const theme = useTheme();
	const [amount, setAmount] = React.useState<number | "">("");
	const [customAmount, setCustomAmount] = React.useState<string>("");
	const [donorName, setDonorName] = React.useState("");
	const [donorPhone, setDonorPhone] = React.useState("");
	const [message, setMessage] = React.useState("");
	const [isAnonymous, setIsAnonymous] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState("");

	const handleAmountSelect = (val: number) => {
		setAmount(val);
		setCustomAmount(formatIDR(val.toString()));
	};

	const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatIDR(e.target.value);
		const digits = e.target.value.replace(/\D/g, "");
		setCustomAmount(formatted);
		setAmount(digits ? parseInt(digits) : "");
	};

	const handleSubmit = async () => {
		if (!amount || Number(amount) < MIN_DONATION) {
			setError(`Minimal donasi Rp ${MIN_DONATION.toLocaleString("id-ID")}`);
			return;
		}
		if (!donorName) {
			setError("Nama donatur wajib diisi");
			return;
		}
		if (!donorPhone) {
			setError("Nomor HP wajib diisi");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const res = await createDonation({
				campaignId,
				fundraiserId,
				amount: Number(amount),
				donorName,
				donorPhone,
				message,
				isAnonymous,
				paymentMethod: "EWALLET" as any,
			});

			if (res.success) {
				const donationId = (res as any).data?.id;
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
							router.push(`/donasi/${campaignSlug}?donation_success=true`);
						},
						onPending: () => {
							router.push(`/donasi/${campaignSlug}?donation_success=true`);
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

	return (
		<Container maxWidth="sm" sx={{ py: 4, pb: 12, position: "relative" }}>
			<Script
				src={
					process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
						? "https://app.midtrans.com/snap/snap.js"
						: "https://app.sandbox.midtrans.com/snap/snap.js"
				}
				data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
				strategy="afterInteractive"
			/>
			<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
				<Button
					onClick={() => router.back()}
					sx={{
						minWidth: 44,
						width: 44,
						height: 44,
						borderRadius: "50%",
						bgcolor: "white",
						color: "text.primary",
						boxShadow: "0 10px 24px rgba(2,6,23,0.08)",
						position: "absolute",
						left: 16,
						top: 24,
						zIndex: 10,
						border: "1px solid #e2e8f0",
						"&:hover": { bgcolor: "#f8fafc" },
					}}
				>
					<ArrowBackIcon />
				</Button>
				<Typography
					variant="h6"
					sx={{
						fontWeight: 800,
						lineHeight: 1.2,
						width: "100%",
						textAlign: "center",
						letterSpacing: 0.2,
					}}
				>
					Donasi
				</Typography>
			</Box>

			<Paper
				elevation={0}
				sx={{
					p: 3,
					mb: 3,
					borderRadius: 4,
					bgcolor: "background.paper",
					boxShadow: "0 12px 40px rgba(2,6,23,0.08)",
					border: "1px solid #e6edf7",
					backgroundImage:
						"linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.9))",
				}}
			>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Anda akan berdonasi untuk:
				</Typography>
				<Typography variant="subtitle1" fontWeight={800}>
					{campaignTitle}
				</Typography>
			</Paper>

			{/* Nominal Donasi */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="subtitle1" fontWeight={700} gutterBottom>
					Pilih Nominal Donasi
				</Typography>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)" },
						gap: 2,
						mb: 2,
					}}
				>
					{PRESET_AMOUNTS.map((val) => (
						<Box key={val}>
							<Button
								variant={amount === val ? "contained" : "outlined"}
								fullWidth
								onClick={() => handleAmountSelect(val)}
								sx={{
									borderColor: amount === val ? "transparent" : "#e2e8f0",
									color: amount === val ? "white" : "text.primary",
									boxShadow:
										amount === val
											? `0 10px 24px ${alpha(theme.palette.primary.main, 0.35)}`
											: "none",
									borderRadius: 3,
									fontWeight: 700,
									py: 1.25,
									backgroundImage:
										amount === val
											? `linear-gradient(135deg, ${theme.palette.primary.main}, ${darken(
													theme.palette.primary.main,
													0.08,
												)})`
											: "none",
									bgcolor: amount === val ? "primary.main" : "rgba(0,0,0,0.02)",
									"&:hover": {
										boxShadow:
											amount === val
												? `0 12px 28px ${alpha(
														theme.palette.primary.main,
														0.45,
													)}`
												: "none",
										borderColor: "primary.main",
										bgcolor:
											amount === val ? "primary.dark" : "rgba(2,6,23,0.04)",
									},
								}}
							>
								{val.toLocaleString("id-ID")}
							</Button>
						</Box>
					))}
				</Box>
				<TextField
					fullWidth
					placeholder="Nominal Lainnya"
					value={customAmount}
					onChange={handleCustomAmountChange}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">Rp</InputAdornment>
						),
					}}
					helperText={`Minimal Rp ${MIN_DONATION.toLocaleString("id-ID")}`}
					sx={{
						"& .MuiInputBase-root": {
							borderRadius: 3,
							boxShadow: "none",
							transition: "all .2s ease",
						},
						"& .MuiOutlinedInput-root.Mui-focused": {
							boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
						},
						"& .MuiInputLabel-root": { fontSize: 14 },
					}}
				/>
			</Box>

			{/* Data Diri */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="subtitle1" fontWeight={700} gutterBottom>
					Data Donatur
				</Typography>
				{!isAnonymous && (
					<>
						<TextField
							fullWidth
							label="Nama Lengkap"
							value={donorName}
							onChange={(e) => setDonorName(e.target.value)}
							sx={{
								mb: 2,
								"& .MuiOutlinedInput-root.Mui-focused": {
									boxShadow: `0 0 0 4px ${alpha(
										theme.palette.primary.main,
										0.15,
									)}`,
								},
							}}
						/>
						<TextField
							fullWidth
							label="Nomor WhatsApp / HP"
							value={donorPhone}
							onChange={(e) => setDonorPhone(e.target.value)}
							sx={{
								mb: 2,
								"& .MuiOutlinedInput-root.Mui-focused": {
									boxShadow: `0 0 0 4px ${alpha(
										theme.palette.primary.main,
										0.15,
									)}`,
								},
							}}
							type="tel"
						/>
					</>
				)}

				<FormControlLabel
					control={
						<Switch
							checked={isAnonymous}
							onChange={(e) => {
								setIsAnonymous(e.target.checked);
								if (e.target.checked) {
									setDonorName("Hamba Allah");
									setDonorPhone("000000000000"); // Dummy or handle in backend
								} else {
									setDonorName("");
									setDonorPhone("");
								}
							}}
						/>
					}
					label="Sembunyikan nama saya (Hamba Allah)"
				/>
				{isAnonymous && (
					<Typography
						variant="caption"
						color="text.secondary"
						display="block"
						sx={{ mt: 1 }}
					>
						Kami tetap membutuhkan nomor HP untuk mengirimkan konfirmasi donasi,
						namun nama Anda akan disamarkan di halaman publik.
					</Typography>
				)}
				{isAnonymous && (
					<TextField
						fullWidth
						label="Nomor WhatsApp / HP (Penting)"
						value={donorPhone}
						onChange={(e) => setDonorPhone(e.target.value)}
						sx={{
							mt: 2,
							"& .MuiOutlinedInput-root.Mui-focused": {
								boxShadow: `0 0 0 4px ${alpha(
									theme.palette.primary.main,
									0.15,
								)}`,
							},
						}}
						type="tel"
					/>
				)}
			</Box>

			{/* Pesan */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="subtitle1" fontWeight={700} gutterBottom>
					Doa & Dukungan (Opsional)
				</Typography>
				<TextField
					fullWidth
					multiline
					rows={3}
					placeholder="Tulis doa atau dukungan untuk penggalang dana..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					sx={{
						"& .MuiOutlinedInput-root": { borderRadius: 3 },
						"& .MuiOutlinedInput-root.Mui-focused": {
							boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
						},
						"& .MuiInputLabel-root": { fontSize: 14 },
					}}
				/>
			</Box>

			{/* Submit Bar */}
			<Box
				sx={{
					position: "fixed",
					bottom: { xs: 0, sm: "3px" },
					left: { xs: 0, sm: "50%" },
					transform: { xs: "none", sm: "translateX(-50%)" },
					width: "100%",
					maxWidth: { xs: "100%", sm: 480 },
					zIndex: 100,
				}}
			>
				<Paper
					elevation={3}
					sx={{
						p: 2,
						borderTop: "1px solid #e2e8f0",
						borderRadius: 0,
						backgroundImage:
							"linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))",
						backdropFilter: "blur(6px)",
					}}
				>
					<Button
						variant="contained"
						color="primary"
						fullWidth
						size="large"
						onClick={handleSubmit}
						disabled={loading}
						sx={{
							fontWeight: 800,
							borderRadius: 3,
							boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.35)}`,
							backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${darken(
								theme.palette.primary.main,
								0.08,
							)})`,
							"&:hover": {
								boxShadow: `0 14px 34px ${alpha(
									theme.palette.primary.main,
									0.45,
								)}`,
							},
						}}
					>
						{loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							`Lanjut Pembayaran`
						)}
					</Button>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							mt: 1.5,
							color: "text.secondary",
							gap: 1,
						}}
					>
						<LockOutlinedIcon fontSize="small" />
						<Typography variant="caption">
							Pembayaran aman & terenkripsi. Dilindungi oleh Midtrans.
						</Typography>
					</Box>
				</Paper>
			</Box>

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
		</Container>
	);
}
