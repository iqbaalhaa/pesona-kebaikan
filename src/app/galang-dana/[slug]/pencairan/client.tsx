"use client";

import React, { useState } from "react";
import {
	Box,
	Container,
	Typography,
	Stack,
	Button,
	Card,
	CardContent,
	TextField,
	Alert,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Chip,
	Paper,
	Divider,
	IconButton,
	MenuItem,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { LinkIconButton } from "@/components/ui/LinkButton";
import { requestWithdrawal } from "@/actions/campaign-admin";
import { useRouter } from "next/navigation";
import { getBankName } from "@/lib/banks";

function idr(n: number) {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(n);
}

function formatIDR(numStr: string) {
	const n = numStr.replace(/\D/g, "");
	if (!n) return "";
	return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function WithdrawalList({
	campaign,
	withdrawals,
}: {
	campaign: any;
	withdrawals: any[];
}) {
	const router = useRouter();

	const [openWithdrawal, setOpenWithdrawal] = useState(false);
	const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
	const [withdrawalForm, setWithdrawalForm] = useState({
		amount: "",
		bankName: "",
		bankAccount: "",
		accountHolder: "",
		notes: "",
	});
	const [withdrawalError, setWithdrawalError] = useState("");
	const [bankChoice, setBankChoice] = useState("");

	const available = Math.max(
		0,
		(campaign.collected || 0) -
			(campaign.totalFees || 0) -
			(campaign.foundationFeeAmount || 0) -
			withdrawals.reduce(
				(acc, w) => acc + (w.status !== "REJECTED" ? Number(w.amount) : 0),
				0,
			),
	);

	const handleWithdrawalSubmit = async () => {
		if (
			!withdrawalForm.amount ||
			!withdrawalForm.bankName ||
			!withdrawalForm.bankAccount ||
			!withdrawalForm.accountHolder ||
			!withdrawalForm.notes.trim()
		) {
			setWithdrawalError("Mohon lengkapi semua data wajib.");
			return;
		}

		const amount = Number(withdrawalForm.amount.replace(/\./g, ""));
		if (isNaN(amount) || amount <= 0) {
			setWithdrawalError("Jumlah penarikan tidak valid.");
			return;
		}

		if (amount > available) {
			setWithdrawalError("Saldo tidak mencukupi.");
			return;
		}

		setSubmittingWithdrawal(true);
		setWithdrawalError("");

		try {
			const res = await requestWithdrawal({
				campaignId: campaign.id,
				amount,
				bankName: withdrawalForm.bankName,
				bankAccount: withdrawalForm.bankAccount,
				accountHolder: withdrawalForm.accountHolder,
				notes: withdrawalForm.notes,
			});

			if (res.success) {
				setOpenWithdrawal(false);
				setWithdrawalForm({
					amount: "",
					bankName: "",
					bankAccount: "",
					accountHolder: "",
					notes: "",
				});
				router.refresh();
			} else {
				setWithdrawalError(res.error || "Gagal mengajukan pencairan.");
			}
		} catch {
			setWithdrawalError("Terjadi kesalahan sistem.");
		} finally {
			setSubmittingWithdrawal(false);
		}
	};

	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			{/* Header */}
			<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
				<LinkIconButton href={`/galang-dana/${campaign.slug || campaign.id}`}>
					<ArrowBackRoundedIcon />
				</LinkIconButton>
				<Box>
					<Typography variant="h5" fontWeight={700}>
						Pencairan Dana
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{campaign.title}
					</Typography>
				</Box>
			</Stack>

			<Stack spacing={3}>
				{!campaign.ownerVerified && (
					<Alert severity="warning" sx={{ borderRadius: 2 }}>
						Akun Anda belum/tidak lagi terverifikasi. Verifikasi akun terlebih
						dahulu di halaman Profil untuk bisa mengajukan pencairan dana.
					</Alert>
				)}

				{/* Saldo Card */}
				<Card
					elevation={0}
					sx={{
						borderRadius: 3,
						bgcolor: "primary.main",
						color: "white",
					}}
				>
					<CardContent sx={{ p: 3 }}>
						<Stack spacing={2}>
							<Box>
								<Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
									Saldo Tersedia
								</Typography>
								<Typography
									variant="h4"
									fontWeight={800}
									sx={{ wordBreak: "break-word" }}
								>
									{idr(available)}
								</Typography>
							</Box>
							<Button
								fullWidth
								variant="contained"
								color="inherit"
								startIcon={<AddRoundedIcon />}
								onClick={() => setOpenWithdrawal(true)}
								disabled={!campaign.ownerVerified}
								sx={{
									color: "primary.main",
									bgcolor: "white",
									"&:hover": { bgcolor: "grey.100" },
									fontWeight: 700,
									borderRadius: 999,
									py: 1,
									boxShadow: "none",
								}}
							>
								Ajukan Pencairan
							</Button>
						</Stack>
					</CardContent>
				</Card>

				{/* Riwayat */}
				<Box>
					<Typography variant="h6" fontWeight={700} gutterBottom>
						Riwayat Pencairan
					</Typography>
					{withdrawals.length === 0 ? (
						<Paper
							elevation={0}
							sx={{
								p: 4,
								textAlign: "center",
								borderRadius: 3,
								border: "1px solid",
								borderColor: "divider",
								bgcolor: "grey.50",
							}}
						>
							<Box
								sx={{
									width: 48,
									height: 48,
									mx: "auto",
									mb: 1.5,
									borderRadius: 999,
									bgcolor: "rgba(15,118,110,0.08)",
									color: "primary.main",
									display: "grid",
									placeItems: "center",
								}}
							>
								<AccountBalanceWalletRoundedIcon fontSize="small" />
							</Box>
							<Typography color="text.secondary">
								Belum ada riwayat pencairan dana.
							</Typography>
						</Paper>
					) : (
						<Stack spacing={2}>
							{withdrawals.map((w) => (
								<Paper
									key={w.id}
									elevation={0}
									sx={{
										p: 2,
										borderRadius: 3,
										border: "1px solid",
										borderColor: "divider",
									}}
								>
									<Stack
										direction={{ xs: "column", sm: "row" }}
										justifyContent="space-between"
										alignItems={{ xs: "start", sm: "center" }}
										spacing={2}
									>
										<Box>
											<Stack
												direction="row"
												alignItems="center"
												spacing={1}
												sx={{ mb: 0.5 }}
											>
												<Typography fontWeight={700} fontSize={16}>
													{idr(Number(w.amount))}
												</Typography>
												<Chip
													label={
														w.status === "COMPLETED"
															? "Selesai"
															: w.status === "APPROVED"
																? "Disetujui"
																: w.status === "REJECTED"
																	? "Ditolak"
																	: "Menunggu"
													}
													size="small"
													color={
														w.status === "COMPLETED" || w.status === "APPROVED"
															? "success"
															: w.status === "REJECTED"
																? "error"
																: "warning"
													}
													sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
												/>
											</Stack>
											<Typography variant="body2" color="text.secondary">
												{new Date(w.createdAt).toLocaleDateString("id-ID", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}{" "}
												• {getBankName(w.bankName)} - {w.bankAccount} ({w.accountHolder})
											</Typography>
											{w.notes && (
												<Typography
													variant="caption"
													display="block"
													sx={{ mt: 0.5, fontStyle: "italic", color: "text.secondary" }}
												>
													Catatan: {w.notes}
												</Typography>
											)}
											{w.status === "REJECTED" && w.rejectionReason && (
												<Typography
													variant="caption"
													display="block"
													sx={{ mt: 0.5, color: "error.main", fontWeight: 600 }}
												>
													Alasan penolakan: {w.rejectionReason}
												</Typography>
											)}
											{w.status === "COMPLETED" && w.proofUrl && (
												<Stack sx={{ mt: 1 }} spacing={0.25}>
													{w.senderBank && w.senderAccount && (
														<Typography
															variant="caption"
															display="block"
															color="text.secondary"
														>
															Ditransfer dari {getBankName(w.senderBank)} - {w.senderAccount}
														</Typography>
													)}
													<Button
														size="small"
														href={w.proofUrl}
														target="_blank"
														rel="noopener noreferrer"
														sx={{ alignSelf: "flex-start", textTransform: "none", px: 0, minWidth: 0 }}
													>
														Lihat bukti transfer
													</Button>
												</Stack>
											)}
										</Box>
									</Stack>
								</Paper>
							))}
						</Stack>
					)}
				</Box>
			</Stack>

			{/* Withdrawal Dialog */}
			<Dialog
				open={openWithdrawal}
				onClose={() => setOpenWithdrawal(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}
			>
				<DialogTitle
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						px: 3,
						pt: 2.5,
						pb: 1.5,
					}}
				>
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Box
							sx={{
								width: 40,
								height: 40,
								borderRadius: 999,
								bgcolor: "rgba(15,118,110,0.08)",
								color: "#0f766e",
								display: "grid",
								placeItems: "center",
							}}
						>
							<AccountBalanceWalletRoundedIcon fontSize="small" />
						</Box>
						<Box>
							<Typography sx={{ fontWeight: 800, fontSize: 16 }}>
								Ajukan Pencairan Dana
							</Typography>
							<Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.2 }}>
								Tarik dana yang sudah terkumpul ke rekening penerima.
							</Typography>
						</Box>
					</Stack>
					<IconButton
						size="small"
						onClick={() => setOpenWithdrawal(false)}
						sx={{ color: "text.secondary" }}
					>
						<CloseRoundedIcon fontSize="small" />
					</IconButton>
				</DialogTitle>
				<DialogContent sx={{ px: 3, pb: 2.5, pt: 0 }}>
					<Paper
						variant="outlined"
						sx={{
							p: 1.75,
							mb: 2.5,
							borderRadius: 2,
							bgcolor: "rgba(240,253,250,1)",
							borderColor: "rgba(16,185,129,0.25)",
						}}
					>
						<Stack direction="row" justifyContent="space-between" spacing={1}>
							<Box>
								<Typography sx={{ fontSize: 11.5, color: "text.secondary", mb: 0.5 }}>
									Saldo tersedia untuk dicairkan
								</Typography>
								<Typography sx={{ fontWeight: 800, fontSize: 18 }}>
									{idr(available)}
								</Typography>
							</Box>
							<Chip
								label="Bersih setelah potongan"
								size="small"
								sx={{
									alignSelf: "center",
									fontSize: 11,
									fontWeight: 700,
									bgcolor: "rgba(16,185,129,0.08)",
									color: "#047857",
								}}
							/>
						</Stack>
					</Paper>

					<Stack spacing={1.75}>
						{withdrawalError && (
							<Alert severity="error" sx={{ borderRadius: 2 }}>
								{withdrawalError}
							</Alert>
						)}
						<TextField
							label="Jumlah penarikan"
							fullWidth
							value={withdrawalForm.amount}
							onChange={(e) => {
								const digits = (e.target.value || "").replace(/\D/g, "");
								if (!digits) {
									setWithdrawalForm({ ...withdrawalForm, amount: "" });
									return;
								}
								const safe = Math.min(Number(digits), Math.max(0, available));
								setWithdrawalForm({ ...withdrawalForm, amount: formatIDR(String(safe)) });
							}}
							InputProps={{
								startAdornment: (
									<Box sx={{ mr: 1, fontSize: 13, color: "text.secondary" }}>Rp</Box>
								),
							}}
							placeholder="Contoh: 5.000.000"
							helperText={`Maksimal ${idr(available)}`}
						/>
						<Divider />
						<TextField
							select
							label="Nama bank"
							fullWidth
							value={bankChoice}
							onChange={(e) => {
								const v = e.target.value;
								setBankChoice(v);
								setWithdrawalForm({
									...withdrawalForm,
									bankName: v !== "OTHER" ? v : "",
								});
							}}
							helperText="Pilih bank tujuan pencairan"
						>
							<MenuItem value="">Pilih bank</MenuItem>
							<MenuItem value="BCA">BCA</MenuItem>
							<MenuItem value="MANDIRI">Mandiri</MenuItem>
							<MenuItem value="BRI">BRI</MenuItem>
							<MenuItem value="BNI">BNI</MenuItem>
							<MenuItem value="BSI">BSI</MenuItem>
							<MenuItem value="BTN">BTN</MenuItem>
							<MenuItem value="CIMB">CIMB Niaga</MenuItem>
							<MenuItem value="PERMATA">Permata</MenuItem>
							<MenuItem value="OTHER">Lainnya</MenuItem>
						</TextField>
						{bankChoice === "OTHER" && (
							<TextField
								label="Nama bank lainnya"
								fullWidth
								placeholder="Contoh: Bank Jago"
								value={withdrawalForm.bankName}
								onChange={(e) =>
									setWithdrawalForm({ ...withdrawalForm, bankName: e.target.value })
								}
							/>
						)}
						<TextField
							label="Nomor rekening"
							fullWidth
							type="number"
							value={withdrawalForm.bankAccount}
							onChange={(e) =>
								setWithdrawalForm({ ...withdrawalForm, bankAccount: e.target.value })
							}
						/>
						<TextField
							label="Atas nama"
							fullWidth
							value={withdrawalForm.accountHolder}
							onChange={(e) =>
								setWithdrawalForm({ ...withdrawalForm, accountHolder: e.target.value })
							}
						/>
						<TextField
							label="Catatan keperluan *"
							fullWidth
							multiline
							rows={3}
							required
							placeholder="Contoh: Pencairan tahap 1 untuk biaya rumah sakit."
							value={withdrawalForm.notes}
							onChange={(e) =>
								setWithdrawalForm({ ...withdrawalForm, notes: e.target.value })
							}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ px: 3, py: 2, bgcolor: "rgba(248,250,252,1)" }}>
					<Button
						onClick={() => setOpenWithdrawal(false)}
						sx={{ fontWeight: 700, textTransform: "none" }}
					>
						Batal
					</Button>
					<Button
						variant="contained"
						onClick={handleWithdrawalSubmit}
						disabled={submittingWithdrawal}
						sx={{
							borderRadius: 999,
							px: 3,
							fontWeight: 800,
							textTransform: "none",
							boxShadow: "none",
						}}
					>
						{submittingWithdrawal ? "Mengirim..." : "Ajukan pencairan"}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
