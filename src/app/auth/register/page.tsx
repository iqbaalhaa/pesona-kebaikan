"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StyledTextField } from "@/components/ui/StyledTextField";
import {
	Box,
	Typography,
	Paper,
	Stack,
	Link as MuiLink,
	Button,
	Alert,
	InputAdornment,
	IconButton,
	Container,
	Dialog,
} from "@mui/material";
import {
	EmailOutlined,
	LockOutlined,
	PersonOutline,
	Visibility,
	VisibilityOff,
	ArrowBack,
	HowToRegOutlined,
	CheckCircle,
	Cancel,
	Close as CloseIcon,
} from "@mui/icons-material";
import { newVerification } from "@/actions/new-verification";

export default function RegisterPage() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		name: "",
	});

	// Verification Dialog State
	const [openVerification, setOpenVerification] = useState(false);
	const [registeredEmail, setRegisteredEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [verifying, setVerifying] = useState(false);
	const [verificationError, setVerificationError] = useState("");
	const [verificationSuccess, setVerificationSuccess] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const passwordCriteria = {
		minLength: formData.password.length >= 8,
		hasUppercase: /[A-Z]/.test(formData.password),
		hasNumber: /[0-9]/.test(formData.password),
		hasSymbol: /[!@#$%^&*(),.?":{}|<>]|[^a-zA-Z0-9]/.test(formData.password),
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		if (
			!passwordCriteria.minLength ||
			!passwordCriteria.hasUppercase ||
			!passwordCriteria.hasNumber ||
			!passwordCriteria.hasSymbol
		) {
			setError(
				"Password harus minimal 8 karakter, mengandung huruf besar, angka, dan simbol",
			);
			setLoading(false);
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError("Password tidak cocok");
			setLoading(false);
			return;
		}

		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
					name: formData.name,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Registrasi gagal");
			}

			// Show Verification Dialog instead of redirecting
			setRegisteredEmail(formData.email);
			setOpenVerification(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan");
			setLoading(false);
		}
	};

	const handleVerify = async () => {
		if (otp.length < 6) {
			setVerificationError("Masukkan 6 digit kode OTP");
			return;
		}

		setVerifying(true);
		setVerificationError("");

		try {
			const res = await newVerification(otp);
			if (res.success) {
				setVerificationSuccess(true);
				setTimeout(() => {
					router.push("/auth/login");
				}, 1500);
			} else {
				setVerificationError(res.error || "Verifikasi gagal");
			}
		} catch (err) {
			setVerificationError("Terjadi kesalahan saat verifikasi");
		} finally {
			setVerifying(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				bgcolor: "#f8fafc", // Slate 50
				position: "relative",
				p: 2,
			}}
		>
			{/* Background decoration */}
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: "30%",
					background:
						"linear-gradient(180deg, rgba(11, 169, 118, 0.1) 0%, rgba(248, 250, 252, 0) 100%)",
					zIndex: 0,
				}}
			/>

			<Container
				maxWidth="xs"
				sx={{ position: "relative", zIndex: 1, maxWidth: "400px !important" }}
			>
				{/* Back Button */}
				<Button
					startIcon={<ArrowBack />}
					onClick={() => router.push("/")}
					sx={{
						mb: 3,
						color: "text.secondary",
						"&:hover": { color: "primary.main", bgcolor: "transparent" },
					}}
				>
					Kembali ke Beranda
				</Button>

				<Paper
					elevation={0}
					sx={{
						p: { xs: 3, sm: 4 },
						borderRadius: 4,
						border: "1px solid",
						borderColor: "rgba(0,0,0,0.05)",
						boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)",
					}}
				>
					<Box sx={{ textAlign: "center", mb: 3 }}>
						<Box
							sx={{
								width: 40,
								height: 40,
								bgcolor: "primary.main",
								borderRadius: 2,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								mx: "auto",
								mb: 2,
								boxShadow: "0 8px 16px -4px rgba(11, 169, 118, 0.4)",
							}}
						>
							<HowToRegOutlined sx={{ color: "white", fontSize: 20 }} />
						</Box>
						<Typography
							variant="h6"
							sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}
						>
							Buat Akun Baru
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontSize: "0.8rem" }}
						>
							Bergabunglah untuk menebar kebaikan
						</Typography>
					</Box>

					{error && (
						<Alert
							severity="error"
							sx={{ mb: 2.5, borderRadius: 2, py: 0, alignItems: "center" }}
						>
							{error}
						</Alert>
					)}

					<Stack spacing={2} component="form" onSubmit={handleSubmit}>
						<Box>
							<Typography
								variant="caption"
								sx={{
									fontWeight: 600,
									color: "text.primary",
									mb: 0.5,
									display: "block",
									fontSize: "0.75rem",
								}}
							>
								Nama Lengkap
							</Typography>
							<StyledTextField
								name="name"
								placeholder="Nama Lengkap Anda"
								fullWidth
								required
								value={formData.name}
								onChange={handleChange}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<PersonOutline
												sx={{ color: "text.secondary", fontSize: 18 }}
											/>
										</InputAdornment>
									),
								}}
							/>
						</Box>

						<Box>
							<Typography
								variant="caption"
								sx={{
									fontWeight: 600,
									color: "text.primary",
									mb: 0.5,
									display: "block",
									fontSize: "0.75rem",
								}}
							>
								Email
							</Typography>
							<StyledTextField
								name="email"
								placeholder="nama@email.com"
								type="email"
								fullWidth
								required
								value={formData.email}
								onChange={handleChange}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<EmailOutlined
												sx={{ color: "text.secondary", fontSize: 18 }}
											/>
										</InputAdornment>
									),
								}}
							/>
						</Box>

						<Box>
							<Typography
								variant="caption"
								sx={{
									fontWeight: 600,
									color: "text.primary",
									mb: 0.5,
									display: "block",
									fontSize: "0.75rem",
								}}
							>
								Password
							</Typography>
							<StyledTextField
								name="password"
								placeholder="Buat password"
								type={showPassword ? "text" : "password"}
								fullWidth
								required
								value={formData.password}
								onChange={handleChange}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LockOutlined
												sx={{ color: "text.secondary", fontSize: 18 }}
											/>
										</InputAdornment>
									),
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle password visibility"
												onClick={() => setShowPassword(!showPassword)}
												edge="end"
												size="small"
											>
												{showPassword ? (
													<VisibilityOff sx={{ fontSize: 18 }} />
												) : (
													<Visibility sx={{ fontSize: 18 }} />
												)}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
							{formData.password && (
								<Stack
									direction="row"
									spacing={1}
									useFlexGap
									flexWrap="wrap"
									sx={{ mt: 1 }}
								>
									{[
										{
											label: "Min. 8 Karakter",
											met: passwordCriteria.minLength,
										},
										{
											label: "Huruf Besar",
											met: passwordCriteria.hasUppercase,
										},
										{ label: "Angka", met: passwordCriteria.hasNumber },
										{ label: "Simbol", met: passwordCriteria.hasSymbol },
									].map((item, index) => (
										<Box
											key={index}
											sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
										>
											{item.met ? (
												<CheckCircle color="success" sx={{ fontSize: 14 }} />
											) : (
												<Cancel color="error" sx={{ fontSize: 14 }} />
											)}
											<Typography
												variant="caption"
												sx={{
													fontSize: "0.7rem",
													color: item.met ? "success.main" : "error.main",
												}}
											>
												{item.label}
											</Typography>
										</Box>
									))}
								</Stack>
							)}
						</Box>

						<Box>
							<Typography
								variant="caption"
								sx={{
									fontWeight: 600,
									color: "text.primary",
									mb: 0.5,
									display: "block",
									fontSize: "0.75rem",
								}}
							>
								Konfirmasi Password
							</Typography>
							<StyledTextField
								name="confirmPassword"
								placeholder="Ulangi password"
								type={showConfirmPassword ? "text" : "password"}
								fullWidth
								required
								value={formData.confirmPassword}
								onChange={handleChange}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<LockOutlined
												sx={{ color: "text.secondary", fontSize: 18 }}
											/>
										</InputAdornment>
									),
									endAdornment: (
										<InputAdornment position="end">
											<IconButton
												aria-label="toggle confirm password visibility"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												edge="end"
												size="small"
											>
												{showConfirmPassword ? (
													<VisibilityOff sx={{ fontSize: 18 }} />
												) : (
													<Visibility sx={{ fontSize: 18 }} />
												)}
											</IconButton>
										</InputAdornment>
									),
								}}
							/>
						</Box>

						<Button
							variant="contained"
							fullWidth
							type="submit"
							disabled={loading}
							sx={{
								py: 1.25,
								mt: 1,
								borderRadius: 2,
								fontSize: 14,
								fontWeight: 700,
								boxShadow: "0 4px 12px rgba(11, 169, 118, 0.25)",
								background: "linear-gradient(to right, #0ba976, #4caf50)",
								"&:hover": {
									boxShadow: "0 6px 16px rgba(11, 169, 118, 0.35)",
								},
							}}
						>
							{loading ? "Mendaftar..." : "Daftar Sekarang"}
						</Button>
					</Stack>

					<Stack spacing={1} sx={{ mt: 3, textAlign: "center" }}>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontSize: "0.8rem" }}
						>
							Sudah punya akun?{" "}
							<MuiLink
								href="/auth/login"
								sx={{
									fontWeight: 700,
									color: "primary.main",
									textDecoration: "none",
									"&:hover": { textDecoration: "underline" },
								}}
							>
								Masuk di sini
							</MuiLink>
						</Typography>
					</Stack>
				</Paper>

				<Typography
					variant="caption"
					align="center"
					sx={{ display: "block", mt: 4, color: "text.disabled" }}
				>
					&copy; {new Date().getFullYear()} Pesona Kebaikan. All rights
					reserved.
				</Typography>
			</Container>

			{/* Verification Dialog */}
			<Dialog
				open={openVerification}
				maxWidth="xs"
				fullWidth
				PaperProps={{
					sx: { borderRadius: 3 },
				}}
			>
				<Box sx={{ p: 3, textAlign: "center" }}>
					<Box
						sx={{
							width: 60,
							height: 60,
							bgcolor: verificationSuccess ? "success.light" : "primary.light",
							color: verificationSuccess ? "success.main" : "primary.main",
							borderRadius: "50%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							mx: "auto",
							mb: 2,
							background: verificationSuccess
								? "rgba(46, 125, 50, 0.1)"
								: "rgba(11, 169, 118, 0.1)",
						}}
					>
						{verificationSuccess ? (
							<CheckCircle sx={{ fontSize: 32 }} />
						) : (
							<EmailOutlined sx={{ fontSize: 32 }} />
						)}
					</Box>

					<Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
						{verificationSuccess ? "Verifikasi Berhasil" : "Verifikasi Email"}
					</Typography>

					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						{verificationSuccess
							? "Akun Anda telah berhasil diverifikasi. Mengalihkan ke halaman login..."
							: `Kami telah mengirimkan kode OTP ke email ${registeredEmail}. Silakan cek kotak masuk Anda.`}
					</Typography>

					{!verificationSuccess && (
						<Stack spacing={2}>
							{verificationError && (
								<Alert severity="error" sx={{ borderRadius: 2 }}>
									{verificationError}
								</Alert>
							)}
							<StyledTextField
								placeholder="Masukkan 6 digit kode OTP"
								fullWidth
								value={otp}
								onChange={(e) =>
									setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
								}
								inputProps={{
									style: {
										textAlign: "center",
										letterSpacing: 4,
										fontSize: 18,
									},
									maxLength: 6,
								}}
								disabled={verifying}
							/>
							<Button
								variant="contained"
								fullWidth
								onClick={handleVerify}
								disabled={verifying || otp.length < 6}
								sx={{
									py: 1.25,
									borderRadius: 2,
									fontWeight: 700,
									background: "linear-gradient(to right, #0ba976, #4caf50)",
									boxShadow: "0 4px 12px rgba(11, 169, 118, 0.25)",
								}}
							>
								{verifying ? "Memproses..." : "Verifikasi Akun"}
							</Button>
							<Button
								variant="text"
								onClick={() => router.push("/auth/login")}
								disabled={verifying}
								sx={{ color: "text.secondary" }}
							>
								Lewati (Verifikasi Nanti)
							</Button>
						</Stack>
					)}
				</Box>
			</Dialog>
		</Box>
	);
}
