"use client";

import * as React from "react";
import { useState } from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Link,
	Paper,
	InputAdornment,
	IconButton,
	Alert,
	CircularProgress,
} from "@mui/material";
import NextLink from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState(searchParams.get("error") || "");
	const registered = searchParams.get("registered");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const res = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (res?.error) {
				setError("Email atau password salah");
				setLoading(false);
			} else {
				const callbackUrl = searchParams.get("callbackUrl") || "/profil";
				router.push(callbackUrl);
				router.refresh();
			}
		} catch (err) {
			setError("Terjadi kesalahan. Silakan coba lagi.");
			setLoading(false);
		}
	};

	return (
		<Paper
			elevation={0}
			className="p-8 sm:p-10 border border-gray-100 dark:border-gray-800 rounded-3xl"
			sx={{
				backgroundColor: "background.paper",
				boxShadow: "0 4px 20px -2px rgba(0,0,0,0.05)",
			}}
		>
			{/* Back Button */}
			<Box sx={{ mb: 4 }}>
				<Link
					component={NextLink}
					href="/"
					className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary no-underline transition-colors"
				>
					<ArrowBackIcon fontSize="small" />
					Kembali ke Beranda
				</Link>
			</Box>

			<div className="text-center mb-8">
				<Box className="flex justify-center mb-4">
					<div className="relative w-12 h-12">
						<Image
							src="/brand/logo.png"
							alt="Logo"
							fill
							className="object-contain"
						/>
					</div>
				</Box>
				<Typography variant="h5" className="font-bold mb-2">
					Selamat Datang Kembali
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Masuk untuk melanjutkan kebaikan Anda
				</Typography>
			</div>

			{registered && (
				<Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
					Registrasi berhasil! Silakan login.
				</Alert>
			)}

			{error && (
				<Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
					{error}
				</Alert>
			)}

			<Box component="form" onSubmit={handleSubmit} className="space-y-5">
				<TextField
					name="email"
					fullWidth
					label="Email Address"
					type="email"
					placeholder="nama@email.com"
					required
					disabled={loading}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<EmailOutlinedIcon color="action" fontSize="small" />
							</InputAdornment>
						),
						sx: { borderRadius: 3 },
					}}
				/>

				<TextField
					name="password"
					fullWidth
					label="Password"
					type={showPassword ? "text" : "password"}
					placeholder="••••••••"
					required
					disabled={loading}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<LockOutlinedIcon color="action" fontSize="small" />
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
										<VisibilityOff fontSize="small" />
									) : (
										<Visibility fontSize="small" />
									)}
								</IconButton>
							</InputAdornment>
						),
						sx: { borderRadius: 3 },
					}}
				/>

				<Box className="flex justify-end">
					<Link
						component={NextLink}
						href="/auth/forgot-password"
						variant="caption"
						className="font-semibold text-primary hover:underline no-underline"
					>
						Lupa Password?
					</Link>
				</Box>

				<Button
					type="submit"
					fullWidth
					variant="contained"
					size="large"
					disabled={loading}
					sx={{
						borderRadius: 3,
						py: 1.5,
						fontWeight: 700,
						textTransform: "none",
						boxShadow: "0 8px 16px -4px rgba(97, 206, 112, 0.25)",
					}}
				>
					{loading ? (
						<CircularProgress size={24} color="inherit" />
					) : (
						"Masuk Sekarang"
					)}
				</Button>

				<div className="text-center mt-6">
					<Typography variant="body2" color="text.secondary">
						Belum punya akun?{" "}
						<Link
							component={NextLink}
							href="/auth/register"
							className="font-bold text-primary hover:underline no-underline"
						>
							Daftar Sekarang
						</Link>
					</Typography>
				</div>
			</Box>
		</Paper>
	);
}
