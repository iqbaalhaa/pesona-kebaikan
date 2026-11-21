"use client";

import { Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

const STEPS = [
	<>
		Buka <b>business.facebook.com</b> → <b>Events Manager</b> (pakai akun yang dipakai untuk beriklan).
	</>,
	<>
		Klik <b>Connect data sources</b> (Hubungkan sumber data) → pilih <b>Web</b> → beri nama, mis. &quot;Campaign
		Pesona&quot; → <b>Create Pixel</b>. Lewati langkah pemasangan kode/website — Pesona yang memasangnya.
	</>,
	<>
		Salin <b>Pixel ID</b> (deretan angka di bawah nama pixel), tempel di kolom Pixel ID di bawah, lalu klik <b>Simpan
		Pixel</b>.
	</>,
	<>
		Opsional, agar donasi yang dibayar belakangan (VA/QRIS) tetap tercatat: Events Manager → pixel Anda →{" "}
		<b>Settings</b> → <b>Conversions API</b> → <b>Generate access token</b>, tempel di kolom token.
	</>,
	<>
		Cek: Events Manager → <b>Test events</b> → masukkan link campaign ini → buka. Event <b>PageView</b> dan{" "}
		<b>ViewContent</b> akan muncul dalam beberapa detik.
	</>,
	<>
		Saat membuat iklan, pilih pixel ini dan tujuan konversi <b>Purchase</b>, lalu pakai link dari &quot;Buat Link
		Iklan&quot; supaya statistik per iklan terisi.
	</>,
];

/** Step-by-step "how to create a Meta Pixel" for campaign owners. */
export default function PixelGuide() {
	return (
		<Accordion disableGutters variant="outlined" sx={{ borderRadius: 2, "&:before": { display: "none" } }}>
			<AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
				<Typography variant="body2" fontWeight={700}>
					Belum punya Pixel? Cara membuatnya (± 5 menit)
				</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<Typography component="ol" variant="body2" sx={{ pl: 2.5, m: 0, "& li": { mb: 1 } }}>
					{STEPS.map((s, i) => (
						<li key={i}>{s}</li>
					))}
				</Typography>
			</AccordionDetails>
		</Accordion>
	);
}
