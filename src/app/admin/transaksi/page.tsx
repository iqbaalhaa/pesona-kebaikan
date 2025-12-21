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
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";

const PAGE_SIZE = 10;

type TxStatus = "paid" | "pending" | "failed" | "refunded";
type PayMethod = "qris" | "va_bca" | "va_bri" | "gopay" | "manual";

type TxRow = {
	id: string;
	createdAt: string; // "19 Des 2025 10:21"
	campaignId: string;
	campaignTitle: string;
	donorName: string;
	amount: number;
	method: PayMethod;
	status: TxStatus;
	refCode: string;
};

const MOCK: TxRow[] = Array.from({ length: 47 }).map((_, i) => {
	const idx = i + 1;
	const statusPool: TxStatus[] = ["paid", "pending", "failed", "refunded"];
	const methodPool: PayMethod[] = [
		"qris",
		"va_bca",
		"va_bri",
		"gopay",
		"manual",
	];
	const status = statusPool[idx % statusPool.length];
	const method = methodPool[idx % methodPool.length];

	return {
		id: `trx-${String(idx).padStart(4, "0")}`,
		createdAt: `19 Des 2025 ${String(8 + (idx % 10)).padStart(2, "0")}:${String(
			(idx * 7) % 60
		).padStart(2, "0")}`,
		campaignId: `cmp-${String((idx % 12) + 1).padStart(3, "0")}`,
		campaignTitle:
			idx % 3 === 0
				? "Bantu Abi Melawan Kanker Hati"
				: idx % 3 === 1
				? "Bangun Kembali Masjid Terdampak Bencana"
				: "Bantu Biaya Sekolah Anak",
		donorName: idx % 5 === 0 ? "Anonim" : `Donatur ${idx}`,
		amount:
			status === "failed" ? 0 : 10000 * ((idx % 20) + 1) + (idx % 3) * 5000,
		method,
		status,
		refCode: `PK-${Date.now().toString().slice(-6)}-${idx}`,
	};
});

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

	const [q, setQ] = React.useState("");
	const [status, setStatus] = React.useState<"all" | TxStatus>("all");
	const [method, setMethod] = React.useState<"all" | PayMethod>("all");

	const [page, setPage] = React.useState(1);

	React.useEffect(() => {
		const t = setTimeout(() => {
			setRows(MOCK);
			setLoading(false);
		}, 350);
		return () => clearTimeout(t);
	}, []);

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

	const onRefresh = () => {
		setLoading(true);
		setTimeout(() => {
			setRows(MOCK);
			setLoading(false);
		}, 300);
	};

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
							onClick={() => setLoading(true)}
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
						Ke Pencairan Dana
					</Button>
				</Stack>
			</Stack>

			{/* Summary cards (compact) */}
			<Grid container spacing={1.5} sx={{ mb: 1.5 }}>
				<Grid size={{ xs: 12, md: 4 }}>
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

				<Grid size={{ xs: 12, md: 4 }}>
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

				<Grid size={{ xs: 12, md: 4 }}>
					<Surface sx={{ p: 1.5 }}>
						<Stack direction="row" spacing={1.2} alignItems="center">
							<Box
								sx={{
									width: 40,
									height: 40,
									borderRadius: 999,
									bgcolor: alpha("#f5a623", 0.1),
									color: "#f5a623",
									display: "grid",
									placeItems: "center",
								}}
							>
								<HourglassBottomRoundedIcon />
							</Box>
							<Box>
								<Typography
									variant="body2"
									sx={{ color: "text.secondary", fontWeight: 700 }}
								>
									Menunggu Pembayaran
								</Typography>
								<Typography sx={{ mt: 0.2, fontSize: 16, fontWeight: 1000 }}>
									{idr(sum.pending)}
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
							<MenuItem value="pending">Pending</MenuItem>
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
						: paginated.map((row) => <TxRowCard key={row.id} row={row} />)}
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
		</Box>
	);
}

function TxRowCard({ row }: { row: TxRow }) {
	const meta = statusMeta(row.status);

	return (
		<Surface sx={{ p: 2 }}>
			<Stack
				direction="row"
				spacing={1.5}
				alignItems="center"
				sx={{ minWidth: 0 }}
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
