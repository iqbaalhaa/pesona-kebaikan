"use client";

import * as React from "react";
import { Alert, Box, Button, CircularProgress, FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";
import { getCampaignPixel, updateCampaignPixel } from "@/actions/campaign-pixel";
import PixelGuide from "./PixelGuide";

type Data = Extract<Awaited<ReturnType<typeof getCampaignPixel>>, { success: true }>["data"];

/** Owner's own Meta Pixel for one campaign. Admin additionally gets the on/off switch. */
export default function CampaignPixelCard({ campaignId }: { campaignId: string }) {
	const [data, setData] = React.useState<Data | null>(null);
	const [pixelId, setPixelId] = React.useState("");
	const [token, setToken] = React.useState("");
	const [disabled, setDisabled] = React.useState(false);
	const [saving, setSaving] = React.useState(false);
	const [msg, setMsg] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

	React.useEffect(() => {
		getCampaignPixel(campaignId).then((res) => {
			if (!res.success) return;
			setData(res.data);
			setPixelId(res.data.pixelId);
			setDisabled(res.data.disabled);
		});
	}, [campaignId]);

	if (!data) return null;
	if (!data.featureEnabled && !data.isAdmin) return null;

	const save = async () => {
		setSaving(true);
		setMsg(null);
		const t = token.trim();
		const res = await updateCampaignPixel(campaignId, {
			pixelId,
			capiToken: t || undefined,
			disabled: data.isAdmin ? disabled : undefined,
		});
		if (res.success) {
			setMsg({ type: "success", text: "Tersimpan" });
			setData({ ...data, pixelId, disabled, tokenMask: !pixelId ? "" : t ? `••••${t.slice(-4)}` : data.tokenMask });
			setToken("");
		} else setMsg({ type: "error", text: res.error || "Gagal menyimpan" });
		setSaving(false);
	};

	const removeToken = async () => {
		setSaving(true);
		const res = await updateCampaignPixel(campaignId, { pixelId, capiToken: "" });
		if (res.success) setData({ ...data, tokenMask: "" });
		setMsg(res.success ? { type: "success", text: "Token dihapus" } : { type: "error", text: res.error || "Gagal" });
		setSaving(false);
	};

	return (
		<Stack spacing={1.5}>
			<Typography variant="body2" color="text.secondary">
				Pasang Meta Pixel Anda sendiri untuk mengukur iklan campaign ini. Pixel hanya aktif di halaman campaign ini dan
				halaman donasinya. Data donatur dikirim ke Meta dalam bentuk ter-hash.
			</Typography>
			<PixelGuide />
			{!data.featureEnabled && <Alert severity="info">Fitur pixel pemilik campaign sedang dimatikan di pengaturan.</Alert>}
			{data.disabled && !data.isAdmin && <Alert severity="warning">Pixel campaign ini dinonaktifkan oleh admin.</Alert>}
			{msg && (
				<Alert severity={msg.type} onClose={() => setMsg(null)}>
					{msg.text}
				</Alert>
			)}
			<TextField
				size="small"
				label="Pixel ID"
				value={pixelId}
				onChange={(e) => setPixelId(e.target.value.replace(/\D/g, ""))}
				placeholder="mis. 123456789012345"
				helperText="Kosongkan lalu simpan untuk melepas pixel."
				fullWidth
			/>
			<TextField
				size="small"
				label="Access token Conversions API (opsional)"
				type="password"
				value={token}
				onChange={(e) => setToken(e.target.value)}
				placeholder={data.tokenMask ? `Tersimpan ${data.tokenMask} — isi untuk mengganti` : "Tempel token bila ingin Purchase dikirim dari server"}
				helperText="Events Manager → Pixel → Settings → Conversions API → Generate access token."
				autoComplete="off"
				disabled={!pixelId}
				fullWidth
			/>
			{data.isAdmin && (
				<FormControlLabel
					control={<Switch checked={disabled} onChange={(_, v) => setDisabled(v)} color="error" />}
					label="Nonaktifkan pixel pemilik (admin)"
				/>
			)}
			<Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
				{data.tokenMask && (
					<Button color="error" onClick={removeToken} disabled={saving}>
						Hapus token
					</Button>
				)}
				<Button variant="contained" onClick={save} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}>
					Simpan Pixel
				</Button>
			</Box>
		</Stack>
	);
}
