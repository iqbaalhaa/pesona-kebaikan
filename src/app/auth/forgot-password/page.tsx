"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
	Box,
	Typography,
	Paper,
	Stack,
	Button,
	Alert,
	InputAdornment,
	Container,
} from "@mui/material";
import { StyledTextField } from "@/components/ui/StyledTextField";
import { EmailOutlined, ArrowBack } from "@mui/icons-material";
import { requestPasswordReset } from "@/actions/reset-password";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		try {
			const result = await requestPasswordReset(email);

			if (result.error) {
				setError(result.error);
			} else {
				setSuccess(result.success || "Link reset password telah dikirim ke email Anda. Cek kotak masuk (Inbox), jika tidak ada periksa folder Spam/Promosi.");
			}
		} catch (err) {
			setError("Terjadi kesalahan sistem");
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
							<EmailOutlined sx={{ color: "white", fontSize: 20 }} />
						</Box>
						<Typography
							variant="h6"
							sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}
						>
							Lupa Password?
						</Typography>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ fontSize: "0.8rem" }}
						>
							Masukkan email Anda untuk mereset password
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
									Email
								</Typography>
								<StyledTextField
									name="email"
									placeholder="nama@email.com"
									type="email"
									fullWidth
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={loading || !!success}
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
								{loading ? "Mengirim..." : success ? "Terkirim" : "Kirim Link Reset Password"}
							</Button>
						</Stack>
					</form>
				</Paper>
			</Container>
		</Box>
	);
}
