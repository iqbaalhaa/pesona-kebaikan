"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
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
	Visibility,
	VisibilityOff,
	ArrowBack,
} from "@mui/icons-material";

export default function LoginPage() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
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

		try {
			const result = await signIn("credentials", {
				email: formData.email,
				password: formData.password,
				redirect: false,
			});

			if (!result?.ok) {
				setError("Email atau password salah");
				return;
			}

			// Force reload session to get latest data
			const session = await getSession();
			console.log("Login session:", session); // Debugging

			if (session?.user?.role === "ADMIN") {
				router.push("/admin");
			} else {
				router.push("/profil");
			}
		} catch (err) {
			setError("Terjadi kesalahan saat login");
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
							<LockOutlined sx={{ color: "white", fontSize: 20 }} />
						</Box>
						<Typography
							variant="h6"
							sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}
						>
							Selamat Datang
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontSize: "0.8rem" }}
						>
							Masuk untuk mengelola kebaikan
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
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									mb: 0.5,
								}}
							>
								<Typography
									variant="caption"
									sx={{
										fontWeight: 600,
										color: "text.primary",
										fontSize: "0.75rem",
									}}
								>
									Password
								</Typography>
								<MuiLink
									href="#"
									underline="hover"
									sx={{ fontSize: 11, fontWeight: 500, color: "primary.main" }}
								>
									Lupa Password?
								</MuiLink>
							</Box>
							<TextField
								name="password"
								placeholder="Masukkan password anda"
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
							{loading ? "Sedang Memproses..." : "Masuk Sekarang"}
						</Button>
					</Stack>

					<Stack spacing={1} sx={{ mt: 3, textAlign: "center" }}>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontSize: "0.8rem" }}
						>
							Belum punya akun?{" "}
							<MuiLink
								href="/auth/register"
								sx={{
									fontWeight: 700,
									color: "primary.main",
									textDecoration: "none",
									"&:hover": { textDecoration: "underline" },
								}}
							>
								Daftar Sekarang
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
