import { prisma } from "../../src/lib/prisma";

async function upsertPageContent(params: {
	key: string;
	title: string;
	content: string;
	data?: unknown;
}) {
	return prisma.pageContent.upsert({
		where: { key: params.key },
		update: {
			title: params.title,
			content: params.content,
			data: params.data ?? undefined,
		},
		create: {
			key: params.key,
			title: params.title,
			content: params.content,
			data: params.data ?? undefined,
		},
	});
}

export async function seedPageContent() {
	/* ===== PAGE CONTENT ===== */
	await upsertPageContent({
		key: "about",
		title: "Tentang Pesona Kebaikan",
		content: `<p>Platform donasi transparan & terpercaya.</p>`,
	});

	await upsertPageContent({
		key: "terms",
		title: "Syarat & Ketentuan",
		content: `<p>Dengan menggunakan layanan ini, Anda setuju dengan aturan kami.</p>`,
	});

	// Fundraising Guide
	await upsertPageContent({
		key: "fundraise_guide",
		title: "Panduan Galang Dana",
		content: `
      <h2>Mulai Dengan Cerita Yang Kuat</h2>
      <p>Ceritakan siapa yang dibantu, kenapa butuh bantuan, dan bagaimana dampaknya. Gunakan bahasa yang jujur dan menyentuh.</p>
      <h2>Tambahkan Bukti Yang Relevan</h2>
      <p>Sertakan foto, dokumen pendukung, dan update berkala untuk menjaga kepercayaan donatur.</p>
      <h2>Bagikan Ke Komunitas</h2>
      <p>Bagikan campaign ke WhatsApp, media sosial, dan komunitas untuk menjangkau lebih banyak orang baik.</p>
    `,
		data: {
			tips: [
				{ title: "Judul spesifik", desc: "Buat judul yang jelas dan fokus." },
				{ title: "Visual kuat", desc: "Gunakan foto/video yang relevan." },
				{ title: "Update berkala", desc: "Cerita perkembangan membuat donatur terlibat." },
				{ title: "Transparansi", desc: "Jelaskan Useran dana dan bukti penyaluran." },
			],
			steps: [
				"Tentukan tujuan dan target",
				"Siapkan cerita dan bukti",
				"Pilih kategori yang sesuai",
				"Bagikan campaign secara konsisten",
				"Berikan update dan ucapan terima kasih",
			],
		},
	});
}
