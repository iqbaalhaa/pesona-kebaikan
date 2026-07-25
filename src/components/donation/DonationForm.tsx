"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
	Box,
	Button,
	Container,
	Typography,
	Paper,
	Switch,
	CircularProgress,
	Snackbar,
	Alert,
	FormControlLabel,
} from "@mui/material";
import { Input, Textarea } from "@/components/ui/Input";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { createDonation } from "@/actions/donation";
import { useTheme, alpha, darken } from "@mui/material/styles";

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];
const MIN_DONATION = Number(process.env.NEXT_PUBLIC_MIN_DONATION ?? 1);
const MAX_DONATION = Number(process.env.NEXT_PUBLIC_MAX_DONATION ?? 1_000_000_000);

function validatePhone(raw: string): string {
	const d = raw.replace(/\D/g, "");
	if (!d) return "Nomor HP wajib diisi";
	if (!/^(0|62|8)/.test(d)) return "Format nomor HP tidak valid (contoh: 08xxxxxxxxxx)";
	if (d.length < 10) return "Nomor HP minimal 10 digit";
	if (d.length > 15) return "Nomor HP terlalu panjang";
	return "";
}

type Props = {
	campaignId: string;
	campaignTitle: string;
	campaignSlug: string;
	fundraiserId?: string;
	fundraiserSlug?: string;
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
	fundraiserSlug,
}: Props) {
	const router = useRouter();
	const theme = useTheme();
	const { data: session } = useSession();
	const [amount, setAmount] = React.useState<number | "">("");
	const [customAmount, setCustomAmount] = React.useState<string>("");
	const [donorName, setDonorName] = React.useState("");
	const [donorPhone, setDonorPhone] = React.useState("");

	React.useEffect(() => {
		if (session?.user) {
			if (session.user.name && !donorName) setDonorName(session.user.name);
			const phone = (session.user as any)?.phone;
			if (phone && !donorPhone) setDonorPhone(phone);
		}
	}, [session]);
	const [message, setMessage] = React.useState("");
	const [isAnonymous, setIsAnonymous] = React.useState(false);
	const [allowContact, setAllowContact] = React.useState(true);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState("");
	const [fieldErrors, setFieldErrors] = React.useState<{
		amount?: string;
		name?: string;
		phone?: string;
	}>({});

	const handleAmountSelect = (val: number) => {
		setAmount(val);
		setCustomAmount(formatIDR(val.toString()));
		if (fieldErrors.amount) setFieldErrors((p) => ({ ...p, amount: undefined }));
	};

	const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatIDR(e.target.value);
		const digits = e.target.value.replace(/\D/g, "");
		setCustomAmount(formatted);
		setAmount(digits ? parseInt(digits) : "");
		if (fieldErrors.amount) setFieldErrors((p) => ({ ...p, amount: undefined }));
	};

	const handleSubmit = async () => {
		const errs: { amount?: string; name?: string; phone?: string } = {};

		if (!amount || Number(amount) < MIN_DONATION) {
			errs.amount = `Minimal donasi Rp ${MIN_DONATION.toLocaleString("id-ID")}`;
		} else if (Number(amount) > MAX_DONATION) {
			errs.amount = `Maksimal donasi Rp ${MAX_DONATION.toLocaleString("id-ID")}`;
		}
		if (!donorName.trim()) {
			errs.name = "Nama donatur wajib diisi";
		}
		const phoneErr = validatePhone(donorPhone);
		if (phoneErr) errs.phone = phoneErr;

		if (errs.amount || errs.name || errs.phone) {
			setFieldErrors(errs);
			setError("Periksa kembali data yang ditandai merah");
			return;
		}

		setFieldErrors({});
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
				allowContact,
				paymentMethod: "EWALLET" as any,
			});

			if (res.success) {
				const donationId = (res as any).data?.id;
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
				}
			} else {
				setError(res.error || "Gagal membuat donasi");
			}
		} catch (err) {
			if (typeof navigator !== "undefined" && !navigator.onLine) {
				setError("Koneksi internet terputus. Periksa jaringan Anda lalu coba lagi.");
			} else {
				setError("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container
			maxWidth="sm"
			sx={{
				py: 2,
				pb: "calc(9rem + env(safe-area-inset-bottom))",
				position: "relative",
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
				<Button
					onClick={() => router.back()}
					sx={{
						minWidth: 36,
						width: 36,
						height: 36,
						borderRadius: "50%",
						bgcolor: "white",
						color: "text.primary",
						boxShadow: "0 4px 12px rgba(2,6,23,0.08)",
						position: "absolute",
						left: 16,
						top: 14,
						zIndex: 10,
						border: "1px solid #e2e8f0",
						"&:hover": { bgcolor: "#f8fafc" },
					}}
				>
					<ArrowBackIcon sx={{ fontSize: 20 }} />
				</Button>
				<Typography
					sx={{
						fontWeight: 800,
						fontSize: 16,
						width: "100%",
						textAlign: "center",
					}}
				>
					Donasi
				</Typography>
			</Box>

			<div className="mb-3 border-b border-slate-100 pb-3">
				<p className="text-[11px] text-slate-400">Donasi untuk</p>
				<p className="text-[14px] font-bold leading-tight text-foreground line-clamp-2">{campaignTitle}</p>
			</div>

			{/* Nominal Donasi */}
			<Box sx={{ mb: 2.5 }}>
				<Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>
					Pilih Nominal Donasi
				</Typography>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(3, 1fr)",
						gap: 1,
						mb: 1.5,
					}}
				>
					{PRESET_AMOUNTS.map((val) => (
						<Button
							key={val}
							variant={amount === val ? "contained" : "outlined"}
							fullWidth
							onClick={() => handleAmountSelect(val)}
							sx={{
								borderColor: amount === val ? "transparent" : "#e2e8f0",
								color: amount === val ? "white" : "text.primary",
								boxShadow: "none",
								borderRadius: 2.5,
								fontWeight: 700,
								fontSize: 13,
								py: 0.8,
								bgcolor: amount === val ? "primary.main" : "rgba(0,0,0,0.02)",
								"&:hover": {
									boxShadow: "none",
									borderColor: "primary.main",
									bgcolor: amount === val ? "primary.dark" : "rgba(2,6,23,0.04)",
								},
							}}
						>
							{val.toLocaleString("id-ID")}
						</Button>
					))}
				</Box>
				<Input
					placeholder="Nominal Lainnya"
					value={customAmount}
					onChange={handleCustomAmountChange}
					startAdornment={<span>Rp</span>}
					error={fieldErrors.amount}
					helperText={`Minimal Rp ${MIN_DONATION.toLocaleString("id-ID")}`}
				/>
			</Box>

			<div className="my-3 h-px bg-slate-100" />

			{/* Data Diri */}
			<Box sx={{ mb: 2.5 }}>
				<Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }}>
					Data Donatur
				</Typography>
				<div className="mb-2.5">
					<Input
						placeholder="Nama Lengkap"
						value={donorName}
						onChange={(e) => {
							if (!isAnonymous) setDonorName(e.target.value);
							if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
						}}
						readOnly={isAnonymous}
						error={fieldErrors.name}
						className={isAnonymous ? "bg-slate-50 text-slate-400" : ""}
					/>
				</div>
				<div className="mb-2.5">
					<Input
						placeholder="Nomor WhatsApp / HP"
						value={donorPhone}
						onChange={(e) => {
							setDonorPhone(e.target.value);
							if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
						}}
						type="tel"
						inputMode="numeric"
						error={fieldErrors.phone}
						helperText="Contoh: 081234567890 — pastikan aktif WhatsApp"
					/>
				</div>

				<FormControlLabel
					control={
						<Switch
							size="small"
							checked={isAnonymous}
							onChange={(e) => {
								setIsAnonymous(e.target.checked);
								if (e.target.checked) {
									setDonorName("Hamba Allah");
								} else {
									setDonorName("");
								}
							}}
						/>
					}
					label={<Typography sx={{ fontSize: 13 }}>Sembunyikan nama saya (Hamba Allah)</Typography>}
				/>
				<FormControlLabel
					control={
						<Switch
							size="small"
							checked={allowContact}
							onChange={(e) => setAllowContact(e.target.checked)}
						/>
					}
					label={<Typography sx={{ fontSize: 13 }}>Bersedia dihubungi via WhatsApp untuk kabar terbaru</Typography>}
				/>
			</Box>

			<div className="my-3 h-px bg-slate-100" />

			{/* Pesan */}
			<Box sx={{ mb: 2.5 }}>
				<Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }}>
					Doa & Dukungan (Opsional)
				</Typography>
				<Textarea
					rows={2}
					placeholder="Tulis doa atau dukungan..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
			</Box>

			{/* Submit Bar */}
			<Box
				sx={{
					position: "fixed",
					bottom: 0,
					left: { xs: 0, sm: "50%" },
					transform: { xs: "none", sm: "translateX(-50%)" },
					width: "100%",
					maxWidth: { xs: "100%", sm: 480 },
					zIndex: 100,
				}}
			>
				<Paper
					elevation={0}
					sx={{
						px: 2,
						pt: 1.5,
						pb: "calc(0.75rem + env(safe-area-inset-bottom))",
						borderTop: "1px solid #e2e8f0",
						borderRadius: 0,
						bgcolor: "white",
					}}
				>
					<Typography
						sx={{
							fontSize: 11,
							color: "text.secondary",
							textAlign: "center",
							mb: 0.75,
						}}
					>
						Metode pembayaran (QRIS, e-wallet, bank) dipilih di langkah berikutnya
					</Typography>
					<Button
						variant="contained"
						color="primary"
						fullWidth
						onClick={handleSubmit}
						disabled={loading}
						sx={{
							fontWeight: 700,
							fontSize: 15,
							borderRadius: 3,
							py: 1.2,
							textTransform: "none",
							boxShadow: "none",
							"&:hover": { boxShadow: "0 4px 12px rgba(11,169,118,0.3)" },
						}}
					>
						{loading ? (
							<CircularProgress size={22} color="inherit" />
						) : (
							"Lanjut Pembayaran"
						)}
					</Button>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							mt: 1,
							color: "text.secondary",
							gap: 0.5,
						}}
					>
						<LockOutlinedIcon sx={{ fontSize: 14 }} />
						<Typography sx={{ fontSize: 11 }}>
							Pembayaran aman & terenkripsi.
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
