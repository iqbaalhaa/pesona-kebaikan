"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	Box,
	Typography,
	Paper,
	Stack,
	Button,
	Alert,
	InputAdornment,
	IconButton,
	Container,
} from "@mui/material";
import { StyledTextField } from "@/components/ui/StyledTextField";
import {
	LockOutlined,
	Visibility,
	VisibilityOff,
	ArrowBack,
} from "@mui/icons-material";
import { resetPassword } from "@/actions/reset-password";

function NewPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!token) {
			setError("Token tidak valid");
			return;
		}

		const passwordCriteria = {
			minLength: password.length >= 8,
			hasUppercase: /[A-Z]/.test(password),
			hasNumber: /[0-9]/.test(password),
			hasSymbol: /[!@#$%^&*(),.?":{}|<>]|[^a-zA-Z0-9]/.test(password),
		};

		if (
			!passwordCriteria.minLength ||
			!passwordCriteria.hasUppercase ||
			!passwordCriteria.hasNumber ||
			!passwordCriteria.hasSymbol
		) {
			setError(
				"Password harus minimal 8 karakter, mengandung huruf besar, angka, dan simbol",
			);
			return;
		}

		setError("");
		setSuccess("");
		setLoading(true);

		try {
			const result = await resetPassword(token, password);
			if (result.error) {
				setError(result.error);
			} else {
				setSuccess("Password berhasil diubah! Mengalihkan ke halaman login...");
				setTimeout(() => {
					router.push("/auth/login");
				}, 2000);
			}
		} catch (err) {
			setError("Terjadi kesalahan sistem");
		} finally {
			setLoading(false);
		}
	};

	if (!token) {
		return (
			<Alert severity="error">Token reset password tidak ditemukan.</Alert>
		);
	}

	return (
		<Paper
			elevation={0}
			sx={{
				p: { xs: 3, sm: 4 },
				borderRadius: 4,
				border: "1px solid",
				borderColor: "rgba(0,0,0,0.05)",
				boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)",
				position: "relative",
				zIndex: 10,
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
					<LockOutlined sx={{ color: "white", fontSize: 20 }} />
				</Box>
				<Typography
					variant="h6"
					sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}
				>
					Reset Password
				</Typography>
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ fontSize: "0.8rem" }}
				>
					Masukkan password baru Anda
				</Typography>
			</Box>

			{error && (
				<Alert
					severity="error"
					sx={{
						mb: 2.5,
						borderRadius: 2,
						alignItems: "center",
						fontSize: "0.875rem",
					}}
				>
					{error}
				</Alert>
			)}

			{success && (
				<Alert
					severity="success"
					sx={{
						mb: 2.5,
						borderRadius: 2,
						alignItems: "center",
						fontSize: "0.875rem",
					}}
				>
					{success}
				</Alert>
			)}

			<form onSubmit={handleSubmit} noValidate>
				<Stack spacing={2}>
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
							Password Baru
						</Typography>
						<StyledTextField
							name="password"
							placeholder="••••••••"
							type={showPassword ? "text" : "password"}
							fullWidth
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading || !!success}
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
						<Alert severity="info" sx={{ fontSize: 12, mt: 1 }}>
							Password harus minimal 8 karakter, mengandung huruf besar, angka,
							dan simbol.
						</Alert>
					</Box>

					<Button
						type="submit"
						fullWidth
						variant="contained"
						disabled={loading || !!success}
						sx={{
							mt: 1,
							height: 44,
							borderRadius: 2.5,
							fontWeight: 700,
							textTransform: "none",
							fontSize: "0.95rem",
							boxShadow: "0 8px 16px -4px rgba(11, 169, 118, 0.4)",
						}}
					>
						{loading ? "Menyimpan..." : "Simpan Password Baru"}
					</Button>
				</Stack>
			</form>
		</Paper>
	);
}

export default function NewPasswordPage() {
	const router = useRouter();
	return (
		<Box
			sx={{
				minHeight: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				bgcolor: "#f8fafc",
				position: "relative",
				p: 2,
			}}
		>
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
					pointerEvents: "none",
				}}
			/>

			<Container
				maxWidth="xs"
				sx={{ position: "relative", zIndex: 10, maxWidth: "400px !important" }}
			>
				<Button
					startIcon={<ArrowBack />}
					onClick={() => router.push("/auth/login")}
					sx={{
						mb: 3,
						color: "text.secondary",
						"&:hover": { color: "primary.main", bgcolor: "transparent" },
						position: "relative",
						zIndex: 11,
					}}
				>
					Kembali ke Login
				</Button>
				<Suspense fallback={<div>Loading...</div>}>
					<NewPasswordForm />
				</Suspense>
			</Container>
		</Box>
	);
}
