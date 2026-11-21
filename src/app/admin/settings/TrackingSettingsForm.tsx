"use client";

import { useState } from "react";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Divider,
	FormControlLabel,
	Stack,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import { saveTrackingSettings, sendMetaTestEvent } from "@/actions/tracking-settings";

type Initial = {
	pixelEnabled: boolean;
	pixelId: string;
	capiEnabled: boolean;
	capiTokenMask: string;
	testEventCode: string;
	ownerPixelEnabled: boolean;
	statsEnabled: boolean;
	viewDedupMinutes: number;
	ownerSourcesEnabled: boolean;
};

type BoolKey = {
	[K in keyof Initial]: Initial[K] extends boolean ? K : never;
}[keyof Initial];

export default function TrackingSettingsForm({ initial }: { initial: Initial }) {
	const [s, setS] = useState(initial);
	// Blank = keep the stored token; the real token is never sent to the browser.
	const [token, setToken] = useState("");
	const [removeToken, setRemoveToken] = useState(false);
	const [loading, setLoading] = useState(false);
	const [testing, setTesting] = useState(false);
	const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

	const toggle = (k: BoolKey) => (_: unknown, v: boolean) => setS((p) => ({ ...p, [k]: v }));

	const save = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMsg(null);
		const newToken = token.trim();
		const res = await saveTrackingSettings({
			pixelEnabled: s.pixelEnabled,
			pixelId: s.pixelId,
			capiEnabled: s.capiEnabled,
			capiToken: removeToken ? "" : newToken || undefined,
			testEventCode: s.testEventCode,
			ownerPixelEnabled: s.ownerPixelEnabled,
			statsEnabled: s.statsEnabled,
			viewDedupMinutes: Number(s.viewDedupMinutes),
			ownerSourcesEnabled: s.ownerSourcesEnabled,
		});
		if (res.success) {
			setMsg({ type: "success", text: "Pengaturan tersimpan (berlaku dalam ±1 menit)" });
			if (removeToken) setS((p) => ({ ...p, capiTokenMask: "" }));
			else if (newToken) setS((p) => ({ ...p, capiTokenMask: `••••${newToken.slice(-4)}` }));
			setToken("");
			setRemoveToken(false);
		} else {
			setMsg({ type: "error", text: res.error || "Gagal menyimpan" });
		}
		setLoading(false);
	};

	const test = async () => {
		setTesting(true);
		setMsg(null);
		const res = await sendMetaTestEvent();
		setMsg(
			res.success
				? { type: "success", text: "Event uji terkirim. Cek Events Manager → Test events." }
				: { type: "error", text: res.error || "Gagal mengirim event uji" },
		);
		setTesting(false);
	};

	return (
		<form onSubmit={save}>
			<Stack spacing={2.5}>
				{msg && (
					<Alert severity={msg.type} onClose={() => setMsg(null)}>
						{msg.text}
					</Alert>
				)}

				<Typography variant="subtitle2" fontWeight={700}>
					Meta Pixel Pesona
				</Typography>
				<FormControlLabel
					control={<Switch checked={s.pixelEnabled} onChange={toggle("pixelEnabled")} />}
					label="Aktifkan Pixel di situs (PageView, ViewContent, InitiateCheckout, Purchase)"
				/>
				<TextField
					label="Pixel ID"
					value={s.pixelId}
					onChange={(e) => setS((p) => ({ ...p, pixelId: e.target.value.replace(/\D/g, "") }))}
					placeholder="mis. 123456789012345"
					helperText="Events Manager → Data sources → pilih Pixel → angka ID"
					disabled={loading}
					fullWidth
				/>

				<Divider />
				<Typography variant="subtitle2" fontWeight={700}>
					Conversions API (server)
				</Typography>
				<FormControlLabel
					control={<Switch checked={s.capiEnabled} onChange={toggle("capiEnabled")} />}
					label="Kirim Purchase dari server saat pembayaran lunas (lebih akurat, tidak terblokir adblock)"
				/>
				<TextField
					label="Access token"
					type="password"
					value={token}
					onChange={(e) => {
						setToken(e.target.value);
						setRemoveToken(false);
					}}
					placeholder={
						s.capiTokenMask ? `Tersimpan ${s.capiTokenMask} — isi untuk mengganti` : "Tempel access token"
					}
					helperText="Events Manager → Pixel → Settings → Conversions API → Generate access token. Disimpan di server dan tidak ditampilkan lagi."
					disabled={loading}
					fullWidth
					autoComplete="off"
				/>
				{s.capiTokenMask && (
					<FormControlLabel
						control={
							<Switch checked={removeToken} onChange={(_, v) => setRemoveToken(v)} color="error" />
						}
						label="Hapus token tersimpan"
					/>
				)}
				<TextField
					label="Test Event Code (opsional)"
					value={s.testEventCode}
					onChange={(e) => setS((p) => ({ ...p, testEventCode: e.target.value }))}
					placeholder="mis. TEST12345"
					helperText="Hanya untuk uji di Events Manager → Test events. Kosongkan setelah live agar event dihitung sebagai konversi."
					disabled={loading}
					fullWidth
				/>
				<Box>
					<Button
						variant="outlined"
						onClick={test}
						disabled={testing || loading}
						startIcon={testing ? <CircularProgress size={18} /> : <SendIcon />}
					>
						Kirim event uji
					</Button>
				</Box>

				<Divider />
				<Typography variant="subtitle2" fontWeight={700}>
					Pixel pemilik campaign
				</Typography>
				<FormControlLabel
					control={<Switch checked={s.ownerPixelEnabled} onChange={toggle("ownerPixelEnabled")} />}
					label="Izinkan pemilik campaign memasang Pixel sendiri (hanya di halaman campaign-nya)"
				/>

				<Divider />
				<Typography variant="subtitle2" fontWeight={700}>
					Statistik campaign
				</Typography>
				<FormControlLabel
					control={<Switch checked={s.statsEnabled} onChange={toggle("statsEnabled")} />}
					label="Catat kunjungan, klik donasi dan checkout"
				/>
				<TextField
					label="Jeda hitung ulang pengunjung yang sama (menit)"
					type="number"
					value={s.viewDedupMinutes}
					onChange={(e) => setS((p) => ({ ...p, viewDedupMinutes: Number(e.target.value) }))}
					inputProps={{ min: 0, max: 1440 }}
					helperText="Refresh oleh orang yang sama dalam jeda ini tidak dihitung lagi. 0 = hitung semua."
					disabled={loading}
					sx={{ maxWidth: 380 }}
				/>
				<FormControlLabel
					control={<Switch checked={s.ownerSourcesEnabled} onChange={toggle("ownerSourcesEnabled")} />}
					label="Pemilik campaign boleh melihat rincian sumber/iklan"
				/>

				<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
					<Button
						type="submit"
						variant="contained"
						startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
						disabled={loading}
					>
						{loading ? "Menyimpan..." : "Simpan Pengaturan"}
					</Button>
				</Box>
			</Stack>
		</form>
	);
}
