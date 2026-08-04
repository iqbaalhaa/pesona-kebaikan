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
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useSession } from "next-auth/react";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

import {
	getWithdrawals,
	getCampaignsWithFunds,
	createWithdrawal,
	updateWithdrawalStatus,
} from "@/actions/pencairan";
import { updateCampaignTarget } from "@/actions/campaign-admin";

import {
	WithdrawalRow,
	WithdrawalStatus,
} from "@/components/admin/pencairan/WithdrawalCard";
import DonasiCepatDonorsModal from "@/components/admin/pencairan/DonasiCepatDonorsModal";
import { SUPPORTED_BANKS } from "@/lib/banks";
import { getBankName } from "@/lib/banks";

const PAGE_SIZE = 15;
const QUICK_DONATION_SLUG = "donasi-cepat";

type CampaignFund = {
	id: string;
	slug?: string;
	title: string;
	target: number;
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

// Loose match: lowercase, strip titles/whitespace — this is a fraud-signal
// warning for the admin reviewing, not a hard validation (legitimate
// mismatches exist, e.g. organizational accounts, nicknames).
function namesLikelyMatch(a: string, b: string) {
	const normalize = (s: string) =>
		s
			.toLowerCase()
			.replace(/\b(bapak|ibu|bpk|sdr|sdri|cv|pt|yayasan)\b/g, "")
			.replace(/[^a-z0-9]/g, "")
			.trim();
	const na = normalize(a);
	const nb = normalize(b);
	if (!na || !nb) return true;
	return na === nb || na.includes(nb) || nb.includes(na);
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
	const { data: session } = useSession();
	// Maker-checker: only ADMIN may create manual (admin-initiated)
	// withdrawals. STAFF with MANAGE_WITHDRAWALS may only process/approve the
	// queue — enforced server-side too in createWithdrawal().
	const isAdmin = session?.user?.role === "ADMIN";

	const [withdrawals, setWithdrawals] = React.useState<WithdrawalRow[]>([]);
	const [campaigns, setCampaigns] = React.useState<CampaignFund[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [query, setQuery] = React.useState("");
	const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("PENDING");
	const [page, setPage] = React.useState(1);
	const [dialogOpen, setDialogOpen] = React.useState(false);
	const [donorsModalOpen, setDonorsModalOpen] = React.useState(false);

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
	const [manualDialogScope, setManualDialogScope] = React.useState<"regular" | "quick">("regular");
	const [amount, setAmount] = React.useState("");
	const [bankName, setBankName] = React.useState("");
	const [bankAccount, setBankAccount] = React.useState("");
	const [accountHolder, setAccountHolder] = React.useState("");
	const [notes, setNotes] = React.useState("");

	// Edit target Donasi Cepat
	const [editTargetOpen, setEditTargetOpen] = React.useState(false);
	const [targetValue, setTargetValue] = React.useState("");
	const [targetSubmitting, setTargetSubmitting] = React.useState(false);
	const [submitting, setSubmitting] = React.useState(false);

	const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({ open: false, message: "", severity: "success" });

	// Detail dialog
	const [detailRow, setDetailRow] = React.useState<WithdrawalRow | null>(null);
	const [approvalForm, setApprovalForm] = React.useState({ transferAmount: "", senderBank: "", senderAccount: "", proofUrl: "" });
	const [approvalSubmitting, setApprovalSubmitting] = React.useState(false);

	const showSnack = (message: string, severity: "success" | "error" | "info" = "success") =>
		setSnack({ open: true, message, severity });

	const fetchData = React.useCallback(async () => {
		setLoading(true);
		try {
			const [w, c] = await Promise.all([getWithdrawals(), getCampaignsWithFunds()]);
			setWithdrawals(w as unknown as WithdrawalRow[]);
			setCampaigns(c);
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
	const donasiCepat = campaigns.find(c => c.slug === QUICK_DONATION_SLUG);

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
					{isAdmin && (
						<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => { setManualDialogScope("regular"); setSelectedCampaign(""); setDialogOpen(true); }} sx={{ borderRadius: 999, fontWeight: 800, px: 3 }}>
							Pencairan Manual
						</Button>
					)}
					<Tooltip title="Refresh">
						<IconButton onClick={() => fetchData()}>
							<RefreshRoundedIcon />
						</IconButton>
					</Tooltip>
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


			{/* Saldo Donasi Cepat — dana internal yayasan, terpisah dari campaign fundraiser */}
			{donasiCepat && (
				<Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
					<Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5}>
						<Box>
							<Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary" }}>
								Saldo Donasi Cepat
							</Typography>
							<Typography sx={{ fontSize: 22, fontWeight: 1000 }}>{idr(donasiCepat.available)}</Typography>
							<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
								Terkumpul {idr(donasiCepat.collected)} • Sudah dicairkan {idr(donasiCepat.withdrawn)}
							</Typography>
							<Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
								<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
									Jumlah maksimal donasi: {idr(donasiCepat.target)}
								</Typography>
								{isAdmin && (
									<Tooltip title="Edit jumlah maksimal donasi">
										<IconButton
											size="small"
											onClick={() => { setTargetValue(formatIDR(String(donasiCepat.target))); setEditTargetOpen(true); }}
										>
											<EditRoundedIcon sx={{ fontSize: 15 }} />
										</IconButton>
									</Tooltip>
								)}
							</Stack>
						</Box>
						<Stack direction="row" spacing={1}>
							{isAdmin && (
								<Button variant="outlined" onClick={() => setDonorsModalOpen(true)} sx={{ borderRadius: 999, fontWeight: 700 }}>
									Lihat Donatur
								</Button>
							)}
							{isAdmin && (
								<Button
									variant="contained"
									onClick={() => { setManualDialogScope("quick"); setSelectedCampaign(donasiCepat.id); setDialogOpen(true); }}
									sx={{ borderRadius: 999, fontWeight: 800 }}
								>
									Tarik Dana
								</Button>
							)}
						</Stack>
					</Stack>
				</Paper>
			)}

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
				<DialogTitle>{manualDialogScope === "quick" ? "Tarik Dana — Donasi Cepat" : "Pencairan Manual"}</DialogTitle>
				<DialogContent dividers>
					<Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
						{manualDialogScope === "quick"
							? "Penarikan dana internal yayasan dari Donasi Cepat."
							: "Untuk kasus khusus — pencairan yang diinisiasi admin, bukan dari request fundraiser."}
					</Typography>
					<Stack spacing={3} sx={{ pt: 1 }}>
						<FormControl fullWidth size="small" disabled={manualDialogScope === "quick"}>
							<InputLabel>Pilih Campaign</InputLabel>
							<Select value={selectedCampaign} label="Pilih Campaign" onChange={e => setSelectedCampaign(e.target.value)}>
								{campaigns
									.filter(c => manualDialogScope === "quick" ? c.slug === QUICK_DONATION_SLUG : c.slug !== QUICK_DONATION_SLUG)
									.map(c => (
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

			{/* Edit Jumlah Maksimal Donasi — Donasi Cepat */}
			<Dialog open={editTargetOpen} onClose={() => setEditTargetOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
				<DialogTitle>Edit Jumlah Maksimal Donasi</DialogTitle>
				<DialogContent dividers>
					<Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 2 }}>
						Batas maksimal dana yang bisa terkumpul di Donasi Cepat.
					</Typography>
					<TextField
						label="Jumlah Maksimal Donasi"
						fullWidth
						size="small"
						value={targetValue}
						onChange={e => setTargetValue(formatIDR(e.target.value))}
						InputProps={{ startAdornment: <InputAdornment position="start">Rp</InputAdornment> }}
					/>
				</DialogContent>
				<DialogActions sx={{ p: 2.5 }}>
					<Button onClick={() => setEditTargetOpen(false)}>Batal</Button>
					<Button
						variant="contained"
						disabled={targetSubmitting || !targetValue || Number(targetValue.replace(/\D/g, "")) <= 0}
						onClick={async () => {
							if (!donasiCepat) return;
							setTargetSubmitting(true);
							try {
								const res = await updateCampaignTarget(donasiCepat.id, Number(targetValue.replace(/\D/g, "")));
								if (!res?.success) { showSnack(res?.error || "Gagal", "error"); return; }
								setEditTargetOpen(false);
								fetchData();
								showSnack("Jumlah maksimal donasi diperbarui");
							} catch { showSnack("Gagal", "error"); }
							finally { setTargetSubmitting(false); }
						}}
						sx={{ borderRadius: 999, px: 3 }}
					>
						{targetSubmitting ? "Menyimpan..." : "Simpan"}
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
								const res = await updateWithdrawalStatus(selectedWithdrawalForRejection.id, "REJECTED", undefined, rejectReason);
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
									{detailRow.ownerName && (
										<Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.5 }}>
											Pemilik campaign: {detailRow.ownerName}{detailRow.ownerVerified ? " (terverifikasi)" : " (belum terverifikasi)"}
										</Typography>
									)}
								</Paper>

								{detailRow.ownerName && !namesLikelyMatch(detailRow.accountHolder, detailRow.ownerName) && (
									<Alert severity="warning" sx={{ borderRadius: 2 }}>
										Nama rekening tujuan ("{detailRow.accountHolder}") tidak cocok dengan nama pemilik campaign ("{detailRow.ownerName}"). Periksa kembali sebelum memproses — bisa jadi wajar (rekening organisasi), tapi bisa juga indikasi kesalahan/penipuan.
									</Alert>
								)}

								{detailRow.status !== "PENDING" && detailRow.processedByName && (
									<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
										Diproses oleh: {detailRow.processedByName}
										{detailRow.processedAt && ` pada ${new Date(detailRow.processedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}
									</Typography>
								)}

								{/* Tanggal */}
								<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
									Diajukan: {new Date(detailRow.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
									{detailRow.status === "PENDING" && (() => { const d = daysAgo(detailRow.createdAt); return d >= 1 ? ` (${d} hari yang lalu)` : ""; })()}
								</Typography>

								{detailRow.notes && (
									<Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "grey.50" }}>
										<Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.5 }}>Catatan dari Fundraiser</Typography>
										<Typography sx={{ fontSize: 13 }}>{detailRow.notes}</Typography>
									</Paper>
								)}

								{detailRow.status === "REJECTED" && detailRow.rejectionReason && (
									<Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#fff5f5", borderColor: "#fecaca" }}>
										<Typography sx={{ fontSize: 11, color: "error.main", mb: 0.5, fontWeight: 700 }}>Alasan Penolakan</Typography>
										<Typography sx={{ fontSize: 13, color: "error.dark" }}>{detailRow.rejectionReason}</Typography>
									</Paper>
								)}

								{detailRow.status === "COMPLETED" && detailRow.transferAmount && (
									<Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
										<Typography sx={{ fontSize: 11, color: "text.secondary", mb: 1, fontWeight: 700 }}>Detail Transfer</Typography>
										<Stack spacing={0.5}>
											<Stack direction="row" justifyContent="space-between">
												<Typography sx={{ fontSize: 12, color: "text.secondary" }}>Nominal ditransfer</Typography>
												<Typography sx={{ fontSize: 12, fontWeight: 700 }}>{idr(detailRow.transferAmount)}</Typography>
											</Stack>
											{detailRow.senderBank && (
												<Stack direction="row" justifyContent="space-between">
													<Typography sx={{ fontSize: 12, color: "text.secondary" }}>Bank pengirim</Typography>
													<Typography sx={{ fontSize: 12, fontWeight: 700 }}>{detailRow.senderBank}</Typography>
												</Stack>
											)}
											{detailRow.senderAccount && (
												<Stack direction="row" justifyContent="space-between">
													<Typography sx={{ fontSize: 12, color: "text.secondary" }}>No. rek pengirim</Typography>
													<Typography sx={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace" }}>{detailRow.senderAccount}</Typography>
												</Stack>
											)}
										</Stack>
									</Paper>
								)}

								{detailRow.referenceNo && (
									<Typography sx={{ fontSize: 12, fontFamily: "monospace", color: "text.secondary" }}>Ref: {detailRow.referenceNo}</Typography>
								)}

								{/* Approval form — for PENDING and APPROVED */}
								{(detailRow.status === "PENDING" || detailRow.status === "APPROVED") && (
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
											<Typography sx={{ fontSize: 12, fontWeight: 600, mb: 0.5 }}>Bukti transfer (wajib)</Typography>
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
											{approvalForm.proofUrl ? (
												<Typography sx={{ fontSize: 11, color: "success.main", mt: 0.5 }}>✓ Bukti tersimpan</Typography>
											) : (
												<Typography sx={{ fontSize: 11, color: "warning.main", mt: 0.5 }}>Wajib diunggah sebelum bisa menyelesaikan pencairan</Typography>
											)}
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
							{(detailRow.status === "PENDING" || detailRow.status === "APPROVED") && (
								<>
									{detailRow.status === "PENDING" && (
										<Button color="error" onClick={() => { setDetailRow(null); handleUpdateStatus(detailRow.id, "REJECTED"); }}>
											Tolak
										</Button>
									)}
									<Button variant="contained" color="success" disabled={approvalSubmitting || !approvalForm.proofUrl}
										onClick={async () => {
											setApprovalSubmitting(true);
											try {
												const res = await updateWithdrawalStatus(
													detailRow.id,
													"COMPLETED",
													approvalForm.proofUrl || undefined,
													undefined,
													{
														transferAmount: approvalForm.transferAmount ? Number(approvalForm.transferAmount.replace(/\./g, "")) : undefined,
														senderBank: approvalForm.senderBank || undefined,
														senderAccount: approvalForm.senderAccount || undefined,
													},
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

			{donasiCepat && (
				<DonasiCepatDonorsModal
					open={donorsModalOpen}
					onClose={() => setDonorsModalOpen(false)}
					campaignId={donasiCepat.id}
					campaignTitle={donasiCepat.title}
				/>
			)}
		</Box>
	);
}
