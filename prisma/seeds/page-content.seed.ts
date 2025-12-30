import { prisma } from "../../src/lib/prisma";

async function upsertPageContent(params: {
	key: string;
	title: string;
	content: string;
	data?: any;
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
}
