"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Typography,
	Paper,
	Stack,
	Link as MuiLink,
	Button,
	TextField,
	Alert,
	InputAdornment,
	IconButton,
	Container,
} from "@mui/material";
import {
	EmailOutlined,
	LockOutlined,
	PersonOutline,
	Visibility,
	VisibilityOff,
	ArrowBack,
	HowToRegOutlined,
} from "@mui/icons-material";

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

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

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

			router.push("/auth/login");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan");
		} finally {
			setLoading(false);
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
						"linear-gradient(180deg, rgba(97, 206, 112, 0.1) 0%, rgba(248, 250, 252, 0) 100%)",
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
								boxShadow: "0 8px 16px -4px rgba(97, 206, 112, 0.4)",
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
							<TextField
								name="name"
								placeholder="Nama Lengkap Anda"
								fullWidth
								required
								value={formData.name}
								onChange={handleChange}
								size="small"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<PersonOutline
												sx={{ color: "text.secondary", fontSize: 18 }}
											/>
										</InputAdornment>
									),
									sx: { fontSize: "0.875rem" },
								}}
								sx={{
									"& .MuiOutlinedInput-root": {
										borderRadius: 2,
										bgcolor: "rgba(241, 245, 249, 0.5)",
										"& fieldset": { borderColor: "rgba(226, 232, 240, 0.8)" },
										"&:hover fieldset": { borderColor: "primary.main" },
										"&.Mui-focused fieldset": { borderColor: "primary.main" },
									},
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
							<TextField
								name="email"
								placeholder="nama@email.com"
								type="email"
								fullWidth
								required
								value={formData.email}
								onChange={handleChange}
								size="small"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<EmailOutlined
												sx={{ color: "text.secondary", fontSize: 18 }}
											/>
										</InputAdornment>
									),
									sx: { fontSize: "0.875rem" },
								}}
								sx={{
									"& .MuiOutlinedInput-root": {
										borderRadius: 2,
										bgcolor: "rgba(241, 245, 249, 0.5)",
										"& fieldset": { borderColor: "rgba(226, 232, 240, 0.8)" },
										"&:hover fieldset": { borderColor: "primary.main" },
										"&.Mui-focused fieldset": { borderColor: "primary.main" },
									},
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
							<TextField
								name="password"
								placeholder="Buat password"
								type={showPassword ? "text" : "password"}
								fullWidth
								required
								value={formData.password}
								onChange={handleChange}
								size="small"
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
									sx: { fontSize: "0.875rem" },
								}}
								sx={{
									"& .MuiOutlinedInput-root": {
										borderRadius: 2,
										bgcolor: "rgba(241, 245, 249, 0.5)",
										"& fieldset": { borderColor: "rgba(226, 232, 240, 0.8)" },
										"&:hover fieldset": { borderColor: "primary.main" },
										"&.Mui-focused fieldset": { borderColor: "primary.main" },
									},
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
								Konfirmasi Password
							</Typography>
							<TextField
								name="confirmPassword"
								placeholder="Ulangi password"
								type={showConfirmPassword ? "text" : "password"}
								fullWidth
								required
								value={formData.confirmPassword}
								onChange={handleChange}
								size="small"
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
									sx: { fontSize: "0.875rem" },
								}}
								sx={{
									"& .MuiOutlinedInput-root": {
										borderRadius: 2,
										bgcolor: "rgba(241, 245, 249, 0.5)",
										"& fieldset": { borderColor: "rgba(226, 232, 240, 0.8)" },
										"&:hover fieldset": { borderColor: "primary.main" },
										"&.Mui-focused fieldset": { borderColor: "primary.main" },
									},
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
								boxShadow: "0 4px 12px rgba(97, 206, 112, 0.25)",
								background: "linear-gradient(to right, #61ce70, #4caf50)",
								"&:hover": {
									boxShadow: "0 6px 16px rgba(97, 206, 112, 0.35)",
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
		</Box>
	);
}
