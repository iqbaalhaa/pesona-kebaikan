"use client";

import React from "react";
import {
	Box,
	Typography,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	Stack,
	Pagination,
	Button,
	IconButton,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from "@mui/material";
import Link from "next/link";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
	getCampaignChangeRequests,
	resolveCampaignChangeRequest,
} from "@/actions/campaign-admin";

type ChangeRequestRow = {
	id: string;
	campaign: { id: string; title: string; slug?: string | null };
	user: { id: string; name: string | null; email: string | null } | null;
	extraDays: number | null;
	extraTarget: any;
	status: "PENDING" | "APPROVED" | "REJECTED";
	createdAt: string;
	note?: string | null;
};

export default function CampaignRequestsPage() {
	const [requests, setRequests] = React.useState<ChangeRequestRow[]>([]);
	const [totalPages, setTotalPages] = React.useState(1);
	const [page, setPage] = React.useState(1);
	const [loading, setLoading] = React.useState(true);
	const [statusFilter, setStatusFilter] = React.useState<
		"all" | "PENDING" | "APPROVED" | "REJECTED"
	>("all");

	const [approveDialog, setApproveDialog] = React.useState<{
		open: boolean;
		req: ChangeRequestRow | null;
		applyDays: boolean;
		applyTarget: boolean;
		days: string;
		target: string;
	}>({
		open: false,
		req: null,
		applyDays: false,
		applyTarget: false,
		days: "",
		target: "",
	});

	const [rejectDialog, setRejectDialog] = React.useState<{
		open: boolean;
		req: ChangeRequestRow | null;
		note: string;
	}>({
		open: false,
		req: null,
		note: "",
	});

	const [submitting, setSubmitting] = React.useState(false);

	const buildChangeSummary = React.useCallback((req: ChangeRequestRow) => {
		const parts: string[] = [];
		if (req.extraDays) {
			parts.push(`Perpanjangan ${req.extraDays} hari`);
		}
		if (req.extraTarget) {
			const amount = Number(req.extraTarget);
			if (!Number.isNaN(amount) && amount > 0) {
				parts.push(`Penambahan target Rp${amount.toLocaleString("id-ID")}`);
			}
		}
		return parts.length > 0 ? parts.join(" dan ") : "Perubahan campaign";
	}, []);

	const fetchData = React.useCallback(
		async (pageNum: number, status: typeof statusFilter) => {
			setLoading(true);
			try {
				const res = await getCampaignChangeRequests(pageNum, 20, status);
				setRequests(res.requests as any);
				setTotalPages(res.totalPages || 1);
			} catch (e) {
				console.error(e);
				setRequests([]);
				setTotalPages(1);
			} finally {
				setLoading(false);
			}
		},
		[statusFilter],
	);

	React.useEffect(() => {
		fetchData(page, statusFilter);
	}, [fetchData, page, statusFilter]);

	const openApprove = (req: ChangeRequestRow) => {
		const baseDays =
			typeof req.extraDays === "number" && req.extraDays > 0
				? String(req.extraDays)
				: "";
		const extraTargetNumber = req.extraTarget ? Number(req.extraTarget) : 0;
		const baseTarget =
			!Number.isNaN(extraTargetNumber) && extraTargetNumber > 0
				? String(extraTargetNumber)
				: "";

		setApproveDialog({
			open: true,
			req,
			applyDays: !!baseDays,
			applyTarget: !!baseTarget,
			days: baseDays,
			target: baseTarget,
		});
	};

	const openReject = (req: ChangeRequestRow) => {
		setRejectDialog({
			open: true,
			req,
			note: "",
		});
	};

	const handleApproveConfirm = async () => {
		if (!approveDialog.req || submitting) return;
		const { req, applyDays, applyTarget, days, target } = approveDialog;

		const daysNum = parseInt(days || "0", 10);
		const targetNum = parseInt(target || "0", 10);

		setSubmitting(true);
		try {
			await resolveCampaignChangeRequest(approveDialog.req.id, "APPROVE", {
				applyDays,
				applyTarget,
				extraDaysOverride:
					applyDays && !Number.isNaN(daysNum) && daysNum > 0 ? daysNum : 0,
				extraTargetOverride:
					applyTarget && !Number.isNaN(targetNum) && targetNum > 0
						? targetNum
						: 0,
			});
			setApproveDialog((prev) => ({ ...prev, open: false, req: null }));
			fetchData(page, statusFilter);
		} catch (e) {
			console.error(e);
		} finally {
			setSubmitting(false);
		}
	};

	const handleRejectConfirm = async () => {
		if (!rejectDialog.req || submitting) return;
		const note = rejectDialog.note.trim();
		if (!note) return;

		setSubmitting(true);
		try {
			await resolveCampaignChangeRequest(rejectDialog.req.id, "REJECT", {
				note,
			});
			setRejectDialog((prev) => ({ ...prev, open: false, req: null }));
			fetchData(page, statusFilter);
		} catch (e) {
			console.error(e);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Box sx={{ p: 3 }}>
			<Stack
				direction="row"
				justifyContent="space-between"
				alignItems="center"
				sx={{ mb: 3 }}
				spacing={2}
			>
				<Typography variant="h5" fontWeight={700}>
					Pengajuan Perubahan Campaign
				</Typography>
				<FormControl size="small" sx={{ minWidth: 200 }}>
					<InputLabel>Status</InputLabel>
					<Select
						label="Status"
						value={statusFilter}
						onChange={(e) => {
							const v = e.target.value as typeof statusFilter;
							setPage(1);
							setStatusFilter(v);
						}}
					>
						<MenuItem value="all">Semua status</MenuItem>
						<MenuItem value="PENDING">Menunggu diproses</MenuItem>
						<MenuItem value="APPROVED">Disetujui</MenuItem>
						<MenuItem value="REJECTED">Ditolak</MenuItem>
					</Select>
				</FormControl>
			</Stack>

			<TableContainer
				component={Paper}
				elevation={0}
				sx={{
					borderRadius: 2,
					border: "1px solid",
					borderColor: "divider",
				}}
			>
				<Table size="small" sx={{ tableLayout: "fixed" }}>
					<TableHead>
						<TableRow sx={{ bgcolor: "grey.50" }}>
							<TableCell sx={{ fontWeight: 600 }}>Campaign</TableCell>
							<TableCell sx={{ fontWeight: 600, width: 140 }}>
								Pemohon
							</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Perubahan</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Alasan pengajuan</TableCell>
							<TableCell sx={{ fontWeight: 600 }}>Catatan</TableCell>
							<TableCell sx={{ fontWeight: 600, width: 100 }}>Status</TableCell>
							<TableCell sx={{ fontWeight: 600, width: 100 }}>
								Diajukan
							</TableCell>
							<TableCell sx={{ fontWeight: 600, width: 100 }}>Aksi</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{!loading && requests.length === 0 ? (
							<TableRow>
								<TableCell colSpan={8} align="center" sx={{ py: 3 }}>
									<Typography color="text.secondary" sx={{ fontSize: 12 }}>
										Belum ada pengajuan perubahan campaign
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							requests.map((req: ChangeRequestRow) => {
								const changeSummary = buildChangeSummary(req);

								return (
									<TableRow key={req.id} hover>
										<TableCell>
											<Stack spacing={0.5}>
												<Link
													href={`/admin/campaign/${req.campaign.id}`}
													style={{
														textDecoration: "none",
														color: "inherit",
													}}
												>
													<Typography fontWeight={600} sx={{ fontSize: 13 }}>
														{req.campaign.title}
													</Typography>
												</Link>
												{req.campaign.slug && (
													<Typography variant="caption" color="text.secondary">
														/{req.campaign.slug}
													</Typography>
												)}
											</Stack>
										</TableCell>
										<TableCell
											sx={{
												width: 140,
												maxWidth: 140,
												overflow: "hidden",
											}}
										>
											<Typography
												sx={{
													fontSize: 13,
													width: "100%",
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{req.user?.name || "Tanpa nama"}
											</Typography>
											{req.user?.email && (
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{
														fontSize: 11,
														width: "100%",
														overflow: "hidden",
														textOverflow: "ellipsis",
														whiteSpace: "nowrap",
													}}
												>
													{req.user.email}
												</Typography>
											)}
										</TableCell>
										<TableCell>
											<Typography variant="body2" sx={{ fontSize: 13 }}>
												{changeSummary}
											</Typography>
										</TableCell>
										<TableCell>
											{req.status === "PENDING" && req.note ? (
												<Typography
													variant="caption"
													sx={{
														display: "block",
														color: "text.secondary",
														fontSize: 11,
													}}
												>
													{req.note}
												</Typography>
											) : (
												<Typography
													variant="caption"
													sx={{
														display: "block",
														color: "text.secondary",
														fontSize: 11,
													}}
												>
													-
												</Typography>
											)}
										</TableCell>
										<TableCell>
											{req.status !== "PENDING" && req.note ? (
												<Typography
													variant="caption"
													sx={{
														display: "block",
														color: "text.secondary",
														fontSize: 11,
													}}
												>
													{req.status === "REJECTED"
														? `Alasan penolakan: ${req.note}`
														: `Catatan: ${req.note}`}
												</Typography>
											) : (
												<Typography
													variant="caption"
													sx={{
														display: "block",
														color: "text.secondary",
														fontSize: 11,
													}}
												>
													-
												</Typography>
											)}
										</TableCell>
										<TableCell sx={{ width: 90 }} align="center">
											<Chip
												label={req.status}
												size="small"
												color={
													req.status === "PENDING"
														? "warning"
														: req.status === "APPROVED"
															? "success"
															: "default"
												}
												variant="outlined"
											/>
										</TableCell>
										<TableCell sx={{ width: 120 }}>
											<Typography sx={{ fontSize: 12 }}>
												{new Date(req.createdAt).toLocaleDateString("id-ID", {
													day: "numeric",
													month: "short",
													hour: "2-digit",
													minute: "2-digit",
													timeZone: "Asia/Jakarta",
												})}
											</Typography>
										</TableCell>
										<TableCell sx={{ width: 130 }}>
											{req.status === "PENDING" ? (
												<Stack
													direction="row"
													spacing={0.5}
													justifyContent="center"
												>
													<IconButton
														size="small"
														color="success"
														onClick={() => openApprove(req)}
														aria-label="Setujui"
													>
														<CheckIcon fontSize="small" />
													</IconButton>
													<IconButton
														size="small"
														color="error"
														onClick={() => openReject(req)}
														aria-label="Tolak"
													>
														<CloseIcon fontSize="small" />
													</IconButton>
												</Stack>
											) : (
												<Typography
													variant="caption"
													color="text.secondary"
													sx={{ fontSize: 11 }}
												>
													Tidak ada aksi
												</Typography>
											)}
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
				<Pagination
					count={totalPages || 1}
					page={page}
					color="primary"
					onChange={(_, value) => setPage(value)}
				/>
			</Box>

			<Dialog
				open={approveDialog.open && !!approveDialog.req}
				onClose={() =>
					!submitting && setApproveDialog((prev) => ({ ...prev, open: false }))
				}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Setujui Pengajuan Perubahan</DialogTitle>
				<DialogContent
					sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
				>
					{approveDialog.req && (
						<>
							<Typography variant="subtitle2">
								Campaign: {approveDialog.req.campaign.title}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Pengajuan: {buildChangeSummary(approveDialog.req)}
							</Typography>
						</>
					)}
					<Stack direction="row" spacing={2} alignItems="center">
						<Button
							variant={approveDialog.applyDays ? "contained" : "outlined"}
							color="primary"
							size="small"
							onClick={() =>
								setApproveDialog((prev) => ({
									...prev,
									applyDays: !prev.applyDays,
								}))
							}
						>
							Perpanjang hari
						</Button>
						<TextField
							label="Jumlah hari"
							type="number"
							size="small"
							value={approveDialog.days}
							onChange={(e) =>
								setApproveDialog((prev) => ({
									...prev,
									days: e.target.value,
								}))
							}
							disabled={!approveDialog.applyDays}
						/>
					</Stack>
					<Stack direction="row" spacing={2} alignItems="center">
						<Button
							variant={approveDialog.applyTarget ? "contained" : "outlined"}
							color="primary"
							size="small"
							onClick={() =>
								setApproveDialog((prev) => ({
									...prev,
									applyTarget: !prev.applyTarget,
								}))
							}
						>
							Tambah target
						</Button>
						<TextField
							label="Nominal penambahan (Rp)"
							type="number"
							size="small"
							value={approveDialog.target}
							onChange={(e) =>
								setApproveDialog((prev) => ({
									...prev,
									target: e.target.value,
								}))
							}
							disabled={!approveDialog.applyTarget}
						/>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() =>
							!submitting &&
							setApproveDialog((prev) => ({ ...prev, open: false }))
						}
					>
						Batal
					</Button>
					<Button
						onClick={handleApproveConfirm}
						color="success"
						variant="contained"
						disabled={submitting}
					>
						Simpan &amp; Setujui
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog
				open={rejectDialog.open && !!rejectDialog.req}
				onClose={() =>
					!submitting && setRejectDialog((prev) => ({ ...prev, open: false }))
				}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Tolak Pengajuan Perubahan</DialogTitle>
				<DialogContent sx={{ pt: 2 }}>
					{rejectDialog.req && (
						<>
							<Typography variant="subtitle2">
								Campaign: {rejectDialog.req.campaign.title}
							</Typography>
							<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
								Pengajuan: {buildChangeSummary(rejectDialog.req)}
							</Typography>
						</>
					)}
					<TextField
						label="Alasan penolakan"
						multiline
						minRows={3}
						fullWidth
						value={rejectDialog.note}
						onChange={(e) =>
							setRejectDialog((prev) => ({
								...prev,
								note: e.target.value,
							}))
						}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() =>
							!submitting &&
							setRejectDialog((prev) => ({ ...prev, open: false }))
						}
					>
						Batal
					</Button>
					<Button
						onClick={handleRejectConfirm}
						color="error"
						variant="contained"
						disabled={submitting || !rejectDialog.note.trim()}
					>
						Kirim Penolakan
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
}
