"use client";

import React from "react";
import {
	Box,
	Paper,
	Typography,
	Stack,
	Button,
	TextField,
	InputAdornment,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Divider,
	Pagination,
	Skeleton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert,
	Snackbar,
	SxProps,
	Theme,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

import {
	getWithdrawals,
	getCampaignsWithFunds,
	createWithdrawal,
	updateWithdrawalStatus,
	getPayoutsCapability,
} from "@/actions/pencairan";

import WithdrawalCard, {
	WithdrawalRow,
	WithdrawalStatus,
} from "@/components/admin/pencairan/WithdrawalCard";
import OtpVerificationDialog from "@/components/admin/pencairan/OtpVerificationDialog";
import AdminPhoneDialog from "@/components/admin/pencairan/AdminPhoneDialog";
import { useSession } from "next-auth/react";
import { SUPPORTED_BANKS } from "@/lib/banks";

const PAGE_SIZE = 10;

type CampaignFund = {
	id: string;
	title: string;
	collected: number;
	withdrawn: number;
	available: number;
};

function idr(n: number) {
	if (!n) return "Rp0";
	const s = Math.round(n).toString();
	return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatIDR(numStr: string) {
	const n = numStr.replace(/\D/g, "");
	if (!n) return "";
	return n.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function Surface({
	children,
	sx,
	...props
}: { children: React.ReactNode; sx?: SxProps<Theme> } & Omit<
	React.ComponentProps<typeof Paper>,
	"sx"
>) {
	const theme = useTheme();
	const baseSx = {
		borderRadius: 3,
		borderColor: alpha(theme.palette.divider, 0.6),
		bgcolor: alpha(
			theme.palette.background.default,
			theme.palette.mode === "dark" ? 0.4 : 0.8,
		),
		backdropFilter: "blur(12px)",
		boxShadow: theme.shadows[1],
	};
	const sxProp: SxProps<Theme> = Array.isArray(sx)
		? [baseSx, ...sx]
		: [baseSx, sx];
	return (
		<Paper variant="outlined" sx={sxProp} {...props}>
			{children}
		</Paper>
	);
}

export default function PencairanPage() {
	const { data: session, update: updateSession } = useSession();
	const payoutsEnabled =
		process.env.NEXT_PUBLIC_MIDTRANS_PAYOUTS_ENABLED === "true";
	const [withdrawals, setWithdrawals] = React.useState<WithdrawalRow[]>([]);
	const [campaigns, setCampaigns] = React.useState<CampaignFund[]>([]);
	const [payoutsCapability, setPayoutsCapability] = React.useState<{
		available: boolean;
		message: string;
	} | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [query, setQuery] = React.useState("");
	const [page, setPage] = React.useState(1);
	const [dialogOpen, setDialogOpen] = React.useState(false);

	// OTP State
	const [otpDialogOpen, setOtpDialogOpen] = React.useState(false);
	const [selectedWithdrawalForApproval, setSelectedWithdrawalForApproval] =
		React.useState<WithdrawalRow | null>(null);
	// Reject State
	const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
	const [selectedWithdrawalForRejection, setSelectedWithdrawalForRejection] =
		React.useState<WithdrawalRow | null>(null);
	// Confirm Dialog State
	const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
	const [confirmTarget, setConfirmTarget] = React.useState<{
		id: string;
		status: Exclude<WithdrawalStatus, "PENDING">;
	} | null>(null);

	// Form state
	const [selectedCampaign, setSelectedCampaign] = React.useState<string>("");
	const [amount, setAmount] = React.useState<string>("");
	const [bankName, setBankName] = React.useState("");
	const [bankAccount, setBankAccount] = React.useState("");
	const [accountHolder, setAccountHolder] = React.useState("");
	const [notes, setNotes] = React.useState("");
	const [submitting, setSubmitting] = React.useState(false);
	const [snack, setSnack] = React.useState<{
		open: boolean;
		message: string;
		severity: "success" | "error" | "info";
	}>({ open: false, message: "", severity: "success" });

	// Admin Phone State
	const [adminPhoneDialogOpen, setAdminPhoneDialogOpen] = React.useState(false);
	const [localAdminPhone, setLocalAdminPhone] = React.useState("");

	React.useEffect(() => {
		if (session?.user) {
			const phone = (session.user as { phone?: string })?.phone;
			if (phone) setLocalAdminPhone(phone);
		}
	}, [session]);

	const showSnack = (
		message: string,
		severity: "success" | "error" | "info" = "success",
	) => setSnack({ open: true, message, severity });

	const fetchData = React.useCallback(async () => {
		setLoading(true);
		try {
			const [w, c, cap] = await Promise.all([
				getWithdrawals(),
				getCampaignsWithFunds(),
				getPayoutsCapability(),
			]);
			setWithdrawals(w as unknown as WithdrawalRow[]);
			setCampaigns(c);
			setPayoutsCapability(cap);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleCreate = async () => {
		if (
			!selectedCampaign ||
			!amount ||
			!bankName ||
			!bankAccount ||
			!accountHolder
		)
			return;

		setSubmitting(true);
		try {
			await createWithdrawal({
				campaignId: selectedCampaign,
				amount: Number(amount.replace(/\D/g, "")),
				bankName,
				bankAccount,
				accountHolder,
				notes,
			});
			setDialogOpen(false);
			showSnack("Pencairan berhasil dibuat", "success");
			// Reset form
			setSelectedCampaign("");
			setAmount("");
			setBankName("");
			setBankAccount("");
			setAccountHolder("");
			setNotes("");

			fetchData();
		} catch (e) {
			console.error(e);
			showSnack("Gagal membuat pencairan", "error");
		} finally {
			setSubmitting(false);
		}
	};

	const handleUpdateStatus = async (
		id: string,
		status: Exclude<WithdrawalStatus, "PENDING">,
	) => {
		try {
			if (status === "REJECTED") {
				const row = withdrawals.find((w) => w.id === id) || null;
				setSelectedWithdrawalForRejection(row);
				setRejectDialogOpen(true);
				return;
			}
			setConfirmTarget({ id, status });
			setConfirmDialogOpen(true);
		} catch (e) {
			console.error(e);
			showSnack("Gagal update status", "error");
		}
	};

	const handleApproveClick = (row: WithdrawalRow) => {
		setSelectedWithdrawalForApproval(row);
		setOtpDialogOpen(true);
	};

	const handleOtpVerified = async (otp: string) => {
		if (!selectedWithdrawalForApproval) return;
		try {
			// Always send OTP for approval, regardless of payout mode
			const res = await updateWithdrawalStatus(
				selectedWithdrawalForApproval.id,
				"APPROVED",
				undefined,
				otp,
				undefined,
				adminPhone,
			);

			if (!res?.success) {
				showSnack(res?.error || "Gagal menyetujui pencairan", "error");
				return;
			}
			fetchData();
			showSnack(
				res.payoutMode === "IRIS"
					? "Pencairan berhasil disetujui (Midtrans Iris)"
					: "Pencairan disetujui (mode manual). Lakukan transfer, lalu klik Selesai Transfer.",
				"success",
			);
		} catch (e) {
			console.error(e);
			showSnack("Gagal menyetujui pencairan", "error");
		} finally {
			setSelectedWithdrawalForApproval(null);
		}
	};

	const filtered = withdrawals.filter((w) => {
		if (!query) return true;
		const s = query.toLowerCase();
		return (
			w.campaignTitle.toLowerCase().includes(s) ||
			w.accountHolder.toLowerCase().includes(s) ||
			w.bankName.toLowerCase().includes(s)
		);
	});

	const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

	const selectedCampaignData = campaigns.find((c) => c.id === selectedCampaign);

	// Use session user phone or a default/fallback
	// Note: user.phone might not be in the default session type unless extended
	const adminPhone = localAdminPhone || "085382055598";

	return (
		<Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, md: 4 } }}>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				alignItems={{ xs: "start", sm: "center" }}
				justifyContent="space-between"
				spacing={2}
				sx={{ mb: 4 }}
			>
				<Box>
					<Typography sx={{ fontSize: 24, fontWeight: 1000, mb: 0.5 }}>
						Pencairan Dana
					</Typography>
					<Typography sx={{ color: "text.secondary" }}>
						Kelola penyaluran donasi ke penerima manfaat
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<AddRoundedIcon />}
					onClick={() => setDialogOpen(true)}
					sx={{ borderRadius: 999, fontWeight: 800, px: 3 }}
				>
					Buat Pencairan
				</Button>
			</Stack>

			{(!payoutsEnabled || payoutsCapability?.available === false) && (
				<Alert severity="info" sx={{ mb: 2 }}>
					{payoutsCapability?.message ||
						"Mode manual aktif: fitur Iris/Payouts belum tersedia di akun Midtrans."}{" "}
					Setujui = admin melakukan transfer manual, lalu klik Selesai Transfer.
				</Alert>
			)}

			<Stack direction="row" spacing={2} sx={{ mb: 3 }}>
				<TextField
					placeholder="Cari pencairan..."
					size="small"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchRoundedIcon fontSize="small" />
							</InputAdornment>
						),
						sx: { borderRadius: 3, bgcolor: "background.paper" },
					}}
					sx={{ flex: 1 }}
				/>
				<Button
					variant="outlined"
					startIcon={<SettingsRoundedIcon />}
					onClick={() => setAdminPhoneDialogOpen(true)}
					sx={{ borderRadius: 3 }}
				>
					Atur WA OTP
				</Button>
				<Button
					variant="outlined"
					startIcon={<RefreshRoundedIcon />}
					onClick={fetchData}
					sx={{ borderRadius: 3 }}
				>
					Refresh
				</Button>
			</Stack>

			{loading ? (
				<Stack spacing={2}>
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} height={100} variant="rounded" />
					))}
				</Stack>
			) : (
				<Stack spacing={2}>
					{paginated.map((row) => (
						<WithdrawalCard
							key={row.id}
							row={row}
							onUpdateStatus={handleUpdateStatus}
							onApproveClick={handleApproveClick}
						/>
					))}
					{paginated.length === 0 && (
						<Surface sx={{ p: 4, textAlign: "center" }}>
							<Typography sx={{ color: "text.secondary" }}>
								Belum ada data pencairan
							</Typography>
						</Surface>
					)}
				</Stack>
			)}

			{totalPages > 1 && (
				<Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
					<Pagination
						count={totalPages}
						page={page}
						onChange={(_, p) => setPage(p)}
						color="primary"
						shape="rounded"
					/>
				</Box>
			)}

			{/* Create Dialog */}
			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<DialogTitle>Buat Pencairan Baru</DialogTitle>
				<DialogContent dividers>
					<Stack spacing={3} sx={{ pt: 1 }}>
						<FormControl fullWidth size="small">
							<InputLabel>Pilih Campaign</InputLabel>
							<Select
								value={selectedCampaign}
								label="Pilih Campaign"
								onChange={(e) => setSelectedCampaign(e.target.value)}
							>
								{campaigns.map((c) => (
									<MenuItem key={c.id} value={c.id}>
										<Box sx={{ display: "flex", flexDirection: "column" }}>
											<Typography variant="body2" fontWeight={600}>
												{c.title}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Tersedia: {idr(c.available)}
											</Typography>
										</Box>
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{selectedCampaignData && (
							<Surface sx={{ p: 2, bgcolor: alpha("#000", 0.02) }}>
								<Stack direction="row" justifyContent="space-between">
									<Typography variant="body2">Dana Terkumpul</Typography>
									<Typography variant="body2" fontWeight={700}>
										{idr(selectedCampaignData.collected)}
									</Typography>
								</Stack>
								<Stack
									direction="row"
									justifyContent="space-between"
									sx={{ mt: 1 }}
								>
									<Typography variant="body2">Sudah Dicairkan</Typography>
									<Typography
										variant="body2"
										fontWeight={700}
										color="error.main"
									>
										- {idr(selectedCampaignData.withdrawn)}
									</Typography>
								</Stack>
								<Divider sx={{ my: 1 }} />
								<Stack direction="row" justifyContent="space-between">
									<Typography variant="body2" fontWeight={700}>
										Tersedia
									</Typography>
									<Typography
										variant="body2"
										fontWeight={900}
										color="success.main"
									>
										{idr(selectedCampaignData.available)}
									</Typography>
								</Stack>
							</Surface>
						)}

						<TextField
							label="Jumlah Pencairan"
							fullWidth
							size="small"
							value={amount}
							onChange={(e) => setAmount(formatIDR(e.target.value))}
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">Rp</InputAdornment>
								),
							}}
							error={
								selectedCampaignData
									? Number(amount.replace(/\D/g, "")) >
										selectedCampaignData.available
									: false
							}
							helperText={
								selectedCampaignData &&
								Number(amount.replace(/\D/g, "")) >
									selectedCampaignData.available
									? "Melebihi dana tersedia"
									: ""
							}
						/>

						<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
							Informasi Rekening Tujuan
						</Typography>

						<Box
							sx={{
								display: "grid",
								gap: 2,
								gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
							}}
						>
							<Box>
								<FormControl fullWidth size="small">
									<InputLabel>Nama Bank</InputLabel>
									<Select
										value={bankName}
										label="Nama Bank"
										onChange={(e) => setBankName(e.target.value)}
									>
										{SUPPORTED_BANKS.map((b) => (
											<MenuItem key={b.code} value={b.code}>
												{b.name}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Box>
							<Box>
								<TextField
									label="Nomor Rekening"
									fullWidth
									size="small"
									value={bankAccount}
									onChange={(e) => setBankAccount(e.target.value)}
								/>
							</Box>
							<Box sx={{ gridColumn: "1 / -1" }}>
								<TextField
									label="Nama Pemilik Rekening"
									fullWidth
									size="small"
									value={accountHolder}
									onChange={(e) => setAccountHolder(e.target.value)}
								/>
							</Box>
						</Box>

						<TextField
							label="Catatan / Keterangan"
							fullWidth
							multiline
							rows={3}
							size="small"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2.5 }}>
					<Button
						onClick={() => setDialogOpen(false)}
						sx={{ borderRadius: 999 }}
					>
						Batal
					</Button>
					<Button
						variant="contained"
						onClick={handleCreate}
						disabled={
							submitting ||
							!selectedCampaign ||
							!amount ||
							!bankName ||
							!bankAccount ||
							!accountHolder ||
							(selectedCampaignData
								? Number(amount.replace(/\D/g, "")) >
									selectedCampaignData.available
								: false)
						}
						sx={{ borderRadius: 999, px: 3 }}
					>
						{submitting ? "Memproses..." : "Buat Pencairan"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* OTP Dialog */}
			<OtpVerificationDialog
				open={otpDialogOpen}
				onClose={() => setOtpDialogOpen(false)}
				withdrawal={selectedWithdrawalForApproval}
				onVerified={handleOtpVerified}
				adminPhone={adminPhone}
			/>

			<AdminPhoneDialog
				open={adminPhoneDialogOpen}
				onClose={() => setAdminPhoneDialogOpen(false)}
				currentPhone={localAdminPhone}
				onSuccess={async (newPhone) => {
					setLocalAdminPhone(newPhone);
					await updateSession({ user: { ...session?.user, phone: newPhone } });
					showSnack("Nomor WhatsApp berhasil diperbarui", "success");
				}}
			/>

			{/* Reject Dialog */}
			<Dialog
				open={rejectDialogOpen}
				onClose={() => setRejectDialogOpen(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<DialogTitle>Tolak Pencairan</DialogTitle>
				<DialogContent dividers>
					<Typography variant="body2" sx={{ pt: 1 }}>
						Yakin ingin menolak pencairan ini?
					</Typography>
				</DialogContent>
				<DialogActions sx={{ p: 2.5 }}>
					<Button onClick={() => setRejectDialogOpen(false)}>Batal</Button>
					<Button
						variant="contained"
						color="error"
						onClick={async () => {
							if (!selectedWithdrawalForRejection) return;
							try {
								const res = await updateWithdrawalStatus(
									selectedWithdrawalForRejection.id,
									"REJECTED",
									undefined,
									undefined,
								);
								if (!res?.success) {
									showSnack(res?.error || "Gagal menolak pencairan", "error");
									return;
								}
								setRejectDialogOpen(false);
								setSelectedWithdrawalForRejection(null);
								fetchData();
								showSnack("Pencairan berhasil ditolak", "success");
							} catch (e) {
								console.error(e);
								showSnack("Gagal menolak pencairan", "error");
							}
						}}
						sx={{ borderRadius: 999 }}
					>
						Tolak Pencairan
					</Button>
				</DialogActions>
			</Dialog>
			<Snackbar
				open={snack.open}
				autoHideDuration={5000}
				onClose={() => setSnack((s) => ({ ...s, open: false }))}
				anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
			>
				<Alert
					onClose={() => setSnack((s) => ({ ...s, open: false }))}
					severity={snack.severity}
					variant="filled"
					sx={{ width: "100%" }}
				>
					{snack.message}
				</Alert>
			</Snackbar>
			{/* Confirm Dialog */}
			<Dialog
				open={confirmDialogOpen}
				onClose={() => setConfirmDialogOpen(false)}
				maxWidth="xs"
				fullWidth
				PaperProps={{ sx: { borderRadius: 3 } }}
			>
				<DialogTitle>Konfirmasi Aksi</DialogTitle>
				<DialogContent>
					<Typography variant="body2">
						Ubah status menjadi {confirmTarget?.status}?
					</Typography>
				</DialogContent>
				<DialogActions sx={{ p: 2.5 }}>
					<Button onClick={() => setConfirmDialogOpen(false)}>Batal</Button>
					<Button
						variant="contained"
						onClick={async () => {
							if (!confirmTarget) return;
							try {
								const res = await updateWithdrawalStatus(
									confirmTarget.id,
									confirmTarget.status,
								);
								if (!res?.success) {
									showSnack(res?.error || "Gagal update status", "error");
									return;
								}
								setConfirmDialogOpen(false);
								fetchData();
								showSnack("Status pencairan berhasil diperbarui", "success");
							} catch (e) {
								console.error(e);
								showSnack("Gagal update status", "error");
							}
						}}
						sx={{ borderRadius: 999 }}
					>
						OK
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
