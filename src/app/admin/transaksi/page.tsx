"use client";

import React from "react";
import Link from "next/link";
import {
	Box,
	Paper,
	Typography,
	Stack,
	Chip,
	Button,
	IconButton,
	TextField,
	InputAdornment,
	Select,
	MenuItem,
	FormControl,
	Divider,
	Pagination,
	Tooltip,
	Skeleton,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { getAdminTransactions } from "@/actions/admin";

const PAGE_SIZE = 10;

type TxStatus = "paid" | "pending" | "failed" | "refunded";
type PayMethod = "qris" | "va_bca" | "va_bri" | "gopay" | "manual";

type TxRow = {
	id: string;
	createdAt: string; // "19 Des 2025 10:21"
	campaignId: string;
	campaignTitle: string;
	donorName: string;
	donorPhone: string;
	donorEmail: string;
	message: string;
	isAnonymous: boolean;
	amount: number;
	method: PayMethod;
	status: TxStatus;
	refCode: string;
	account: {
		name: string;
		email: string;
		phone: string;
	} | null;
};

function idr(n: number) {
	if (!n) return "Rp0";
	const s = Math.round(n).toString();
	return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function matchQuery(q: string, row: TxRow) {
	if (!q) return true;
	const s = q.toLowerCase();
	return (
		row.id.toLowerCase().includes(s) ||
		row.campaignTitle.toLowerCase().includes(s) ||
		row.campaignId.toLowerCase().includes(s) ||
		row.donorName.toLowerCase().includes(s) ||
		row.refCode.toLowerCase().includes(s)
	);
}

function statusMeta(status: TxStatus) {
	switch (status) {
		case "paid":
			return {
				label: "Berhasil",
				icon: <CheckCircleRoundedIcon fontSize="small" />,
				tone: "success" as const,
			};
		case "pending":
			return {
				label: "Pending",
				icon: <HourglassBottomRoundedIcon fontSize="small" />,
				tone: "warning" as const,
			};
		case "failed":
			return {
				label: "Gagal",
				icon: <ErrorRoundedIcon fontSize="small" />,
				tone: "error" as const,
			};
		case "refunded":
			return {
				label: "Refund",
				icon: <ErrorRoundedIcon fontSize="small" />,
				tone: "info" as const,
			};
	}
}

function methodLabel(m: PayMethod) {
	switch (m) {
		case "qris":
			return "QRIS";
		case "va_bca":
			return "VA BCA";
		case "va_bri":
			return "VA BRI";
		case "gopay":
			return "GoPay";
		case "manual":
			return "Manual";
	}
}

function Surface({ children, sx }: { children: React.ReactNode; sx?: any }) {
	return (
		<Paper
			elevation={0}
			sx={{
				width: "100%",
				borderRadius: 3,
				overflow: "hidden",
				bgcolor: alpha("#ffffff", 0.04),
				backdropFilter: "blur(14px) saturate(140%)",
				border: "1px solid",
				borderColor: alpha("#000", 0.12),
				boxShadow: `0 4px 28px ${alpha("#000", 0.16)}`,
				...sx,
			}}
		>
			{children}
		</Paper>
	);
}

export default function AdminTransaksiPage() {
	const [rows, setRows] = React.useState<TxRow[]>([]);
	const [loading, setLoading] = React.useState(true);
	const [selected, setSelected] = React.useState<TxRow | null>(null);

	const [q, setQ] = React.useState("");
	const [status, setStatus] = React.useState<"all" | TxStatus>("all");
	const [method, setMethod] = React.useState<"all" | PayMethod>("all");

	const [page, setPage] = React.useState(1);

	const onRefresh = React.useCallback(async () => {
		setLoading(true);
		try {
			const res = await getAdminTransactions();
			if (res.success && res.data) {
				// @ts-ignore
				setRows(res.data);
			}
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		onRefresh();
	}, [onRefresh]);

	const filtered = React.useMemo(() => {
		let base = rows.filter((r) => matchQuery(q, r));
		if (status !== "all") base = base.filter((r) => r.status === status);
		if (method !== "all") base = base.filter((r) => r.method === method);
		return base;
	}, [rows, q, status, method]);

	React.useEffect(() => setPage(1), [q, status, method]);

	const paginated = React.useMemo(() => {
		const start = (page - 1) * 10;
		return filtered.slice(start, start + 10);
	}, [filtered, page]);

	// ===== Summary (dummy dari filtered/rows) =====
	const sum = React.useMemo(() => {
		const allPaid = rows.filter((r) => r.status === "paid");
		const todayPaid = allPaid
			.slice(0, 8)
			.reduce((a, b) => a + (b.amount || 0), 0); // dummy
		const monthPaid = allPaid.reduce((a, b) => a + (b.amount || 0), 0);

		const pendingRows = rows.filter((r) => r.status === "pending");
		const pending = pendingRows.reduce((a, b) => a + (b.amount || 0), 0);
		const pendingCount = pendingRows.length;

		const refundedCount = rows.filter((r) => r.status === "refunded").length;

		return {
			todayPaid,
			monthPaid,
			pendingCount,
			refundedCount,
			paid: monthPaid,
			pending,
		};
	}, [rows]);

	return (
		<Box sx={{ py: 2 }}>
			{/* Header */}
			<Stack
				direction="row"
				spacing={1.25}
				alignItems="center"
				justifyContent="space-between"
				sx={{ mb: 1.5 }}
			>
				<Box>
					<Typography sx={{ fontSize: 16, fontWeight: 1000 }}>
						Transaksi Donasi
					</Typography>
					<Typography sx={{ mt: 0.3, fontSize: 12, color: "text.secondary" }}>
						Monitor transaksi pembayaran donasi dan status pencairan dana.
					</Typography>
				</Box>

				<Stack direction="row" spacing={1} alignItems="center">
					<Tooltip title="Refresh">
						<IconButton
							onClick={onRefresh}
							size="small"
							sx={{
								width: 34,
								height: 34,
								borderRadius: 2,
								bgcolor: alpha("#000", 0.06),
								"&:hover": { bgcolor: alpha("#000", 0.1) },
							}}
						>
							<RefreshRoundedIcon fontSize="small" />
						</IconButton>
					</Tooltip>

					<Button
						href="/admin/campaign"
						variant="contained"
						startIcon={<PaidRoundedIcon />}
						sx={{
							borderRadius: 999,
							fontWeight: 900,
							boxShadow: "none",
						}}
					>
						Pencairan
					</Button>
				</Stack>
			</Stack>

			{/* Summary cards (compact) */}
			<Grid container spacing={1.5} sx={{ mb: 1.5 }}>
				<Grid size={{ xs: 12, md: 6 }}>
					<Surface sx={{ p: 1.5 }}>
						<Stack direction="row" spacing={1.2} alignItems="center">
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: 999,
									bgcolor: alpha("#22c55e", 0.1),
									color: "#22c55e",
									display: "grid",
									placeItems: "center",
								}}
							>
								<CheckCircleRoundedIcon />
							</Box>
							<Box>
								<Typography
									variant="body2"
									sx={{ color: "text.secondary", fontWeight: 700 }}
								>
									Total Terbayar
								</Typography>
								<Typography sx={{ mt: 0.2, fontSize: 16, fontWeight: 1000 }}>
									{idr(sum.paid)}
								</Typography>
							</Box>
						</Stack>
					</Surface>
				</Grid>

				<Grid size={{ xs: 12, md: 6 }}>
					<Surface sx={{ p: 1.5 }}>
						<Stack direction="row" spacing={1.2} alignItems="center">
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: 999,
									bgcolor: alpha("#0288d1", 0.1),
									color: "#0288d1",
									display: "grid",
									placeItems: "center",
								}}
							>
								<PaidRoundedIcon />
							</Box>
							<Box>
								<Typography
									variant="body2"
									sx={{ color: "text.secondary", fontWeight: 700 }}
								>
									Bulan Ini
								</Typography>
								<Typography sx={{ mt: 0.2, fontSize: 16, fontWeight: 1000 }}>
									{idr(sum.monthPaid)}
								</Typography>
							</Box>
						</Stack>
					</Surface>
				</Grid>
			</Grid>

			{/* Filters */}
			<Surface sx={{ p: 1.5 }}>
				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={1}
					alignItems={{ md: "center" }}
				>
					<TextField
						size="small"
						value={q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="Cari transaksi, campaign, donatur, ref..."
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchRoundedIcon fontSize="small" />
								</InputAdornment>
							),
						}}
						sx={{
							flex: 1,
							"& .MuiOutlinedInput-root": {
								borderRadius: 2.25,
								bgcolor: alpha("#ffffff", 0.08),
								"& fieldset": { borderColor: "transparent" },
							},
						}}
					/>

					<FormControl size="small" sx={{ minWidth: 160 }}>
						<Select
							value={status}
							onChange={(e) => setStatus(e.target.value as any)}
							displayEmpty
							sx={{
								borderRadius: 2.25,
								bgcolor: alpha("#ffffff", 0.08),
								"& fieldset": { borderColor: "transparent" },
							}}
						>
							<MenuItem value="all">Semua Status</MenuItem>
							<MenuItem value="paid">Berhasil</MenuItem>
							<MenuItem value="failed">Gagal</MenuItem>
							<MenuItem value="refunded">Refund</MenuItem>
						</Select>
					</FormControl>

					<FormControl size="small" sx={{ minWidth: 160 }}>
						<Select
							value={method}
							onChange={(e) => setMethod(e.target.value as any)}
							displayEmpty
							sx={{
								borderRadius: 2.25,
								bgcolor: alpha("#ffffff", 0.08),
								"& fieldset": { borderColor: "transparent" },
							}}
						>
							<MenuItem value="all">Semua Metode</MenuItem>
							<MenuItem value="qris">QRIS</MenuItem>
							<MenuItem value="va_bca">VA BCA</MenuItem>
							<MenuItem value="va_bri">VA BRI</MenuItem>
							<MenuItem value="gopay">GoPay</MenuItem>
							<MenuItem value="manual">Manual</MenuItem>
						</Select>
					</FormControl>
				</Stack>
			</Surface>

			{/* List */}
			<Box sx={{ mt: 2 }}>
				<Stack spacing={1}>
					{loading
						? Array.from({ length: 6 }).map((_, i) => (
								<Skeleton
									key={i}
									variant="rectangular"
									width="100%"
									height={80}
									sx={{ borderRadius: 1 }}
								/>
						  ))
						: paginated.map((row) => (
								<TxRowCard
									key={row.id}
									row={row}
									onClick={() => setSelected(row)}
								/>
						  ))}
				</Stack>
			</Box>

			{/* Pagination */}
			<Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
				<Pagination
					count={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
					page={page}
					onChange={(_, p) => setPage(p)}
					color="primary"
					shape="rounded"
				/>
			</Box>

			{/* Detail Dialog */}
			<Dialog
				open={Boolean(selected)}
				onClose={() => setSelected(null)}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: 3,
						bgcolor: "background.paper",
						backgroundImage: "none",
					},
				}}
			>
				{selected && (
					<>
						<DialogTitle
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								p: 2.5,
								pb: 1,
							}}
						>
							<Typography sx={{ fontSize: 18, fontWeight: 1000 }}>
								Detail Transaksi
							</Typography>
							<IconButton onClick={() => setSelected(null)} size="small">
								<CloseRoundedIcon />
							</IconButton>
						</DialogTitle>
						<DialogContent sx={{ p: 2.5 }}>
							<Stack spacing={2}>
								<Surface sx={{ p: 2, bgcolor: alpha("#000", 0.03) }}>
									<Typography
										align="center"
										sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}
									>
										Nominal Donasi
									</Typography>
									<Typography
										align="center"
										sx={{ fontSize: 32, fontWeight: 1000 }}
									>
										{idr(selected.amount)}
									</Typography>
									<Stack
										direction="row"
										spacing={1}
										justifyContent="center"
										sx={{ mt: 1 }}
									>
										<Chip
											label={statusMeta(selected.status).label}
											size="small"
											color={statusMeta(selected.status).tone}
											sx={{ fontWeight: 900 }}
										/>
										<Chip
											label={methodLabel(selected.method)}
											size="small"
											variant="outlined"
											sx={{ fontWeight: 900 }}
										/>
									</Stack>
								</Surface>

								<Stack spacing={1.5}>
									<InfoRow label="ID Transaksi" value={selected.id} />
									<InfoRow label="Ref Code" value={selected.refCode} />
									<InfoRow label="Tanggal" value={selected.createdAt} />
								</Stack>

								<Divider />

								<Typography sx={{ fontSize: 14, fontWeight: 900 }}>
									Informasi Donatur
								</Typography>
								<Stack spacing={1.5}>
									<InfoRow label="Nama" value={selected.donorName} />
									<InfoRow label="Email" value={selected.donorEmail} />
									<InfoRow label="No. HP" value={selected.donorPhone} />
									<InfoRow
										label="Anonim"
										value={selected.isAnonymous ? "Ya" : "Tidak"}
									/>
								</Stack>

								{selected.account && (
									<>
										<Divider />
										<Typography sx={{ fontSize: 14, fontWeight: 900 }}>
											Informasi Akun (Terdaftar)
										</Typography>
										<Stack spacing={1.5}>
											<InfoRow
												label="Nama Akun"
												value={selected.account.name}
											/>
											<InfoRow label="Email" value={selected.account.email} />
											<InfoRow label="No. HP" value={selected.account.phone} />
										</Stack>
									</>
								)}

								<Divider />

								<Typography sx={{ fontSize: 14, fontWeight: 900 }}>
									Campaign & Pesan
								</Typography>
								<Stack spacing={1.5}>
									<InfoRow label="Campaign" value={selected.campaignTitle} />
									<Box>
										<Typography
											sx={{ fontSize: 12.5, color: "text.secondary", mb: 0.5 }}
										>
											Pesan / Doa
										</Typography>
										<Paper
											variant="outlined"
											sx={{
												p: 1.5,
												borderRadius: 2,
												bgcolor: alpha("#000", 0.02),
												border: "none",
											}}
										>
											<Typography
												sx={{
													fontSize: 13.5,
													fontStyle:
														selected.message !== "-" ? "normal" : "italic",
													color:
														selected.message !== "-"
															? "text.primary"
															: "text.secondary",
												}}
											>
												{selected.message}
											</Typography>
										</Paper>
									</Box>
								</Stack>
							</Stack>
						</DialogContent>
						<DialogActions sx={{ p: 2.5, pt: 0 }}>
							<Button
								fullWidth
								variant="outlined"
								onClick={() => setSelected(null)}
								sx={{ borderRadius: 999, fontWeight: 900, height: 44 }}
							>
								Tutup
							</Button>
						</DialogActions>
					</>
				)}
			</Dialog>
		</Box>
	);
}

function TxRowCard({ row, onClick }: { row: TxRow; onClick?: () => void }) {
	const meta = statusMeta(row.status);

	return (
		<Surface
			sx={{
				p: 2,
				cursor: onClick ? "pointer" : "default",
				transition: "all 0.2s",
				"&:hover": onClick
					? { bgcolor: alpha("#ffffff", 0.1), transform: "translateY(-2px)" }
					: {},
			}}
		>
			<Stack
				direction="row"
				spacing={1.5}
				alignItems="center"
				sx={{ minWidth: 0 }}
				onClick={onClick}
			>
				<Box
					sx={{
						width: 40,
						height: 40,
						borderRadius: 2.5,
						display: "grid",
						placeItems: "center",
						bgcolor: alpha(
							meta.tone === "success" ? "#22c55e" : "#f97316",
							0.12
						),
						color: meta.tone === "success" ? "#22c55e" : "#f97316",
					}}
				>
					{meta.icon}
				</Box>

				<Box sx={{ flex: 1 }}>
					<Typography sx={{ fontSize: 13, fontWeight: 1000 }}>
						{row.id} • {idr(row.amount)}
					</Typography>
					<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
						{row.createdAt} • {methodLabel(row.method)} • {row.refCode}
					</Typography>
				</Box>

				<Box>
					<Button
						href={`/admin/campaign/${row.campaignId}`}
						variant="outlined"
						size="small"
						endIcon={<ArrowForwardRoundedIcon />}
						onClick={(e) => e.stopPropagation()}
						sx={{
							borderRadius: 999,
							fontWeight: 900,
							color: "text.secondary",
						}}
					>
						Campaign
					</Button>
				</Box>
			</Stack>
		</Surface>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return (
		<Stack
			direction="row"
			justifyContent="space-between"
			alignItems="center"
			spacing={2}
		>
			<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
				{label}
			</Typography>
			<Typography sx={{ fontSize: 13, fontWeight: 900, textAlign: "right" }}>
				{value}
			</Typography>
		</Stack>
	);
}
