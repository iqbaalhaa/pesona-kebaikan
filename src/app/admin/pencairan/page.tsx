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
	DialogContentText,
	Alert,
	Snackbar,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Tooltip,
	Menu,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

import {
	getWithdrawals,
	getCampaignsWithFunds,
	createWithdrawal,
	updateWithdrawalStatus,
	getPayoutsCapability,
} from "@/actions/pencairan";

import {
	WithdrawalRow,
	WithdrawalStatus,
} from "@/components/admin/pencairan/WithdrawalCard";
import OtpVerificationDialog from "@/components/admin/pencairan/OtpVerificationDialog";
import AdminPhoneDialog from "@/components/admin/pencairan/AdminPhoneDialog";
import { useSession } from "next-auth/react";
import { SUPPORTED_BANKS } from "@/lib/banks";
import { getBankName } from "@/lib/banks";

const PAGE_SIZE = 15;

type CampaignFund = {
	id: string;
	title: string;
	collected: number;
	withdrawn: number;
	available: number;
};

type StatusFilter = "ALL" | WithdrawalStatus;

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
	{ key: "PENDING", label: "Menunggu" },
	{ key: "APPROVED", label: "Disetujui" },
	{ key: "COMPLETED", label: "Selesai" },
	{ key: "REJECTED", label: "Ditolak" },
	{ key: "ALL", label: "Semua" },
];

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

function daysAgo(dateStr: string) {
	return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function statusChip(status: WithdrawalStatus) {
	const map: Record<WithdrawalStatus, { label: string; color: "success" | "warning" | "info" | "error" }> = {
		COMPLETED: { label: "Selesai", color: "success" },
		APPROVED: { label: "Disetujui", color: "info" },
		PENDING: { label: "Menunggu", color: "warning" },
		REJECTED: { label: "Ditolak", color: "error" },
	};
	const m = map[status];
	return <Chip label={m.label} size="small" color={m.color} sx={{ fontWeight: 700, height: 22 }} />;
}

export default function PencairanPage() {
	const theme = useTheme();
	const { data: session, update: updateSession } = useSession();
	const payoutsEnabled = process.env.NEXT_PUBLIC_MIDTRANS_PAYOUTS_ENABLED === "true";

	const [withdrawals, setWithdrawals] = React.useState<WithdrawalRow[]>([]);
	const [campaigns, setCampaigns] = React.useState<CampaignFund[]>([]);
	const [payoutsCapability, setPayoutsCapability] = React.useState<{ available: boolean; message: string } | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [query, setQuery] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("PENDING");
	const [page, setPage] = React.useState(1);
	const [dialogOpen, setDialogOpen] = React.useState(false);

	// OTP
	const [otpDialogOpen, setOtpDialogOpen] = React.useState(false);
	const [selectedWithdrawalForApproval, setSelectedWithdrawalForApproval] = React.useState<WithdrawalRow | null>(null);
	// Reject
	const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
	const [selectedWithdrawalForRejection, setSelectedWithdrawalForRejection] = React.useState<WithdrawalRow | null>(null);
	const [rejectReason, setRejectReason] = React.useState("");
	// Confirm
	const [confirmDialog, setConfirmDialog] = React.useState<{
		open: boolean; title: string; message: string;
		confirmColor?: "primary" | "error" | "warning";
		onConfirm: () => void;
	}>({ open: false, title: "", message: "", onConfirm: () => {} });

	// Create form
	const [selectedCampaign, setSelectedCampaign] = React.useState("");
	const [amount, setAmount] = React.useState("");
	const [bankName, setBankName] = React.useState("");
	const [bankAccount, setBankAccount] = React.useState("");
	const [accountHolder, setAccountHolder] = React.useState("");
	const [notes, setNotes] = React.useState("");
	const [submitting, setSubmitting] = React.useState(false);

	const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({ open: false, message: "", severity: "success" });

	// Detail dialog
	const [detailRow, setDetailRow] = React.useState<WithdrawalRow | null>(null);
	const [approvalForm, setApprovalForm] = React.useState({ transferAmount: "", senderBank: "", senderAccount: "", proofUrl: "" });
	const [approvalSubmitting, setApprovalSubmitting] = React.useState(false);

	// Admin phone
	const [adminPhoneDialogOpen, setAdminPhoneDialogOpen] = React.useState(false);
	const [localAdminPhone, setLocalAdminPhone] = React.useState("");
	// More menu
	const [moreAnchor, setMoreAnchor] = React.useState<null | HTMLElement>(null);

	React.useEffect(() => {
		if (session?.user) {
			const phone = (session.user as any)?.phone;
			if (phone) setLocalAdminPhone(phone);
		}
	}, [session]);

	const showSnack = (message: string, severity: "success" | "error" | "info" = "success") =>
		setSnack({ open: true, message, severity });

	const fetchData = React.useCallback(async () => {
		setLoading(true);
		try {
			const [w, c, cap] = await Promise.all([getWithdrawals(), getCampaignsWithFunds(), getPayoutsCapability()]);
			setWithdrawals(w as unknown as WithdrawalRow[]);
			setCampaigns(c);
			setPayoutsCapability(cap);
		} catch (e) { console.error(e); }
		finally { setLoading(false); }
	}, []);

	React.useEffect(() => { fetchData(); }, [fetchData]);

	// KPI
	const kpi = React.useMemo(() => {
		const pending = withdrawals.filter(w => w.status === "PENDING");
		const approved = withdrawals.filter(w => w.status === "APPROVED");
		const completed = withdrawals.filter(w => w.status === "COMPLETED");
		return {
			pendingCount: pending.length,
			pendingAmount: pending.reduce((a, w) => a + w.amount, 0),
			approvedCount: approved.length,
			approvedAmount: approved.reduce((a, w) => a + w.amount, 0),
			completedCount: completed.length,
			completedAmount: completed.reduce((a, w) => a + w.amount, 0),
		};
	}, [withdrawals]);

	// Filter
	const filtered = withdrawals
		.filter(w => statusFilter === "ALL" || w.status === statusFilter)
		.filter(w => {
			if (!query) return true;
			const s = query.toLowerCase();
			return w.campaignTitle.toLowerCase().includes(s) || w.accountHolder.toLowerCase().includes(s) || w.bankName.toLowerCase().includes(s);
		})
		.sort((a, b) => {
			if (a.status === "PENDING" && b.status !== "PENDING") return -1;
			if (a.status !== "PENDING" && b.status === "PENDING") return 1;
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

	const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	const selectedCampaignData = campaigns.find(c => c.id === selectedCampaign);
	const adminPhone = localAdminPhone || "085382055598";

	const handleCreate = async () => {
		if (!selectedCampaign || !amount || !bankName || !bankAccount || !accountHolder) return;
		setSubmitting(true);
		try {
			await createWithdrawal({ campaignId: selectedCampaign, amount: Number(amount.replace(/\D/g, "")), bankName, bankAccount, accountHolder, notes });
			setDialogOpen(false);
			showSnack("Pencairan berhasil dibuat");
			setSelectedCampaign(""); setAmount(""); setBankName(""); setBankAccount(""); setAccountHolder(""); setNotes("");
			fetchData();
		} catch { showSnack("Gagal membuat pencairan", "error"); }
		finally { setSubmitting(false); }
	};

	const handleUpdateStatus = async (id: string, status: Exclude<WithdrawalStatus, "PENDING">) => {
		if (status === "REJECTED") {
			setSelectedWithdrawalForRejection(withdrawals.find(w => w.id === id) || null);
			setRejectReason("");
			setRejectDialogOpen(true);
			return;
		}
		setConfirmDialog({
			open: true, title: "Konfirmasi", message: `Ubah status menjadi ${status}?`,
			onConfirm: async () => {
				try {
					const res = await updateWithdrawalStatus(id, status);
					if (!res?.success) { showSnack(res?.error || "Gagal", "error"); return; }
					fetchData(); showSnack("Status diperbarui");
				} catch { showSnack("Gagal", "error"); }
				setConfirmDialog(prev => ({ ...prev, open: false }));
			},
		});
	};

	const handleApproveClick = async (row: WithdrawalRow) => {
		if (process.env.NEXT_PUBLIC_DISBURSEMENT_BYPASS_OTP === "true") {
			setConfirmDialog({
				open: true, title: "Dev Mode", message: "OTP Bypass aktif. Lanjutkan?", confirmColor: "warning",
				onConfirm: async () => {
					try {
						const res = await updateWithdrawalStatus(row.id, "APPROVED", undefined, "BYPASSED", undefined, adminPhone);
						if (!res?.success) { showSnack(res?.error || "Gagal", "error"); return; }
						fetchData();
						showSnack(res.payoutMode === "IRIS" ? "Disetujui (Midtrans Iris)" : "Disetujui (manual)");
					} catch { showSnack("Gagal", "error"); }
					setConfirmDialog(prev => ({ ...prev, open: false }));
				},
			});
			return;
		}
		setSelectedWithdrawalForApproval(row);
		setOtpDialogOpen(true);
	};

	const handleOtpVerified = async (otp: string) => {
		if (!selectedWithdrawalForApproval) return;
		try {
			const res = await updateWithdrawalStatus(selectedWithdrawalForApproval.id, "APPROVED", undefined, otp, undefined, adminPhone);
			if (!res?.success) { showSnack(res?.error || "Gagal", "error"); return; }
			fetchData();
			showSnack(res.payoutMode === "IRIS" ? "Disetujui (Midtrans Iris)" : "Disetujui (manual)");
		} catch { showSnack("Gagal", "error"); }
		finally { setSelectedWithdrawalForApproval(null); }
	};

	return (
		<Box sx={{ p: { xs: 1.5, md: 2 } }}>
			{/* Header */}
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
				<Box>
					<Typography sx={{ fontSize: 24, fontWeight: 1000 }}>Request Pencairan</Typography>
					<Typography sx={{ color: "text.secondary", fontSize: 14 }}>
						Review & kelola request pencairan dana dari fundraiser
					</Typography>
				</Box>
				<Stack direction="row" spacing={1}>
					<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setDialogOpen(true)} sx={{ borderRadius: 999, fontWeight: 800, px: 3 }}>
						Pencairan Manual
					</Button>
					<IconButton onClick={(e) => setMoreAnchor(e.currentTarget)}>
						<MoreVertIcon />
					</IconButton>
					<Menu anchorEl={moreAnchor} open={!!moreAnchor} onClose={() => setMoreAnchor(null)}>
						<MenuItem onClick={() => { setMoreAnchor(null); setAdminPhoneDialogOpen(true); }}>
							<SettingsRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Atur WA OTP
						</MenuItem>
						<MenuItem onClick={() => { setMoreAnchor(null); fetchData(); }}>
							<RefreshRoundedIcon fontSize="small" sx={{ mr: 1 }} /> Refresh
						</MenuItem>
					</Menu>
				</Stack>
			</Stack>

			{/* KPI Cards */}
			<Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
				{[
					{ label: "Menunggu", count: kpi.pendingCount, amount: kpi.pendingAmount, color: "#f59e0b" },
					{ label: "Disetujui", count: kpi.approvedCount, amount: kpi.approvedAmount, color: "#3b82f6" },
					{ label: "Selesai", count: kpi.completedCount, amount: kpi.completedAmount, color: "#22c55e" },
				].map(k => (
					<Paper key={k.label} variant="outlined" sx={{ flex: 1, p: 1.5, borderRadius: 2, borderColor: alpha(k.color, 0.3) }}>
						<Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
							<Box sx={{ width: 10, height: 10, borderRadius: 99, bgcolor: k.color }} />
							<Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary" }}>{k.label}</Typography>
						</Stack>
						<Typography sx={{ fontSize: 22, fontWeight: 1000 }}>{k.count}</Typography>
						<Typography sx={{ fontSize: 12, color: "text.secondary" }}>{idr(k.amount)}</Typography>
					</Paper>
				))}
			</Stack>


			{/* Filters */}
			<Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
				{STATUS_FILTERS.map(f => (
					<Chip
						key={f.key}
						label={`${f.label}${f.key !== "ALL" ? ` (${withdrawals.filter(w => w.status === f.key).length})` : ""}`}
						onClick={() => { setStatusFilter(f.key); setPage(1); }}
						color={statusFilter === f.key ? "primary" : "default"}
						variant={statusFilter === f.key ? "filled" : "outlined"}
						sx={{ fontWeight: 700 }}
					/>
				))}
				<Box sx={{ flex: 1 }} />
				<TextField
					placeholder="Cari..."
					size="small"
					value={query}
					onChange={e => setQuery(e.target.value)}
					InputProps={{
						startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment>,
						sx: { borderRadius: 3, bgcolor: "background.paper" },
					}}
					sx={{ width: 250 }}
				/>
			</Stack>

			{/* Table */}
			{loading ? (
				<Stack spacing={1}>{[1,2,3,4,5].map(i => <Skeleton key={i} height={56} variant="rounded" />)}</Stack>
			) : (
				<TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
					<Table size="small">
						<TableHead>
							<TableRow sx={{ bgcolor: alpha(theme.palette.text.primary, 0.03) }}>
								<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Campaign</TableCell>
								<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Jumlah</TableCell>
																<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Tanggal</TableCell>
								<TableCell sx={{ fontWeight: 800, fontSize: 12 }}>Status</TableCell>
								<TableCell sx={{ fontWeight: 800, fontSize: 12 }} align="right">Aksi</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{paginated.map(row => {
								const days = daysAgo(row.createdAt);
								const isUrgent = row.status === "PENDING" && days >= 3;
								return (
									<TableRow key={row.id} sx={{ bgcolor: isUrgent ? alpha("#f59e0b", 0.04) : "transparent", "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.03) } }}>
										<TableCell>
											<Typography sx={{ fontSize: 13, fontWeight: 700 }} noWrap>{row.campaignTitle}</Typography>
										</TableCell>
										<TableCell>
											<Typography sx={{ fontSize: 13, fontWeight: 800 }}>{idr(row.amount)}</Typography>
										</TableCell>
										<TableCell>
											<Typography sx={{ fontSize: 12 }}>
												{new Date(row.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
											</Typography>
											{isUrgent && (
												<Typography sx={{ fontSize: 10, color: "#92400e", fontWeight: 700 }}>
													⏳ {days} hari menunggu
												</Typography>
											)}
										</TableCell>
										<TableCell>{statusChip(row.status)}</TableCell>
														<TableCell align="right">
															<Button size="small" variant="outlined" onClick={() => { setDetailRow(row); setApprovalForm({ transferAmount: formatIDR(String(row.amount)), senderBank: "", senderAccount: "", proofUrl: "" }); }} sx={{ fontSize: 11, fontWeight: 700, px: 1.5 }}>
																Detail
															</Button>
														</TableCell>
									</TableRow>
								);
							})}
							{paginated.length === 0 && (
								<TableRow>
									<TableCell colSpan={5} sx={{ py: 6, textAlign: "center" }}>
										<Typography sx={{ color: "text.secondary" }}>Tidak ada data</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			)}

			{totalPages > 1 && (
				<Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
					<Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} color="primary" shape="rounded" />
				</Box>
			)}

			{/* Create Dialog */}
			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
				<DialogTitle>Pencairan Manual</DialogTitle>
				<DialogContent dividers>
					<Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
						Untuk kasus khusus — pencairan yang diinisiasi admin, bukan dari request fundraiser.
					</Typography>
					<Stack spacing={3} sx={{ pt: 1 }}>
						<FormControl fullWidth size="small">
							<InputLabel>Pilih Campaign</InputLabel>
							<Select value={selectedCampaign} label="Pilih Campaign" onChange={e => setSelectedCampaign(e.target.value)}>
								{campaigns.map(c => (
									<MenuItem key={c.id} value={c.id}>
										<Box sx={{ display: "flex", flexDirection: "column" }}>
											<Typography variant="body2" fontWeight={600}>{c.title}</Typography>
											<Typography variant="caption" color="text.secondary">Tersedia: {idr(c.available)}</Typography>
										</Box>
									</MenuItem>
								))}
							</Select>
						</FormControl>

						{selectedCampaignData && (
							<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
								<Stack direction="row" justifyContent="space-between">
									<Typography variant="body2">Dana Terkumpul</Typography>
									<Typography variant="body2" fontWeight={700}>{idr(selectedCampaignData.collected)}</Typography>
								</Stack>
								<Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
									<Typography variant="body2">Sudah Dicairkan</Typography>
									<Typography variant="body2" fontWeight={700} color="error.main">- {idr(selectedCampaignData.withdrawn)}</Typography>
								</Stack>
								<Divider sx={{ my: 1 }} />
								<Stack direction="row" justifyContent="space-between">
									<Typography variant="body2" fontWeight={700}>Tersedia</Typography>
									<Typography variant="body2" fontWeight={900} color="success.main">{idr(selectedCampaignData.available)}</Typography>
								</Stack>
							</Paper>
						)}

						<TextField label="Jumlah Pencairan" fullWidth size="small" value={amount} onChange={e => setAmount(formatIDR(e.target.value))}
							InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
							error={selectedCampaignData ? Number(amount.replace(/\D/g, "")) > selectedCampaignData.available : false}
							helperText={selectedCampaignData && Number(amount.replace(/\D/g, "")) > selectedCampaignData.available ? "Melebihi dana tersedia" : ""}
						/>

						<Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Rekening Tujuan</Typography>

						<Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
							<FormControl fullWidth size="small">
								<InputLabel>Bank</InputLabel>
								<Select value={bankName} label="Bank" onChange={e => setBankName(e.target.value)}>
									{SUPPORTED_BANKS.map(b => <MenuItem key={b.code} value={b.code}>{b.name}</MenuItem>)}
								</Select>
							</FormControl>
							<TextField label="No. Rekening" fullWidth size="small" value={bankAccount} onChange={e => setBankAccount(e.target.value)} />
							<Box sx={{ gridColumn: "1 / -1" }}>
								<TextField label="Atas Nama" fullWidth size="small" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} />
							</Box>
						</Box>

						<TextField label="Catatan (opsional)" fullWidth multiline rows={2} size="small" value={notes} onChange={e => setNotes(e.target.value)} />
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: 2.5 }}>
					<Button onClick={() => setDialogOpen(false)}>Batal</Button>
					<Button variant="contained" onClick={handleCreate} disabled={submitting || !selectedCampaign || !amount || !bankName || !bankAccount || !accountHolder || (selectedCampaignData ? Number(amount.replace(/\D/g, "")) > selectedCampaignData.available : false)} sx={{ borderRadius: 999, px: 3 }}>
						{submitting ? "Memproses..." : "Buat Pencairan"}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Reject Dialog — wajib alasan */}
			<Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
				<DialogTitle>Tolak Pencairan</DialogTitle>
				<DialogContent dividers>
					<Typography variant="body2" sx={{ mb: 2 }}>
						Berikan alasan penolakan agar fundraiser dapat memahami dan memperbaiki request.
					</Typography>
					<TextField
						label="Alasan penolakan"
						fullWidth
						multiline
						rows={3}
						value={rejectReason}
						onChange={e => setRejectReason(e.target.value)}
						placeholder="Contoh: Data rekening tidak sesuai dengan pemilik campaign..."
						error={rejectReason.length > 0 && rejectReason.trim().length < 10}
						helperText="Minimal 10 karakter"
					/>
				</DialogContent>
				<DialogActions sx={{ p: 2.5 }}>
					<Button onClick={() => setRejectDialogOpen(false)}>Batal</Button>
					<Button
						variant="contained"
						color="error"
						disabled={rejectReason.trim().length < 10}
						onClick={async () => {
							if (!selectedWithdrawalForRejection) return;
							try {
								const res = await updateWithdrawalStatus(selectedWithdrawalForRejection.id, "REJECTED", undefined, undefined);
								if (!res?.success) { showSnack(res?.error || "Gagal", "error"); return; }
								setRejectDialogOpen(false);
								setSelectedWithdrawalForRejection(null);
								setRejectReason("");
								fetchData();
								showSnack("Pencairan ditolak");
							} catch { showSnack("Gagal", "error"); }
						}}
						sx={{ borderRadius: 999 }}
					>
						Tolak Pencairan
					</Button>
				</DialogActions>
			</Dialog>

			{/* Detail Dialog */}
			<Dialog open={!!detailRow} onClose={() => setDetailRow(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
				{detailRow && (
					<>
						<DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							<Typography sx={{ fontSize: 18, fontWeight: 900 }}>Detail Pencairan</Typography>
							<IconButton size="small" onClick={() => setDetailRow(null)}>
								<ErrorRoundedIcon fontSize="small" sx={{ transform: "rotate(45deg)" }} />
							</IconButton>
						</DialogTitle>
						<DialogContent dividers>
							<Stack spacing={2}>
								{/* Campaign info */}
								<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
									<Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.5 }}>Campaign</Typography>
									<Typography sx={{ fontSize: 14, fontWeight: 700 }}>{detailRow.campaignTitle}</Typography>
								</Paper>

								{/* Amount */}
								<Stack direction="row" spacing={2}>
									<Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 2 }}>
										<Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.5 }}>Jumlah Request</Typography>
										<Typography sx={{ fontSize: 18, fontWeight: 900 }}>{idr(detailRow.amount)}</Typography>
									</Paper>
									<Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 2 }}>
										<Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.5 }}>Status</Typography>
										<Box sx={{ mt: 0.5 }}>{statusChip(detailRow.status)}</Box>
									</Paper>
								</Stack>

								{/* Rekening tujuan */}
								<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
									<Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.5 }}>Rekening Tujuan</Typography>
									<Typography sx={{ fontSize: 14, fontWeight: 700 }}>{getBankName(detailRow.bankName)} — {detailRow.bankAccount}</Typography>
									<Typography sx={{ fontSize: 13, color: "text.secondary" }}>a.n {detailRow.accountHolder}</Typography>
								</Paper>

								{/* Tanggal */}
								<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
									Diajukan: {new Date(detailRow.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
									{detailRow.status === "PENDING" && (() => { const d = daysAgo(detailRow.createdAt); return d >= 1 ? ` (${d} hari yang lalu)` : ""; })()}
								</Typography>

								{detailRow.referenceNo && (
									<Typography sx={{ fontSize: 12, fontFamily: "monospace", color: "text.secondary" }}>Ref: {detailRow.referenceNo}</Typography>
								)}

								{/* Approval form — only for PENDING */}
								{detailRow.status === "PENDING" && (
									<>
										<Divider />
										<Typography sx={{ fontSize: 14, fontWeight: 800 }}>Proses Pencairan</Typography>

										<TextField label="Nominal yang ditransfer" fullWidth size="small"
											value={approvalForm.transferAmount}
											onChange={e => setApprovalForm(f => ({ ...f, transferAmount: formatIDR(e.target.value) }))}
											InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
										/>
										<Stack direction="row" spacing={1.5}>
											<TextField label="Bank pengirim" size="small" fullWidth
												value={approvalForm.senderBank}
												onChange={e => setApprovalForm(f => ({ ...f, senderBank: e.target.value }))}
												placeholder="BCA, Mandiri, dll"
											/>
											<TextField label="No. rek pengirim" size="small" fullWidth
												value={approvalForm.senderAccount}
												onChange={e => setApprovalForm(f => ({ ...f, senderAccount: e.target.value }))}
											/>
										</Stack>

										<Box>
											<Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>Bukti transfer (opsional)</Typography>
											<Button variant="outlined" component="label" size="small" sx={{ borderRadius: 2 }}>
												{approvalForm.proofUrl ? "Ganti file" : "Upload bukti"}
												<input type="file" accept="image/*,.pdf" hidden onChange={async (e) => {
													const file = e.target.files?.[0];
													if (!file) return;
													const { uploadFile } = await import("@/actions/upload");
													const fd = new FormData(); fd.append("file", file);
													const res = await uploadFile(fd);
													if (res.success && res.url) {
														setApprovalForm(f => ({ ...f, proofUrl: res.url }));
														showSnack("Bukti berhasil diupload", "info");
													} else { showSnack("Gagal upload bukti", "error"); }
												}} />
											</Button>
											{approvalForm.proofUrl && <Typography sx={{ fontSize: 11, color: "success.main", mt: 0.5 }}>✓ Bukti tersimpan</Typography>}
										</Box>
									</>
								)}

								{/* Proof for completed */}
								{detailRow.proofUrl && (
									<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
										<Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.5 }}>Bukti Transfer</Typography>
										<Button size="small" href={detailRow.proofUrl} target="_blank" rel="noopener noreferrer">Lihat Bukti</Button>
									</Paper>
								)}
							</Stack>
						</DialogContent>
						<DialogActions sx={{ p: 2 }}>
							{detailRow.status === "PENDING" && (
								<>
									<Button color="error" onClick={() => { setDetailRow(null); handleUpdateStatus(detailRow.id, "REJECTED"); }}>
										Tolak
									</Button>
									<Button variant="contained" color="success" disabled={approvalSubmitting}
										onClick={async () => {
											setApprovalSubmitting(true);
											try {
												const res = await updateWithdrawalStatus(
													detailRow.id,
													"COMPLETED",
													approvalForm.proofUrl || undefined,
												);
												if (!res?.success) {
													showSnack(res?.error || "Gagal", "error");
													return;
												}
												setDetailRow(null);
												fetchData();
												showSnack("Pencairan selesai");
											} catch { showSnack("Gagal", "error"); }
											finally { setApprovalSubmitting(false); }
										}}
										sx={{ borderRadius: 999, px: 3 }}
									>
										{approvalSubmitting ? "Memproses..." : "Selesai & Transfer"}
									</Button>
								</>
							)}
							{detailRow.status !== "PENDING" && (
								<Button onClick={() => setDetailRow(null)}>Tutup</Button>
							)}
						</DialogActions>
					</>
				)}
			</Dialog>

			{/* OTP Dialog */}
			<OtpVerificationDialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)} withdrawal={selectedWithdrawalForApproval} onVerified={handleOtpVerified} adminPhone={adminPhone} />
			<AdminPhoneDialog open={adminPhoneDialogOpen} onClose={() => setAdminPhoneDialogOpen(false)} currentPhone={localAdminPhone} onSuccess={async (newPhone) => { setLocalAdminPhone(newPhone); await updateSession({ user: { ...session?.user, phone: newPhone } }); showSnack("Nomor WA diperbarui"); }} />

			{/* Confirm Dialog */}
			<Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
				<DialogTitle>{confirmDialog.title}</DialogTitle>
				<DialogContent><DialogContentText>{confirmDialog.message}</DialogContentText></DialogContent>
				<DialogActions sx={{ p: 2.5 }}>
					<Button onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>Batal</Button>
					<Button variant="contained" color={confirmDialog.confirmColor || "primary"} onClick={confirmDialog.onConfirm} sx={{ borderRadius: 999 }}>OK</Button>
				</DialogActions>
			</Dialog>

			<Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
				<Alert onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} variant="filled">{snack.message}</Alert>
			</Snackbar>
		</Box>
	);
}
