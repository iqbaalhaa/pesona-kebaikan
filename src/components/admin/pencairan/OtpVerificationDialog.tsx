"use client";

import React, { useState, useRef, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Stack,
	Alert,
	CircularProgress,
	Box,
	Snackbar,
	useTheme,
} from "@mui/material";
import { requestOtp } from "@/actions/otp";
import { WithdrawalRow } from "./WithdrawalCard";

interface OtpVerificationDialogProps {
	withdrawal: WithdrawalRow | null;
	onVerified: (otp: string) => Promise<void>;
	adminPhone: string;
}

function idr(n: number) {
	if (!n) return "Rp0";
	const s = Math.round(n).toString();
	return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function OtpVerificationDialog({
	open,
	onClose,
	withdrawal,
	onVerified,
	adminPhone,
}: OtpVerificationDialogProps) {
	const theme = useTheme();
	const [step, setStep] = useState<"request" | "verify">("request");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
	const [timeLeft, setTimeLeft] = useState(0);
	const [snackbar, setSnackbar] = useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info";
	}>({
		open: false,
		message: "",
		severity: "success",
	});

	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	// Reset state when dialog opens
	useEffect(() => {
		if (open) {
			setStep("request");
			setError("");
			setOtp(new Array(6).fill(""));
			setLoading(false);
			setTimeLeft(0);
		}
	}, [open]);

	// Timer countdown
	useEffect(() => {
		if (timeLeft <= 0) return;
		const interval = setInterval(() => {
			setTimeLeft((prev) => prev - 1);
		}, 1000);
		return () => clearInterval(interval);
	}, [timeLeft]);

	const formatTime = (seconds: number) => {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		return `${m}:${s < 10 ? "0" : ""}${s}`;
	};

	const handleRequestOtp = async () => {
		if (!withdrawal) return;
		setLoading(true);
		setError("");

		if (process.env.NEXT_PUBLIC_BYPASS_OTP === "true") {
			setStep("verify");
			setOtp(["0", "0", "0", "0", "0", "0"]);
			setSnackbar({
				open: true,
				message: "Development Mode: OTP Bypassed",
				severity: "info",
			});
			setLoading(false);
			return;
		}

		try {
			const res = await requestOtp(
				adminPhone,
				withdrawal.campaignTitle,
				idr(withdrawal.amount),
				withdrawal.campaignSlug || undefined,
			);

			if (res.success) {
				setStep("verify");
				setTimeLeft(300); // 5 minutes
				setSnackbar({
					open: true,
					message: "OTP berhasil dikirim ke WhatsApp",
					severity: "success",
				});
			} else {
				setError(res.error || "Gagal mengirim OTP");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Terjadi kesalahan");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async () => {
		setLoading(true);
		setError("");

		try {
			const otpString = otp.join("");
			// Pass verification to parent (server action)
			// Parent should throw error if verification fails
			await onVerified(otpString);
			onClose();
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Terjadi kesalahan verifikasi";
			setError(msg);
			setSnackbar({
				open: true,
				message: msg,
				severity: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleOtpChange = (index: number, value: string) => {
		if (isNaN(Number(value))) return;

		const newOtp = [...otp];
		// Handle paste? For now just single char
		newOtp[index] = value.substring(value.length - 1);
		setOtp(newOtp);

		// Focus next
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>,
	) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
		if (pastedData.length === 0) return;

		const newOtp = [...otp];
		pastedData.forEach((char, index) => {
			if (index < 6 && !isNaN(Number(char))) {
				newOtp[index] = char;
			}
		});
		setOtp(newOtp);

		// Focus the next empty or the last filled
		const nextIndex = Math.min(pastedData.length, 5);
		inputRefs.current[nextIndex]?.focus();
	};

	return (
		<>
			<Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
				<DialogTitle>Verifikasi Pencairan</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ pt: 1 }}>
						<Typography variant="body2" color="text.secondary">
							Untuk alasan keamanan, Anda perlu memverifikasi pencairan dana ini
							melalui OTP yang dikirim ke WhatsApp Anda ({adminPhone}).
						</Typography>

						{error && <Alert severity="error">{error}</Alert>}

						{step === "request" ? (
							<Box>
								<Typography variant="subtitle2" fontWeight={700} gutterBottom>
									Detail Pencairan:
								</Typography>
								<Typography variant="body2">
									Campaign: {withdrawal?.campaignTitle}
								</Typography>
								<Typography variant="body2">
									Nominal: {withdrawal && idr(withdrawal.amount)}
								</Typography>
							</Box>
						) : (
							<Box>
								<Typography variant="caption" sx={{ mb: 1, display: "block" }}>
									Masukkan 6 digit kode OTP
								</Typography>
								<Stack
									direction="row"
									spacing={1}
									justifyContent="center"
									onPaste={handlePaste}
								>
									{otp.map((digit, index) => (
										<Box
											component="input"
											key={index}
											ref={(el: HTMLInputElement | null) => {
												inputRefs.current[index] = el;
											}}
											value={digit}
											onChange={(e) => handleOtpChange(index, e.target.value)}
											onKeyDown={(e) => handleKeyDown(index, e)}
											sx={{
												width: 40,
												height: 48,
												fontSize: "1.25rem",
												textAlign: "center",
												borderRadius: 1,
												border: `1px solid ${theme.palette.divider}`,
												outline: "none",
												"&:focus": {
													borderColor: theme.palette.primary.main,
													boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
												},
											}}
										/>
									))}
								</Stack>
								<Box sx={{ mt: 2, textAlign: "center" }}>
									{timeLeft > 0 ? (
										<Typography variant="body2" color="text.secondary">
											Kirim ulang dalam {formatTime(timeLeft)}
										</Typography>
									) : (
										<Button
											variant="text"
											size="small"
											onClick={handleRequestOtp}
											disabled={loading}
										>
											Kirim Ulang OTP
										</Button>
									)}
								</Box>
							</Box>
						)}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button onClick={onClose} disabled={loading}>
						Batal
					</Button>
					{step === "request" ? (
						<Button
							variant="contained"
							onClick={handleRequestOtp}
							disabled={loading}
						>
							{loading ? <CircularProgress size={24} /> : "Kirim OTP"}
						</Button>
					) : (
						<Button
							variant="contained"
							onClick={handleVerifyOtp}
							disabled={loading || otp.some((d) => !d)}
						>
							{loading ? <CircularProgress size={24} /> : "Verifikasi"}
						</Button>
					)}
				</DialogActions>
			</Dialog>

			<Snackbar
				open={snackbar.open}
				autoHideDuration={6000}
				onClose={() => setSnackbar({ ...snackbar, open: false })}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setSnackbar({ ...snackbar, open: false })}
					severity={snackbar.severity}
					variant="filled"
					sx={{ width: "100%" }}
				>
					{snackbar.message}
				</Alert>
			</Snackbar>
		</>
	);
}
