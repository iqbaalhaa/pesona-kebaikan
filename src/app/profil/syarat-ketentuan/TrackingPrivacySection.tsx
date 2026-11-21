// Fixed privacy notice for the tracking features (funnel stats cookies, Meta
// Pixel / Conversions API). Lives in code next to the CMS terms because it
// describes what the app itself does; keep it in sync with
// src/lib/tracking-source.ts, src/lib/meta-capi.ts and donation-settlement.ts.
const POINTS: { title: string; body: string }[] = [
	{
		title: "Cookie statistik",
		body: "Kami menyimpan cookie berisi kode acak pengunjung (pk_vid, hingga 1 tahun) dan asal kunjungan (pk_src, mis. tautan iklan atau WhatsApp, 30 hari). Data ini dipakai untuk menghitung berapa orang yang melihat campaign, menekan tombol donasi, dan menyelesaikan pembayaran. Cookie ini tidak berisi nama, nomor HP, atau email.",
	},
	{
		title: "Meta Pixel & Conversions API",
		body: "Untuk mengukur iklan di Facebook/Instagram, situs ini dapat memuat Meta Pixel milik Pesona Kebaikan dan, di halaman campaign tertentu, Meta Pixel milik penggalang dana campaign tersebut. Saat donasi berhasil dibayar, kami dapat mengirim informasi konversi ke Meta: nominal donasi, campaign yang dituju, serta nomor HP dan email donatur dalam bentuk ter-hash (diacak satu arah, tidak dapat dibaca kembali), alamat IP, dan jenis perangkat/browser.",
	},
	{
		title: "Yang tidak kami kirim",
		body: "Nama donatur, isi doa/pesan, dan nomor HP atau email dalam bentuk asli tidak dikirim ke Meta maupun ke penggalang dana melalui fitur ini.",
	},
	{
		title: "Statistik untuk penggalang dana",
		body: "Penggalang dana hanya melihat angka gabungan (jumlah pengunjung, klik, donasi, dan sumbernya), bukan identitas pengunjung.",
	},
	{
		title: "Pilihan Anda",
		body: "Anda dapat menghapus atau memblokir cookie melalui pengaturan browser, serta mengatur preferensi iklan di Pengaturan Iklan akun Facebook/Instagram Anda. Donasi tetap dapat dilakukan tanpa cookie tersebut.",
	},
];

export default function TrackingPrivacySection() {
	return (
		<section id="privasi-iklan" className="mt-4 scroll-mt-20 rounded-xl border border-foreground/10 p-3">
			<h3 className="mb-1 text-base font-extrabold text-foreground">Cookie, Statistik &amp; Iklan</h3>
			<p className="mb-2 text-sm leading-relaxed text-foreground/70">
				Sesuai prinsip pelindungan data pribadi, berikut data yang kami kumpulkan untuk statistik campaign dan
				pengukuran iklan:
			</p>
			<ol className="list-decimal pl-4">
				{POINTS.map((p) => (
					<li key={p.title} className="mb-1.5 text-sm leading-relaxed text-foreground/70">
						<span className="font-bold text-foreground">{p.title}.</span> {p.body}
					</li>
				))}
			</ol>
		</section>
	);
}
