"use client";

import * as React from "react";
import Link from "next/link";
import {
	Alert,
	Chip,
	CircularProgress,
	MenuItem,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TableSortLabel,
	TextField,
	Typography,
} from "@mui/material";
import { getCampaignStatsRanking } from "@/actions/campaign-stats";
import { idr } from "@/lib/currency";
import { SOURCE_LABELS } from "@/lib/tracking-source";
import { pct } from "@/components/stats/StatsBreakdownTable";

type Row = Extract<
	Awaited<ReturnType<typeof getCampaignStatsRanking>>,
	{ success: true }
>["data"]["rows"][number];
type SortKey = "views" | "clicks" | "checkouts" | "paid" | "paidAmount" | "conv";

const PAGE_SIZE = 50;
const wibDate = (offsetDays: number) =>
	new Date(Date.now() + 7 * 3600_000 - offsetDays * 86400_000).toISOString().slice(0, 10);
const conv = (r: Row) => (r.views > 0 ? r.paid / r.views : 0);
// Busy but barely converting: worth a look (story, photos, target, payment issues).
const lowConversion = (r: Row) => r.views >= 50 && conv(r) < 0.01;

export default function CampaignRankingClient() {
	const [from, setFrom] = React.useState(wibDate(29));
	const [to, setTo] = React.useState(wibDate(0));
	const [source, setSource] = React.useState("");
	const [rows, setRows] = React.useState<Row[]>([]);
	const [error, setError] = React.useState("");
	const [sort, setSort] = React.useState<SortKey>("views");
	const [page, setPage] = React.useState(0);
	const requestKey = JSON.stringify([from, to, source]);
	const [loadedKey, setLoadedKey] = React.useState("");
	const loading = loadedKey !== requestKey;

	React.useEffect(() => {
		let cancelled = false;
		getCampaignStatsRanking({ from, to, source: source || undefined })
			.then((res) => {
				if (cancelled) return;
				if (res.success) {
					setRows(res.data.rows);
					setError("");
					setPage(0);
				} else setError(res.error);
			})
			.catch(() => !cancelled && setError("Gagal memuat statistik"))
			.finally(() => !cancelled && setLoadedKey(requestKey));
		return () => {
			cancelled = true;
		};
	}, [from, to, source, requestKey]);

	const sorted = React.useMemo(
		() => [...rows].sort((a, b) => (sort === "conv" ? conv(b) - conv(a) : b[sort] - a[sort])),
		[rows, sort],
	);
	const total = rows.reduce(
		(a, r) => ({ views: a.views + r.views, paid: a.paid + r.paid, amount: a.amount + r.paidAmount }),
		{ views: 0, paid: 0, amount: 0 },
	);

	const head = (key: SortKey, label: string) => (
		<TableCell align="right">
			<TableSortLabel active={sort === key} direction="desc" onClick={() => setSort(key)}>
				{label}
			</TableSortLabel>
		</TableCell>
	);

	return (
		<Stack spacing={2}>
			<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
				<TextField
					size="small"
					type="date"
					label="Dari"
					value={from}
					onChange={(e) => setFrom(e.target.value)}
					InputLabelProps={{ shrink: true }}
				/>
				<TextField
					size="small"
					type="date"
					label="Sampai"
					value={to}
					onChange={(e) => setTo(e.target.value)}
					InputLabelProps={{ shrink: true }}
				/>
				<TextField
					select
					size="small"
					label="Sumber"
					value={source}
					onChange={(e) => setSource(e.target.value)}
					sx={{ minWidth: 160 }}
				>
					<MenuItem value="">Semua sumber</MenuItem>
					{Object.entries(SOURCE_LABELS).map(([k, v]) => (
						<MenuItem key={k} value={k}>
							{v}
						</MenuItem>
					))}
				</TextField>
				{loading && <CircularProgress size={20} />}
			</Stack>
			{error && <Alert severity="error">{error}</Alert>}
			<Typography variant="body2" color="text.secondary">
				{rows.length} campaign · {total.views} kali dilihat · {total.paid} donasi dibayar ·{" "}
				{idr(total.amount)} · konversi {pct(total.paid, total.views)}
			</Typography>

			<Paper variant="outlined" sx={{ borderRadius: 3 }}>
				<TableContainer sx={{ overflowX: "auto" }}>
					<Table size="small">
						<TableHead>
							<TableRow>
								<TableCell>Campaign</TableCell>
								{head("views", "Dilihat")}
								{head("clicks", "Klik")}
								<TableCell align="right">Form</TableCell>
								{head("checkouts", "Checkout")}
								{head("paid", "Dibayar")}
								{head("conv", "Konversi")}
								{head("paidAmount", "Terkumpul")}
							</TableRow>
						</TableHead>
						<TableBody>
							{sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((r) => (
								<TableRow key={r.key} hover>
									<TableCell sx={{ maxWidth: 320 }}>
										<Link href={`/admin/campaign/${r.key}/statistik`} style={{ fontWeight: 700 }}>
											{r.campaign.title}
										</Link>
										{lowConversion(r) && (
											<Chip size="small" color="warning" label="Konversi rendah" sx={{ ml: 1 }} />
										)}
									</TableCell>
									<TableCell align="right">{r.views}</TableCell>
									<TableCell align="right">{r.clicks}</TableCell>
									<TableCell align="right">{r.created}</TableCell>
									<TableCell align="right">{r.checkouts}</TableCell>
									<TableCell align="right">{r.paid}</TableCell>
									<TableCell align="right">{pct(r.paid, r.views)}</TableCell>
									<TableCell align="right">{idr(r.paidAmount)}</TableCell>
								</TableRow>
							))}
							{!loading && rows.length === 0 && (
								<TableRow>
									<TableCell colSpan={8}>Belum ada data pada rentang ini.</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
				<TablePagination
					component="div"
					count={sorted.length}
					page={page}
					onPageChange={(_, p) => setPage(p)}
					rowsPerPage={PAGE_SIZE}
					rowsPerPageOptions={[PAGE_SIZE]}
				/>
			</Paper>
		</Stack>
	);
}
