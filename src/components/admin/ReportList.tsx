"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
	Box,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	Chip,
	IconButton,
	Menu,
	MenuItem,
	CircularProgress,
	Pagination,
	FormControl,
	Select,
	InputLabel,
	Stack,
	Button,
	Drawer,
	Divider,
	Grid,
	Card,
	CardContent,
	Skeleton,
	Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { getReports, updateReportStatus } from "@/actions/report";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const STATUS_COLORS = {
	PENDING: "warning",
	REVIEWED: "info",
	RESOLVED: "success",
	REJECTED: "error",
} as const;

const STATUS_LABELS: Record<string, string> = {
	PENDING: "Menunggu",
	REVIEWED: "Ditinjau",
	RESOLVED: "Selesai",
	REJECTED: "Ditolak",
};

const REASON_LABELS: Record<string, string> = {
	FRAUD: "Penipuan/Penyalahgunaan dana",
	COVERED: "Sudah di-cover pihak lain",
	FAKE_INFO: "Informasi palsu",
	DECEASED: "Beneficiary meninggal",
	NO_PERMISSION: "Tanpa izin keluarga",
	IRRELEVANT: "Tidak relevan",
	INAPPROPRIATE: "Konten tidak pantas",
	SPAM: "Spamming",
	OTHER: "Lainnya",
};

type ReportItem = {
	id: string;
	createdAt: string | Date;
	campaignId: string;
	campaign?: { title?: string | null } | null;
	reporterName?: string | null;
	reporterEmail?: string | null;
	reporterPhone?: string | null;
	reason: string;
	details?: string | null;
	status: "PENDING" | "REVIEWED" | "RESOLVED" | "REJECTED" | string;
};

type CampaignGroup = {
	campaignId: string;
	campaignTitle: string;
	campaignIdShort: string;
	lastReportedAt: Date;
	reports: ReportItem[];
	totalReports: number;
	reasonCounts: Record<string, number>;
	statusCounts: Record<string, number>;
	aggregateStatus: string;
};

function getAggregateStatus(statusCounts: Record<string, number>) {
	// “worst-first” / paling butuh perhatian
	if ((statusCounts.PENDING || 0) > 0) return "PENDING";
	if ((statusCounts.REVIEWED || 0) > 0) return "REVIEWED";
	if ((statusCounts.REJECTED || 0) > 0) return "REJECTED";
	if ((statusCounts.RESOLVED || 0) > 0) return "RESOLVED";
	return "PENDING";
}

function sortEntriesDesc(obj: Record<string, number>) {
	return Object.entries(obj).sort((a, b) => (b[1] || 0) - (a[1] || 0));
}

export default function ReportList() {
	const [reports, setReports] = useState<ReportItem[]>([]);
	const [loading, setLoading] = useState(true);

	// NOTE: API kamu paging-nya masih per-report, jadi grouping ini akan “sebatas data yg kebetulan ada di page itu”.
	// Kalau mau 100% rapi per-campaign, idealnya backend paging per-campaign.
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [statusFilter, setStatusFilter] = useState("all");

	// menu status (per report)
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

	// drawer detail (per campaign)
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
		null
	);

	const [bulkUpdating, setBulkUpdating] = useState(false);

	const fetchReports = async () => {
		setLoading(true);
		// kamu bisa naikin limit (mis. 20/25) biar grouping per-campaign lebih “kerasa”
		const res = await getReports(page, 20, statusFilter);
		if (res.success && res.data) {
			setReports(res.data as ReportItem[]);
			setTotalPages(res.pagination?.pages || 1);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchReports();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, statusFilter]);

	const groupedCampaigns: CampaignGroup[] = useMemo(() => {
		const map = new Map<string, CampaignGroup>();

		for (const r of reports) {
			const campaignId = r.campaignId;
			const createdAt = new Date(r.createdAt);

			if (!map.has(campaignId)) {
				map.set(campaignId, {
					campaignId,
					campaignTitle: r.campaign?.title || "(Tanpa judul)",
					campaignIdShort: (campaignId || "").slice(0, 8),
					lastReportedAt: createdAt,
					reports: [r],
					totalReports: 1,
					reasonCounts: { [r.reason]: 1 },
					statusCounts: { [r.status]: 1 },
					aggregateStatus: "PENDING",
				});
			} else {
				const g = map.get(campaignId)!;
				g.reports.push(r);
				g.totalReports += 1;
				if (createdAt > g.lastReportedAt) g.lastReportedAt = createdAt;
				g.reasonCounts[r.reason] = (g.reasonCounts[r.reason] || 0) + 1;
				g.statusCounts[r.status] = (g.statusCounts[r.status] || 0) + 1;
			}
		}

		const arr = Array.from(map.values()).map((g) => ({
			...g,
			aggregateStatus: getAggregateStatus(g.statusCounts),
		}));

		// urutkan paling butuh perhatian dulu
		const priority = (s: string) => {
			if (s === "PENDING") return 0;
			if (s === "REVIEWED") return 1;
			if (s === "REJECTED") return 2;
			if (s === "RESOLVED") return 3;
			return 4;
		};

		return arr.sort((a, b) => {
			const pa = priority(a.aggregateStatus);
			const pb = priority(b.aggregateStatus);
			if (pa !== pb) return pa - pb;
			return b.lastReportedAt.getTime() - a.lastReportedAt.getTime();
		});
	}, [reports]);

	const selectedCampaign = useMemo(() => {
		if (!selectedCampaignId) return null;
		return (
			groupedCampaigns.find((g) => g.campaignId === selectedCampaignId) || null
		);
	}, [groupedCampaigns, selectedCampaignId]);

	const kpi = useMemo(() => {
		const base = { PENDING: 0, REVIEWED: 0, RESOLVED: 0, REJECTED: 0 };
		for (const r of reports) {
			const s = r.status as keyof typeof base;
			if (base[s] !== undefined) base[s] += 1;
		}
		return base;
	}, [reports]);

	const openMenu = (event: React.MouseEvent<HTMLElement>, reportId: string) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
		setSelectedReportId(reportId);
	};

	const closeMenu = () => {
		setAnchorEl(null);
		setSelectedReportId(null);
	};

	const handleStatusChange = async (newStatus: string) => {
		if (!selectedReportId) return;
		await updateReportStatus(selectedReportId, newStatus as any);
		await fetchReports();
		closeMenu();
	};

	const openCampaignDrawer = (campaignId: string) => {
		setSelectedCampaignId(campaignId);
		setDrawerOpen(true);
	};

	const closeCampaignDrawer = () => {
		setDrawerOpen(false);
	};

	const bulkUpdateCampaignStatus = async (newStatus: string) => {
		if (!selectedCampaign) return;
		setBulkUpdating(true);
		try {
			// update semua report di campaign ini
			await Promise.all(
				selectedCampaign.reports.map((r) =>
					updateReportStatus(r.id, newStatus as any)
				)
			);
			await fetchReports();
		} finally {
			setBulkUpdating(false);
		}
	};

	const renderSkeletonRows = () => {
		return Array.from({ length: 6 }).map((_, idx) => (
			<TableRow key={`sk-${idx}`}>
				<TableCell>
					<Skeleton variant="text" width={110} />
					<Skeleton variant="text" width={80} />
				</TableCell>
				<TableCell>
					<Skeleton variant="text" width={220} />
					<Skeleton variant="text" width={140} />
				</TableCell>
				<TableCell>
					<Skeleton variant="text" width={60} />
				</TableCell>
				<TableCell>
					<Skeleton variant="text" width={260} />
				</TableCell>
				<TableCell>
					<Skeleton variant="rounded" width={90} height={26} />
				</TableCell>
				<TableCell align="right">
					<Skeleton
						variant="rounded"
						width={86}
						height={32}
						sx={{ ml: "auto" }}
					/>
				</TableCell>
			</TableRow>
		));
	};

	return (
		<Box>
			{/* Header */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					mb: 2,
					gap: 2,
					flexWrap: "wrap",
				}}
			>
				<Box>
					<Typography variant="h5" fontWeight={800} color="#0f172a">
						Pusat Pengaduan
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Laporan campaign bermasalah dari pengguna
					</Typography>
				</Box>

				<Stack direction="row" spacing={2} alignItems="center">
					<FormControl size="small" sx={{ minWidth: 170 }}>
						<InputLabel>Status</InputLabel>
						<Select
							value={statusFilter}
							label="Status"
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<MenuItem value="all">Semua</MenuItem>
							<MenuItem value="pending">Pending</MenuItem>
							<MenuItem value="reviewed">Reviewed</MenuItem>
							<MenuItem value="resolved">Resolved</MenuItem>
							<MenuItem value="rejected">Rejected</MenuItem>
						</Select>
					</FormControl>

					<Button
						variant="outlined"
						startIcon={<RefreshIcon />}
						onClick={fetchReports}
					>
						Refresh
					</Button>
				</Stack>
			</Box>

			{/* KPI Cards */}
			<Grid container spacing={2} sx={{ mb: 3 }}>
				{(["PENDING", "REVIEWED", "RESOLVED", "REJECTED"] as const).map((s) => {
					const config = {
						PENDING: {
							icon: AccessTimeIcon,
							bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
							text: "#9a3412",
							border: "#fed7aa",
						},
						REVIEWED: {
							icon: VisibilityIcon,
							bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
							text: "#1e40af",
							border: "#bfdbfe",
						},
						RESOLVED: {
							icon: CheckCircleIcon,
							bg: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
							text: "#166534",
							border: "#bbf7d0",
						},
						REJECTED: {
							icon: CancelIcon,
							bg: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
							text: "#991b1b",
							border: "#fecaca",
						},
					}[s];

					const Icon = config.icon;

					return (
						<Grid item xs={12} sm={6} md={3} key={s}>
							<Card
								variant="outlined"
								sx={{
									borderRadius: 4,
									border: `1px solid ${config.border}`,
									background: config.bg,
									height: "100%",
									position: "relative",
									overflow: "hidden",
									transition: "transform 0.2s, box-shadow 0.2s",
									"&:hover": {
										transform: "translateY(-4px)",
										boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
									},
								}}
							>
								{/* Decorative circle */}
								<Box
									sx={{
										position: "absolute",
										top: -20,
										right: -20,
										width: 100,
										height: 100,
										borderRadius: "50%",
										bgcolor: "rgba(255,255,255,0.4)",
										zIndex: 0,
									}}
								/>

								<CardContent sx={{ position: "relative", zIndex: 1, p: 3 }}>
									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="start"
									>
										<Box>
											<Typography
												variant="subtitle2"
												fontWeight={600}
												sx={{ color: config.text, mb: 0.5, opacity: 0.9 }}
											>
												{STATUS_LABELS[s]}
											</Typography>
											<Typography
												variant="h4"
												fontWeight={800}
												sx={{ color: config.text }}
											>
												{loading ? <Skeleton width={40} /> : (kpi as any)[s]}
											</Typography>
										</Box>
										<Box
											sx={{
												p: 1,
												borderRadius: "12px",
												bgcolor: "rgba(255,255,255,0.5)",
												color: config.text,
												display: "flex",
											}}
										>
											<Icon fontSize="medium" />
										</Box>
									</Stack>
								</CardContent>
							</Card>
						</Grid>
					);
				})}
			</Grid>

			{/* Table grouped by campaign */}
			<TableContainer
				component={Paper}
				elevation={0}
				sx={{
					border: "1px solid #e2e8f0",
					borderRadius: "14px",
					overflow: "hidden",
				}}
			>
				<Table>
					<TableHead sx={{ bgcolor: "#f8fafc" }}>
						<TableRow>
							<TableCell sx={{ fontWeight: 700 }}>
								Terakhir Dilaporkan
							</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Campaign</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Jumlah Laporan</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Masalah Dominan</TableCell>
							<TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
							<TableCell align="right" sx={{ fontWeight: 700 }}>
								Aksi
							</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{loading ? (
							renderSkeletonRows()
						) : groupedCampaigns.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} align="center" sx={{ py: 6 }}>
									<Typography color="text.secondary">
										Tidak ada laporan ditemukan
									</Typography>
								</TableCell>
							</TableRow>
						) : (
							groupedCampaigns.map((g) => {
								const topReasons = sortEntriesDesc(g.reasonCounts).slice(0, 2);
								const status = g.aggregateStatus;

								return (
									<TableRow
										key={g.campaignId}
										hover
										onClick={() => openCampaignDrawer(g.campaignId)}
										sx={{
											cursor: "pointer",
											"&:hover": { bgcolor: "#fafafa" },
										}}
									>
										<TableCell>
											<Typography variant="body2" fontWeight={700}>
												{format(g.lastReportedAt, "dd MMM yyyy", {
													locale: id,
												})}
											</Typography>
											<Typography
												variant="caption"
												color="text.secondary"
												display="block"
											>
												{format(g.lastReportedAt, "HH:mm", { locale: id })} •{" "}
												{formatDistanceToNow(g.lastReportedAt, {
													addSuffix: true,
													locale: id,
												})}
											</Typography>
										</TableCell>

										<TableCell>
											<Typography
												variant="body2"
												fontWeight={800}
												color="#0f172a"
											>
												{g.campaignTitle}
											</Typography>
											<Typography variant="caption" color="text.secondary">
												ID: {g.campaignIdShort}...
											</Typography>
										</TableCell>

										<TableCell>
											<Chip
												label={`${g.totalReports} laporan`}
												size="small"
												variant="outlined"
												sx={{ borderRadius: "10px", fontWeight: 800 }}
											/>
										</TableCell>

										<TableCell>
											<Stack
												direction="row"
												spacing={1}
												sx={{ flexWrap: "wrap" }}
											>
												{topReasons.map(([reason, count]) => (
													<Tooltip
														key={reason}
														title={`${
															REASON_LABELS[reason] || reason
														} • ${count}`}
														arrow
													>
														<Chip
															label={`${
																REASON_LABELS[reason] || reason
															} (${count})`}
															size="small"
															variant="outlined"
															sx={{
																borderRadius: "10px",
																maxWidth: 320,
															}}
														/>
													</Tooltip>
												))}
												{Object.keys(g.reasonCounts).length > 2 && (
													<Chip
														label={`+${Object.keys(g.reasonCounts).length - 2}`}
														size="small"
														variant="outlined"
														sx={{ borderRadius: "10px" }}
													/>
												)}
											</Stack>
										</TableCell>

										<TableCell>
											<Chip
												label={STATUS_LABELS[status] || status}
												color={
													STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
													"default"
												}
												size="small"
												sx={{ fontWeight: 900, borderRadius: "10px" }}
											/>
										</TableCell>

										<TableCell
											align="right"
											onClick={(e) => e.stopPropagation()}
										>
											<Button
												size="small"
												onClick={() => openCampaignDrawer(g.campaignId)}
											>
												Lihat
											</Button>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</TableContainer>

			<Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
				<Pagination
					count={totalPages}
					page={page}
					onChange={(_, p) => setPage(p)}
					color="primary"
				/>
			</Box>

			{/* Drawer detail campaign */}
			<Drawer
				anchor="right"
				open={drawerOpen}
				onClose={closeCampaignDrawer}
				PaperProps={{
					sx: {
						width: { xs: "100%", sm: 520 },
						p: 2,
					},
				}}
			>
				{selectedCampaign ? (
					<Stack spacing={2}>
						{/* Header */}
						<Box>
							<Typography variant="overline" color="text.secondary">
								Detail Campaign
							</Typography>
							<Typography
								variant="h6"
								fontWeight={900}
								color="#0f172a"
								sx={{ lineHeight: 1.2 }}
							>
								{selectedCampaign.campaignTitle}
							</Typography>
							<Typography variant="caption" color="text.secondary">
								ID: {selectedCampaign.campaignIdShort}... •{" "}
								{selectedCampaign.totalReports} laporan
							</Typography>
						</Box>

						<Divider />

						{/* Summary chips */}
						<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
							{(["PENDING", "REVIEWED", "RESOLVED", "REJECTED"] as const).map(
								(s) => (
									<Chip
										key={s}
										label={`${STATUS_LABELS[s]}: ${
											selectedCampaign.statusCounts[s] || 0
										}`}
										size="small"
										variant="outlined"
										sx={{ borderRadius: "10px", fontWeight: 800 }}
									/>
								)
							)}
						</Stack>

						{/* Bulk action */}
						<Paper
							variant="outlined"
							sx={{
								p: 1.5,
								borderRadius: 3,
								borderColor: "#e2e8f0",
								bgcolor: "#f8fafc",
							}}
						>
							<Stack
								direction="row"
								spacing={1}
								alignItems="center"
								justifyContent="space-between"
							>
								<Box>
									<Typography variant="subtitle2" fontWeight={900}>
										Aksi Cepat
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Ubah status semua laporan di campaign ini
									</Typography>
								</Box>
								<Stack direction="row" spacing={1}>
									<Button
										size="small"
										variant="outlined"
										color="error"
										disabled={bulkUpdating}
										onClick={() => bulkUpdateCampaignStatus("REJECTED")}
									>
										{bulkUpdating ? (
											<CircularProgress size={16} />
										) : (
											"Tolak Laporan"
										)}
									</Button>
									<Button
										size="small"
										variant="outlined"
										disabled={bulkUpdating}
										onClick={() => bulkUpdateCampaignStatus("REVIEWED")}
									>
										{bulkUpdating ? (
											<CircularProgress size={16} />
										) : (
											"Tandai Ditinjau"
										)}
									</Button>
									<Button
										size="small"
										variant="contained"
										disabled={bulkUpdating}
										onClick={() => bulkUpdateCampaignStatus("RESOLVED")}
									>
										{bulkUpdating ? (
											<CircularProgress size={16} />
										) : (
											"Selesaikan"
										)}
									</Button>
								</Stack>
							</Stack>
						</Paper>

						{/* Dominant reasons */}
						<Box>
							<Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>
								Ringkasan Masalah
							</Typography>
							<Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
								{sortEntriesDesc(selectedCampaign.reasonCounts)
									.slice(0, 6)
									.map(([reason, count]) => (
										<Chip
											key={reason}
											label={`${REASON_LABELS[reason] || reason} • ${count}`}
											size="small"
											variant="outlined"
											sx={{ borderRadius: "10px" }}
										/>
									))}
							</Stack>
						</Box>

						<Divider />

						{/* Reporters list */}
						<Box>
							<Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>
								Daftar Pelapor
							</Typography>

							<TableContainer
								component={Paper}
								variant="outlined"
								sx={{ borderRadius: 3, borderColor: "#e2e8f0" }}
							>
								<Table size="small">
									<TableHead sx={{ bgcolor: "#f8fafc" }}>
										<TableRow>
											<TableCell sx={{ fontWeight: 800 }}>Waktu</TableCell>
											<TableCell sx={{ fontWeight: 800 }}>Pelapor</TableCell>
											<TableCell sx={{ fontWeight: 800 }}>Masalah</TableCell>
											<TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
											<TableCell align="right" sx={{ fontWeight: 800 }}>
												Aksi
											</TableCell>
										</TableRow>
									</TableHead>

									<TableBody>
										{selectedCampaign.reports
											.slice()
											.sort(
												(a, b) =>
													new Date(b.createdAt).getTime() -
													new Date(a.createdAt).getTime()
											)
											.map((r) => (
												<TableRow key={r.id} hover>
													<TableCell>
														<Typography variant="caption" fontWeight={800}>
															{format(new Date(r.createdAt), "dd MMM", {
																locale: id,
															})}{" "}
															{format(new Date(r.createdAt), "HH:mm", {
																locale: id,
															})}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
															display="block"
														>
															{formatDistanceToNow(new Date(r.createdAt), {
																addSuffix: true,
																locale: id,
															})}
														</Typography>
													</TableCell>

													<TableCell>
														<Typography variant="body2" fontWeight={800}>
															{r.reporterName || "-"}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															{r.reporterEmail || "-"}
														</Typography>
													</TableCell>

													<TableCell>
														<Tooltip title={r.details || ""} arrow>
															<Box>
																<Typography
																	variant="caption"
																	fontWeight={800}
																	display="block"
																>
																	{REASON_LABELS[r.reason] || r.reason}
																</Typography>
																<Typography
																	variant="caption"
																	color="text.secondary"
																	sx={{
																		maxWidth: 220,
																		whiteSpace: "nowrap",
																		overflow: "hidden",
																		textOverflow: "ellipsis",
																		display: "block",
																	}}
																>
																	{r.details || "-"}
																</Typography>
															</Box>
														</Tooltip>
													</TableCell>

													<TableCell>
														<Chip
															label={STATUS_LABELS[r.status] || r.status}
															color={
																STATUS_COLORS[
																	r.status as keyof typeof STATUS_COLORS
																] || "default"
															}
															size="small"
															sx={{ fontWeight: 900, borderRadius: "10px" }}
														/>
													</TableCell>

													<TableCell align="right">
														<IconButton
															size="small"
															onClick={(e) => openMenu(e, r.id)}
														>
															<MoreVertIcon fontSize="small" />
														</IconButton>
													</TableCell>
												</TableRow>
											))}
									</TableBody>
								</Table>
							</TableContainer>

							<Typography
								variant="caption"
								color="text.secondary"
								sx={{ mt: 1, display: "block" }}
							>
								Catatan: daftar ini digroup berdasarkan data yang ter-load pada
								halaman (paging API masih per-report).
							</Typography>
						</Box>

						<Divider />

						<Stack direction="row" spacing={1}>
							<Button
								fullWidth
								variant="outlined"
								onClick={closeCampaignDrawer}
							>
								Tutup
							</Button>
						</Stack>
					</Stack>
				) : (
					<Box sx={{ p: 2 }}>
						<Typography variant="body2" color="text.secondary">
							Pilih campaign untuk melihat detail.
						</Typography>
					</Box>
				)}
			</Drawer>

			{/* Menu status per report */}
			<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
				<MenuItem onClick={() => handleStatusChange("PENDING")}>
					Tandai Menunggu
				</MenuItem>
				<MenuItem onClick={() => handleStatusChange("REVIEWED")}>
					Tandai Ditinjau
				</MenuItem>
				<MenuItem onClick={() => handleStatusChange("RESOLVED")}>
					Tandai Selesai
				</MenuItem>
				<MenuItem onClick={() => handleStatusChange("REJECTED")}>
					Tandai Ditolak
				</MenuItem>
			</Menu>
		</Box>
	);
}
