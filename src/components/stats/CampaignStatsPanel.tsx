"use client";

import * as React from "react";
import {
	Alert,
	Box,
	CircularProgress,
	MenuItem,
	Paper,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { getCampaignStats } from "@/actions/campaign-stats";
import { idr } from "@/lib/currency";
import { sourceLabel } from "@/lib/tracking-source";
import DailyFunnelChart from "./DailyFunnelChart";
import StatsBreakdownTable, { pct } from "./StatsBreakdownTable";

type Stats = Extract<Awaited<ReturnType<typeof getCampaignStats>>, { success: true }>["data"];

const wibDate = (offsetDays: number) =>
	new Date(Date.now() + 7 * 3600_000 - offsetDays * 86400_000).toISOString().slice(0, 10);

function Step({ label, value, sub, hint }: { label: string; value: string | number; sub?: string; hint?: string }) {
	return (
		<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3, flex: "1 1 140px", minWidth: 0 }}>
			<Typography variant="caption" color="text.secondary" display="block">
				{label}
			</Typography>
			<Typography variant="h6" fontWeight={800} lineHeight={1.3}>
				{value}
			</Typography>
			{sub && (
				<Typography variant="caption" color="text.secondary" display="block">
					{sub}
				</Typography>
			)}
			{hint && (
				<Typography variant="caption" sx={{ color: "#0ba976", fontWeight: 700 }}>
					{hint}
				</Typography>
			)}
		</Paper>
	);
}

/** Funnel stats for one campaign; used on the owner's page and in admin. */
export default function CampaignStatsPanel({ campaignId }: { campaignId: string }) {
	const [preset, setPreset] = React.useState<string>("30");
	const [from, setFrom] = React.useState(wibDate(29));
	const [to, setTo] = React.useState(wibDate(0));
	const [fundraiserId, setFundraiserId] = React.useState("");
	const [data, setData] = React.useState<Stats | null>(null);
	const [error, setError] = React.useState("");
	// Loading = the shown data belongs to a different request than the current one.
	const requestKey = JSON.stringify([campaignId, from, to, fundraiserId]);
	const [loadedKey, setLoadedKey] = React.useState("");
	const loading = loadedKey !== requestKey;

	React.useEffect(() => {
		let cancelled = false;
		getCampaignStats(campaignId, { from, to, fundraiserId: fundraiserId || null })
			.then((res) => {
				if (cancelled) return;
				if (res.success) {
					setData(res.data);
					setError("");
				} else setError(res.error);
			})
			.catch(() => !cancelled && setError("Gagal memuat statistik"))
			.finally(() => !cancelled && setLoadedKey(requestKey));
		return () => {
			cancelled = true;
		};
	}, [campaignId, from, to, fundraiserId, requestKey]);

	const pickPreset = (_: unknown, v: string | null) => {
		if (!v) return;
		setPreset(v);
		if (v !== "custom") {
			setFrom(wibDate(Number(v) - 1));
			setTo(wibDate(0));
		}
	};

	const t = data?.totals;
	return (
		<Stack spacing={2}>
			<Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} flexWrap="wrap">
				<ToggleButtonGroup size="small" exclusive value={preset} onChange={pickPreset}>
					<ToggleButton value="7">7 hari</ToggleButton>
					<ToggleButton value="30">30 hari</ToggleButton>
					<ToggleButton value="90">90 hari</ToggleButton>
					<ToggleButton value="custom">Pilih tanggal</ToggleButton>
				</ToggleButtonGroup>
				{preset === "custom" && (
					<Stack direction="row" spacing={1}>
						<TextField size="small" type="date" label="Dari" value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
						<TextField size="small" type="date" label="Sampai" value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
					</Stack>
				)}
				{data && data.fundraisers.length > 0 && (
					<TextField select size="small" label="Fundraiser" value={fundraiserId} onChange={(e) => setFundraiserId(e.target.value)} sx={{ minWidth: 180 }}>
						<MenuItem value="">Semua</MenuItem>
						{data.fundraisers.map((f) => (
							<MenuItem key={f.id} value={f.id}>
								{f.title}
							</MenuItem>
						))}
					</TextField>
				)}
				{loading && <CircularProgress size={20} />}
			</Stack>

			{error && <Alert severity="error">{error}</Alert>}
			{data && !data.trackingEnabled && (
				<Alert severity="info">Pencatatan kunjungan sedang dimatikan admin; angka kunjungan/klik tidak bertambah.</Alert>
			)}

			{t && (
				<>
					<Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
						<Step label="Pengunjung unik" value={t.visitors} sub={`${t.views} kali dilihat`} />
						<Step label="Klik donasi" value={t.donateClicks} hint={pct(t.donateClicks, t.visitors)} />
						<Step label="Isi form donasi" value={t.donationsCreated} hint={pct(t.donationsCreated, t.donateClicks)} />
						<Step label="Lanjut bayar" value={t.checkouts} hint={pct(t.checkouts, t.donationsCreated)} />
						<Step label="Dibayar" value={t.donationsPaid} sub={idr(t.paidAmount)} hint={pct(t.donationsPaid, t.checkouts)} />
					</Stack>
					<Typography variant="caption" color="text.secondary">
						Konversi total (dibayar ÷ pengunjung unik): <b>{pct(t.donationsPaid, t.visitors)}</b>. Persen hijau = dibanding
						tahap sebelumnya. Kunjungan mulai tercatat sejak fitur statistik aktif.
					</Typography>

					<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
						<Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
							Harian ({data.from} s/d {data.to})
						</Typography>
						<DailyFunnelChart daily={data.daily} />
					</Paper>

					{data.sources && (
						<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
							<Typography variant="subtitle2" fontWeight={700}>
								Per sumber
							</Typography>
							<StatsBreakdownTable rows={data.sources} label="Sumber" renderKey={(r) => sourceLabel(r.key === "unknown" ? null : r.key)} />
						</Paper>
					)}
					{data.ads && (
						<Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
							<Typography variant="subtitle2" fontWeight={700}>
								Per iklan (utm_campaign / utm_content)
							</Typography>
							<Typography variant="caption" color="text.secondary" display="block">
								Pasang di URL iklan, mis. <code>?utm_source=facebook&utm_campaign=ramadhan&utm_content=video1</code>
							</Typography>
							<StatsBreakdownTable
								rows={data.ads}
								label="Iklan"
								renderKey={(r) => (
									<Box>
										<b>{r.key}</b>
										{r.utmContent && (
											<Typography variant="caption" display="block" color="text.secondary">
												{r.utmContent}
											</Typography>
										)}
									</Box>
								)}
							/>
						</Paper>
					)}
				</>
			)}
		</Stack>
	);
}
