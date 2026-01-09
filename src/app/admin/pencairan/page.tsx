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
	SxProps,
	Theme,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import {
	getWithdrawals,
	getCampaignsWithFunds,
	createWithdrawal,
	updateWithdrawalStatus,
} from "@/actions/pencairan";

import WithdrawalCard, {
	WithdrawalRow,
	WithdrawalStatus,
} from "@/components/admin/pencairan/WithdrawalCard";
import OtpVerificationDialog from "@/components/admin/pencairan/OtpVerificationDialog";
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
			theme.palette.mode === "dark" ? 0.4 : 0.8
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
	const { data: session } = useSession();
	const [withdrawals, setWithdrawals] = React.useState<WithdrawalRow[]>([]);
	const [campaigns, setCampaigns] = React.useState<CampaignFund[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [query, setQuery] = React.useState("");
	const [page, setPage] = React.useState(1);
	const [dialogOpen, setDialogOpen] = React.useState(false);

	// OTP State
	const [otpDialogOpen, setOtpDialogOpen] = React.useState(false);
	const [selectedWithdrawalForApproval, setSelectedWithdrawalForApproval] =
		React.useState<WithdrawalRow | null>(null);

	// Form state
	const [selectedCampaign, setSelectedCampaign] = React.useState<string>("");
	const [amount, setAmount] = React.useState<string>("");
	const [bankName, setBankName] = React.useState("");
	const [bankAccount, setBankAccount] = React.useState("");
	const [accountHolder, setAccountHolder] = React.useState("");
	const [notes, setNotes] = React.useState("");
	const [submitting, setSubmitting] = React.useState(false);

	const fetchData = React.useCallback(async () => {
		setLoading(true);
		try {
			const [w, c] = await Promise.all([
				getWithdrawals(),
				getCampaignsWithFunds(),
			]);
			setWithdrawals(w as unknown as WithdrawalRow[]);
			setCampaigns(c);
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
			alert("Gagal membuat pencairan");
		} finally {
			setSubmitting(false);
		}
	};

	const handleUpdateStatus = async (
		id: string,
		status: Exclude<WithdrawalStatus, "PENDING">
	) => {
		if (!confirm(`Ubah status menjadi ${status}?`)) return;
		try {
			await updateWithdrawalStatus(id, status);
			fetchData();
		} catch (e) {
			console.error(e);
			alert("Gagal update status");
		}
	};

	const handleApproveClick = (row: WithdrawalRow) => {
		setSelectedWithdrawalForApproval(row);
		setOtpDialogOpen(true);
	};

	const handleOtpVerified = async () => {
		if (!selectedWithdrawalForApproval) return;
		try {
			await updateWithdrawalStatus(
				selectedWithdrawalForApproval.id,
				"APPROVED"
			);
			fetchData();
			alert("Pencairan berhasil disetujui!");
		} catch (e) {
			console.error(e);
			alert("Gagal menyetujui pencairan");
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
	const adminPhone =
		(session?.user as { phone?: string })?.phone || "085382055598";

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
		</Box>
	);
}
