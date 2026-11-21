import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// Fixed "advertise on Facebook/Instagram" section of the fundraiser guide —
// describes the Statistik & Meta Pixel features, so it lives in code (no CMS
// content needed). Anchor: /galang-dana/panduan#iklan
const STEPS: { title: string; desc: string }[] = [
	{
		title: "Buka menu Statistik & Meta Pixel",
		desc: "Galang Dana → pilih campaign → Menu Kelola → Statistik & Meta Pixel. Di sini terlihat berapa orang yang melihat campaign, klik donasi, dan benar-benar membayar.",
	},
	{
		title: "Buat Meta Pixel (sekali saja)",
		desc: "Buka business.facebook.com → Events Manager → Connect data sources → Web → beri nama → Create Pixel. Lewati langkah pasang kode — Pesona yang memasangnya. Salin Pixel ID, tempel di kartu Meta Pixel, lalu Simpan.",
	},
	{
		title: "Opsional: aktifkan Conversions API",
		desc: "Events Manager → pixel Anda → Settings → Conversions API → Generate access token, tempel di kolom token. Donasi yang dibayar belakangan (VA/QRIS) atau dari HP yang memblokir pelacakan tetap tercatat di Meta.",
	},
	{
		title: "Buat link khusus untuk tiap iklan",
		desc: "Di bagian Buat Link Iklan pilih tempat beriklan (Facebook/Instagram), isi nama kampanye (mis. ramadhan) dan nama materi (mis. video1), lalu Salin. Pakai link ini sebagai tujuan iklan.",
	},
	{
		title: "Buat iklan di Ads Manager",
		desc: "Pilih tujuan Penjualan/Konversi, pilih pixel Anda, event konversi Purchase, dan tempel link dari langkah sebelumnya sebagai URL situs.",
	},
	{
		title: "Pantau & optimalkan",
		desc: "Cek tabel Per sumber dan Per iklan di halaman Statistik. Hentikan iklan yang banyak dilihat tapi sedikit donasi; tambah anggaran untuk iklan yang menghasilkan donasi.",
	},
];

const TIPS: { title: string; desc: string }[] = [
	{
		title: "Satu link per materi iklan",
		desc: "Beri nama materi berbeda (video1, foto2) supaya terlihat materi mana yang paling banyak menghasilkan donasi.",
	},
	{
		title: "Bagikan ke WhatsApp dengan link WhatsApp",
		desc: "Pilih WhatsApp di Buat Link Iklan saat membagikan ke grup/kontak, supaya donasi dari WhatsApp terhitung terpisah.",
	},
	{
		title: "Cek pixel sebelum iklan jalan",
		desc: "Events Manager → Test events → buka link campaign. Event PageView dan ViewContent harus muncul dalam beberapa detik.",
	},
	{
		title: "Jaga kerahasiaan token",
		desc: "Access token Conversions API jangan dibagikan. Data donatur dikirim ke Meta hanya dalam bentuk ter-enkripsi (hash).",
	},
];

export default function AdsGuideSection() {
	return (
		<Box id="iklan" sx={{ mt: 4, scrollMarginTop: 72 }}>
			<Typography sx={{ fontWeight: 800, fontSize: 18, mb: 0.5, color: "text.primary" }}>
				Promosikan Lewat Iklan Facebook & Instagram
			</Typography>
			<Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2, lineHeight: 1.7 }}>
				Setiap campaign punya statistik pengunjung dan bisa dipasangi Meta Pixel milik Anda sendiri, jadi Anda tahu
				iklan mana yang benar-benar mendatangkan donasi.
			</Typography>
			{STEPS.map((s, i) => (
				<Box key={s.title} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mb: 2 }}>
					<Box
						sx={{
							width: 28,
							height: 28,
							borderRadius: "50%",
							bgcolor: "#0ba976",
							color: "#fff",
							display: "grid",
							placeItems: "center",
							fontSize: 13,
							fontWeight: 800,
							flexShrink: 0,
							mt: 0.2,
						}}
					>
						{i + 1}
					</Box>
					<Box>
						<Typography sx={{ fontWeight: 700, fontSize: 14, color: "text.primary" }}>{s.title}</Typography>
						<Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.3, lineHeight: 1.7 }}>{s.desc}</Typography>
					</Box>
				</Box>
			))}

			<Typography sx={{ fontWeight: 800, fontSize: 16, mt: 3, mb: 2, color: "text.primary" }}>
				Tips Beriklan
			</Typography>
			{TIPS.map((t) => (
				<Box key={t.title} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", mb: 2 }}>
					<CheckCircleIcon sx={{ fontSize: 20, color: "#0ba976", mt: 0.2, flexShrink: 0 }} />
					<Box>
						<Typography sx={{ fontWeight: 700, fontSize: 14, color: "text.primary" }}>{t.title}</Typography>
						<Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.3 }}>{t.desc}</Typography>
					</Box>
				</Box>
			))}
		</Box>
	);
}
