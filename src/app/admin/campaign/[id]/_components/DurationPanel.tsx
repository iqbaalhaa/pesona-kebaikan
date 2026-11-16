"use client";

import * as React from "react";
import { Box, Button, Paper, Stack, TextField, Typography, InputAdornment, Chip } from "@mui/material";
import {
	extendCampaignDuration,
	getCampaignChangeRequests,
	resolveCampaignChangeRequest,
} from "@/actions/campaign-admin";
import { idr, fieldSx } from "./shared";

type ChangeRequest = {
	id: string;
	extraDays: number | null;
	extraTarget: number | null;
	note: string | null;
	createdAt: Date;
	user: { name: string | null } | null;
};

// Admin campaign detail: approve/reject the owner's pending extension requests
// and extend the duration directly — no more Akhiri → Mulai to add days.
export default function DurationPanel(props: {
	campaignId: string;
	isUnlimited: boolean;
	daysLeft: number;
	theme: any;
	shellSx: any;
	onChanged: () => void;
	notify: (msg: string, type: "success" | "error") => void;
}) {
	const { campaignId, isUnlimited, daysLeft, theme, shellSx, onChanged, notify } = props;
	const [requests, setRequests] = React.useState<ChangeRequest[]>([]);
	const [days, setDays] = React.useState("30");
	const [busy, setBusy] = React.useState<string | null>(null);

	const loadRequests = React.useCallback(
		() =>
			getCampaignChangeRequests(1, 20, "PENDING", campaignId).then((res) =>
				setRequests(res.requests as ChangeRequest[]),
			),
		[campaignId],
	);

	React.useEffect(() => {
		getCampaignChangeRequests(1, 20, "PENDING", campaignId).then((res) =>
			setRequests(res.requests as ChangeRequest[]),
		);
	}, [campaignId]);

	const run = async (key: string, fn: () => Promise<{ success: boolean; error?: string }>, okMsg: string) => {
		setBusy(key);
		try {
			const res = await fn();
			if (!res.success) return notify(res.error || "Gagal memproses", "error");
			notify(okMsg, "success");
			await loadRequests();
			onChanged();
		} finally {
			setBusy(null);
		}
	};

	if (isUnlimited && requests.length === 0) return null;

	return (
		<Paper elevation={0} sx={{ ...shellSx, p: 2 }}>
			<Stack spacing={2}>
				<Box>
					<Typography sx={{ fontWeight: 1000, fontSize: 15 }}>Durasi & Pengajuan Perubahan</Typography>
					<Typography sx={{ fontSize: 13, color: "text.secondary" }}>
						{isUnlimited
							? "Campaign tanpa batas waktu."
							: daysLeft > 0
								? `Sisa ${daysLeft} hari. Perpanjangan dihitung dari tanggal berakhir.`
								: "Sudah berakhir. Perpanjangan dihitung dari hari ini dan campaign aktif lagi."}
					</Typography>
				</Box>

				{requests.map((r) => (
					<Box
						key={r.id}
						sx={{ p: 1.5, borderRadius: 2, border: "1px solid", borderColor: theme.palette.warning.main }}
					>
						<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
							<Chip size="small" color="warning" label="Menunggu" />
							<Typography sx={{ fontSize: 12, color: "text.secondary" }}>
								{r.user?.name || "Fundraiser"} · {new Date(r.createdAt).toLocaleDateString("id-ID")}
							</Typography>
						</Stack>
						<Typography sx={{ fontWeight: 800, fontSize: 14 }}>
							{[
								r.extraDays ? `+${r.extraDays} hari` : null,
								r.extraTarget ? `+${idr(r.extraTarget)} target` : null,
							]
								.filter(Boolean)
								.join(" · ") || "Perubahan campaign"}
						</Typography>
						{r.note && <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>{r.note}</Typography>}
						<Stack direction="row" spacing={1} sx={{ mt: 1 }}>
							<Button
								size="small"
								variant="contained"
								disabled={!!busy}
								onClick={() =>
									run(r.id, () => resolveCampaignChangeRequest(r.id, "APPROVE"), "Pengajuan disetujui")
								}
								sx={{ borderRadius: 999, fontWeight: 900, boxShadow: "none" }}
							>
								Setujui
							</Button>
							<Button
								size="small"
								color="error"
								variant="outlined"
								disabled={!!busy}
								onClick={() =>
									run(r.id, () => resolveCampaignChangeRequest(r.id, "REJECT"), "Pengajuan ditolak")
								}
								sx={{ borderRadius: 999, fontWeight: 900 }}
							>
								Tolak
							</Button>
						</Stack>
					</Box>
				))}

				{!isUnlimited && (
					<Stack direction="row" spacing={2} alignItems="center">
						<TextField
							label="Perpanjang masa aktif"
							type="number"
							value={days}
							onChange={(e) => setDays(e.target.value)}
							inputProps={{ min: 1, max: 365 }}
							InputProps={{ endAdornment: <InputAdornment position="end">hari</InputAdornment> }}
							sx={{ flex: 1, ...fieldSx(theme) }}
						/>
						<Button
							variant="contained"
							disabled={!!busy || !(Number(days) >= 1)}
							onClick={() =>
								run(
									"extend",
									() => extendCampaignDuration(campaignId, Number(days)),
									`Masa aktif diperpanjang ${days} hari`,
								)
							}
							sx={{ height: 40, borderRadius: 999, fontWeight: 900, boxShadow: "none", whiteSpace: "nowrap" }}
						>
							{busy === "extend" ? "..." : "Perpanjang"}
						</Button>
					</Stack>
				)}
			</Stack>
		</Paper>
	);
}
