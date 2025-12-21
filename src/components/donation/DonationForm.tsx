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
	Radio,
	RadioGroup,
	FormControlLabel,
	FormControl,
	FormLabel,
	InputAdornment,
	Switch,
	CircularProgress,
	Snackbar,
	Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import QrCodeIcon from "@mui/icons-material/QrCode";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { createDonation } from "@/actions/donation";

const PRESET_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

type Props = {
	campaignId: string;
	campaignTitle: string;
	campaignSlug: string;
};

export default function DonationForm({
	campaignId,
	campaignTitle,
	campaignSlug,
}: Props) {
	const router = useRouter();
	const [amount, setAmount] = React.useState<number | "">("");
	const [customAmount, setCustomAmount] = React.useState<string>("");
	const [donorName, setDonorName] = React.useState("");
	const [donorPhone, setDonorPhone] = React.useState("");
	const [message, setMessage] = React.useState("");
	const [isAnonymous, setIsAnonymous] = React.useState(false);
	const [paymentMethod, setPaymentMethod] = React.useState("EWALLET");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState("");

	const handleAmountSelect = (val: number) => {
		setAmount(val);
		setCustomAmount(val.toString());
	};

	const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value.replace(/\D/g, "");
		setCustomAmount(val);
		setAmount(val ? parseInt(val) : "");
	};

	const handleSubmit = async () => {
		if (!amount || Number(amount) < 1000) {
			setError("Minimal donasi Rp 1.000");
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
				amount: Number(amount),
				donorName,
				donorPhone,
				message,
				isAnonymous,
				paymentMethod: paymentMethod as any,
			});

			if (res.success) {
				// Redirect to campaign page with success flag
				router.push(`/donasi/${campaignSlug}?donation_success=true`);
			} else {
				setError(res.error || "Gagal membuat donasi");
			}
		} catch (err) {
			setError("Terjadi kesalahan sistem");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container maxWidth="sm" sx={{ py: 4, pb: 12, position: "relative" }}>
			<Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
				<Button
					onClick={() => router.back()}
					sx={{
						minWidth: 40,
						width: 40,
						height: 40,
						borderRadius: "50%",
						bgcolor: "white",
						color: "text.primary",
						boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
						position: "absolute",
						left: 16,
						top: 24,
						zIndex: 10,
						"&:hover": { bgcolor: "#f8fafc" },
					}}
				>
					<ArrowBackIcon />
				</Button>
				<Typography
					variant="h6"
					sx={{
						fontWeight: 700,
						lineHeight: 1.2,
						width: "100%",
						textAlign: "center",
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
					borderRadius: 3,
					bgcolor: "background.paper",
					boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
				}}
			>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Anda akan berdonasi untuk:
				</Typography>
				<Typography variant="subtitle1" fontWeight={700}>
					{campaignTitle}
				</Typography>
			</Paper>

			{/* Nominal Donasi */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="subtitle1" fontWeight={700} gutterBottom>
					Pilih Nominal Donasi
				</Typography>
				<Grid container spacing={2} sx={{ mb: 2 }}>
					{PRESET_AMOUNTS.map((val) => (
						<Grid item xs={6} sm={4} key={val}>
							<Button
								variant={amount === val ? "contained" : "outlined"}
								fullWidth
								onClick={() => handleAmountSelect(val)}
								sx={{
									borderColor: amount === val ? "primary.main" : "#e2e8f0",
									color: amount === val ? "white" : "text.primary",
									boxShadow: "none",
									"&:hover": {
										boxShadow: "none",
										borderColor: "primary.main",
										bgcolor:
											amount === val ? "primary.dark" : "rgba(0,0,0,0.02)",
									},
								}}
							>
								{val.toLocaleString("id-ID")}
							</Button>
						</Grid>
					))}
				</Grid>
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
					helperText="Minimal Rp 1.000"
					sx={{
						"& .MuiInputBase-root": {
							borderRadius: 2.5,
							boxShadow: "none",
						},
						"& .MuiInputLabel-root": {
							fontSize: 14,
						},
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
							sx={{ mb: 2 }}
						/>
						<TextField
							fullWidth
							label="Nomor WhatsApp / HP"
							value={donorPhone}
							onChange={(e) => setDonorPhone(e.target.value)}
							sx={{ mb: 2 }}
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
						sx={{ mt: 2 }}
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
						"& .MuiOutlinedInput-root": { borderRadius: 2 },
						"& .MuiInputLabel-root": { fontSize: 14 },
					}}
				/>
			</Box>

			{/* Metode Pembayaran */}
			<Box sx={{ mb: 4 }}>
				<Typography variant="subtitle1" fontWeight={700} gutterBottom>
					Metode Pembayaran
				</Typography>
				<FormControl component="fieldset" fullWidth>
					<RadioGroup
						value={paymentMethod}
						onChange={(e) => setPaymentMethod(e.target.value)}
					>
						<Paper
							variant="outlined"
							sx={{
								mb: 1,
								border:
									paymentMethod === "EWALLET"
										? "2px solid #e11d48"
										: "1px solid #e2e8f0",
							}}
						>
							<FormControlLabel
								value="EWALLET"
								control={<Radio />}
								label={
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											py: 1,
										}}
									>
										<QrCodeIcon color="action" />
										<Box>
											<Typography variant="body2" fontWeight={600}>
												E-Wallet / QRIS
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Gopay, OVO, Dana, ShopeePay
											</Typography>
										</Box>
									</Box>
								}
								sx={{ width: "100%", m: 0, p: 1 }}
							/>
						</Paper>
						<Paper
							variant="outlined"
							sx={{
								mb: 1,
								border:
									paymentMethod === "VIRTUAL_ACCOUNT"
										? "2px solid #e11d48"
										: "1px solid #e2e8f0",
							}}
						>
							<FormControlLabel
								value="VIRTUAL_ACCOUNT"
								control={<Radio />}
								label={
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											py: 1,
										}}
									>
										<AccountBalanceWalletIcon color="action" />
										<Box>
											<Typography variant="body2" fontWeight={600}>
												Virtual Account
											</Typography>
											<Typography variant="caption" color="text.secondary">
												BCA, Mandiri, BNI, BRI
											</Typography>
										</Box>
									</Box>
								}
								sx={{ width: "100%", m: 0, p: 1 }}
							/>
						</Paper>

						<Paper
							variant="outlined"
							sx={{
								mb: 1,
								border:
									paymentMethod === "TRANSFER"
										? "2px solid #e11d48"
										: "1px solid #e2e8f0",
							}}
						>
							<FormControlLabel
								value="TRANSFER"
								control={<Radio />}
								label={
									<Box
										sx={{
											display: "flex",
											alignItems: "center",
											gap: 1,
											py: 1,
										}}
									>
										<CreditCardIcon color="action" />
										<Box>
											<Typography variant="body2" fontWeight={600}>
												Transfer Bank
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Transfer Manual (Verifikasi Manual)
											</Typography>
										</Box>
									</Box>
								}
								sx={{ width: "100%", m: 0, p: 1 }}
							/>
						</Paper>
					</RadioGroup>
				</FormControl>
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
					}}
				>
					<Button
						variant="contained"
						fullWidth
						size="large"
						onClick={handleSubmit}
						disabled={loading}
						sx={{
							bgcolor: "#e11d48",
							fontWeight: 700,
							"&:hover": { bgcolor: "#be123c" },
						}}
					>
						{loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							`Lanjut Pembayaran`
						)}
					</Button>
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
