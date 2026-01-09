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
	Tabs,
	Tab,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { LinkIconButton } from "@/components/ui/LinkButton";
import { requestWithdrawal, createCampaignUpdate } from "@/actions/campaign";
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
	updates,
}: {
	campaign: any;
	withdrawals: any[];
	updates: any[];
}) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState(0);

	// Withdrawal State
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

	// Update State
	const [openUpdate, setOpenUpdate] = useState(false);
	const [submittingUpdate, setSubmittingUpdate] = useState(false);
	const [updateForm, setUpdateForm] = useState({
		title: "",
		content: "",
		amount: "",
	});
	const [updateError, setUpdateError] = useState("");

	const available =
		campaign.collected -
		withdrawals.reduce(
			(acc, w) => acc + (w.status !== "REJECTED" ? Number(w.amount) : 0),
			0
		);

	const handleWithdrawalSubmit = async () => {
		if (
			!withdrawalForm.amount ||
			!withdrawalForm.bankName ||
			!withdrawalForm.bankAccount ||
			!withdrawalForm.accountHolder
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
		} catch (err) {
			setWithdrawalError("Terjadi kesalahan sistem.");
		} finally {
			setSubmittingWithdrawal(false);
		}
	};

	const handleUpdateSubmit = async () => {
		if (!updateForm.title || !updateForm.content) {
			setUpdateError("Judul dan isi kabar wajib diisi.");
			return;
		}

		setSubmittingUpdate(true);
		setUpdateError("");

		try {
			const res = await createCampaignUpdate({
				campaignId: campaign.id,
				title: updateForm.title,
				content: updateForm.content,
				amount: updateForm.amount ? Number(updateForm.amount) : undefined,
				// images: [] // TODO: Add image upload support if needed
			});

			if (res.success) {
				setOpenUpdate(false);
				setUpdateForm({
					title: "",
					content: "",
					amount: "",
				});
				router.refresh();
			} else {
				setUpdateError(res.error || "Gagal memposting update.");
			}
		} catch (err) {
			setUpdateError("Terjadi kesalahan sistem.");
		} finally {
			setSubmittingUpdate(false);
		}
	};

	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			{/* Header */}
			<Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
				<LinkIconButton href={`/galang-dana/${campaign.slug || campaign.id}`}>
					<ArrowBackRoundedIcon />
				</LinkIconButton>
				<Typography variant="h5" fontWeight={700}>
					Kelola Dana & Update
				</Typography>
			</Stack>

			{/* Tabs */}
			<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
				<Tabs
					value={activeTab}
					onChange={(e, v) => setActiveTab(v)}
					variant="scrollable"
					scrollButtons="auto"
				>
					<Tab label="Pencairan Dana" />
					<Tab label="Update Penyaluran (Kabar)" />
				</Tabs>
			</Box>

			{activeTab === 0 && (
				<Stack spacing={3}>
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
							<Stack
								direction={{ xs: "column", sm: "row" }}
								justifyContent="space-between"
								alignItems={{ xs: "start", sm: "center" }}
								spacing={2}
							>
								<Box>
									<Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
										Saldo Tersedia
									</Typography>
									<Typography variant="h4" fontWeight={800}>
										{idr(available)}
									</Typography>
								</Box>
								<Button
									variant="contained"
									color="inherit"
									startIcon={<AddRoundedIcon />}
									onClick={() => setOpenWithdrawal(true)}
									sx={{
										color: "primary.main",
										bgcolor: "white",
										"&:hover": { bgcolor: "grey.100" },
										fontWeight: 700,
									}}
								>
									Ajukan Pencairan
								</Button>
							</Stack>
						</CardContent>
					</Card>

					{/* History */}
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
															w.status === "COMPLETED" ||
															w.status === "APPROVED"
																? "success"
																: w.status === "REJECTED"
																? "error"
																: "warning"
														}
														sx={{
															height: 20,
															fontSize: 10,
															fontWeight: 700,
														}}
													/>
												</Stack>
												<Typography variant="body2" color="text.secondary">
													{new Date(w.createdAt).toLocaleDateString("id-ID", {
														day: "numeric",
														month: "long",
														year: "numeric",
													})}{" "}
													• {getBankName(w.bankName)} - {w.bankAccount} (
													{w.accountHolder})
												</Typography>
												{w.notes && (
													<Typography
														variant="caption"
														display="block"
														sx={{ mt: 0.5, fontStyle: "italic" }}
													>
														Catatan: {w.notes}
													</Typography>
												)}
											</Box>
										</Stack>
									</Paper>
								))}
							</Stack>
						)}
					</Box>
				</Stack>
			)}

			{activeTab === 1 && (
				<Stack spacing={3}>
					<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
						<Button
							variant="contained"
							startIcon={<AddRoundedIcon />}
							onClick={() => setOpenUpdate(true)}
							sx={{ fontWeight: 700 }}
						>
							Tulis Kabar Baru
						</Button>
					</Box>

					{updates.length === 0 ? (
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
							<Typography color="text.secondary">
								Belum ada update penyaluran atau kabar terbaru.
							</Typography>
						</Paper>
					) : (
						<Stack spacing={2}>
							{updates.map((u) => (
								<Paper
									key={u.id}
									elevation={0}
									sx={{
										p: 2,
										borderRadius: 3,
										border: "1px solid",
										borderColor: "divider",
									}}
								>
									<Stack direction="row" alignItems="flex-start" spacing={2}>
										<VerifiedUserIcon color="success" />
										<Box>
											<Typography fontWeight={700} fontSize={16}>
												{u.title}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
												gutterBottom
											>
												{new Date(u.createdAt).toLocaleDateString("id-ID", {
													day: "numeric",
													month: "long",
													year: "numeric",
													hour: "2-digit",
													minute: "2-digit",
												})}
											</Typography>
											<Typography
												variant="body2"
												color="text.secondary"
												sx={{ whiteSpace: "pre-wrap", mt: 1 }}
											>
												{u.content}
											</Typography>
											{u.amount && (
												<Chip
													label={`Dana tersalurkan: ${idr(Number(u.amount))}`}
													size="small"
													color="success"
													variant="outlined"
													sx={{ mt: 1, fontWeight: 600 }}
												/>
											)}
										</Box>
									</Stack>
								</Paper>
							))}
						</Stack>
					)}
				</Stack>
			)}

			{/* Withdrawal Dialog */}
			<Dialog
				open={openWithdrawal}
				onClose={() => setOpenWithdrawal(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Ajukan Pencairan Dana</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						{withdrawalError && (
							<Alert severity="error">{withdrawalError}</Alert>
						)}
						<TextField
							label="Jumlah Penarikan (Rp)"
							fullWidth
							value={withdrawalForm.amount}
							onChange={(e) =>
								setWithdrawalForm({
									...withdrawalForm,
									amount: formatIDR(e.target.value),
								})
							}
							helperText={`Maksimal: ${idr(available)}`}
						/>
						<TextField
							label="Nama Bank"
							fullWidth
							placeholder="Contoh: BCA, Mandiri, BRI"
							value={withdrawalForm.bankName}
							onChange={(e) =>
								setWithdrawalForm({
									...withdrawalForm,
									bankName: e.target.value,
								})
							}
						/>
						<TextField
							label="Nomor Rekening"
							fullWidth
							type="number"
							value={withdrawalForm.bankAccount}
							onChange={(e) =>
								setWithdrawalForm({
									...withdrawalForm,
									bankAccount: e.target.value,
								})
							}
						/>
						<TextField
							label="Atas Nama"
							fullWidth
							value={withdrawalForm.accountHolder}
							onChange={(e) =>
								setWithdrawalForm({
									...withdrawalForm,
									accountHolder: e.target.value,
								})
							}
						/>
						<TextField
							label="Catatan Keperluan"
							fullWidth
							multiline
							rows={3}
							value={withdrawalForm.notes}
							onChange={(e) =>
								setWithdrawalForm({ ...withdrawalForm, notes: e.target.value })
							}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenWithdrawal(false)}>Batal</Button>
					<Button
						variant="contained"
						onClick={handleWithdrawalSubmit}
						disabled={submittingWithdrawal}
					>
						{submittingWithdrawal ? "Mengirim..." : "Ajukan"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Update Dialog */}
			<Dialog
				open={openUpdate}
				onClose={() => setOpenUpdate(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Tulis Kabar Terbaru</DialogTitle>
				<DialogContent>
					<Stack spacing={2} sx={{ mt: 1 }}>
						{updateError && <Alert severity="error">{updateError}</Alert>}
						<TextField
							label="Judul Kabar"
							fullWidth
							placeholder="Contoh: Penyaluran Dana Tahap 1"
							value={updateForm.title}
							onChange={(e) =>
								setUpdateForm({ ...updateForm, title: e.target.value })
							}
						/>
						<TextField
							label="Isi Kabar"
							fullWidth
							multiline
							rows={6}
							placeholder="Ceritakan perkembangan terbaru atau Useran dana..."
							value={updateForm.content}
							onChange={(e) =>
								setUpdateForm({ ...updateForm, content: e.target.value })
							}
						/>
						<TextField
							label="Jumlah Dana Disalurkan (Opsional)"
							fullWidth
							value={updateForm.amount}
							onChange={(e) =>
								setUpdateForm({
									...updateForm,
									amount: formatIDR(e.target.value),
								})
							}
							helperText="Isi jika update ini berkaitan dengan penyaluran dana tertentu."
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setOpenUpdate(false)}>Batal</Button>
					<Button
						variant="contained"
						onClick={handleUpdateSubmit}
						disabled={submittingUpdate}
					>
						{submittingUpdate ? "Memposting..." : "Posting Kabar"}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}
