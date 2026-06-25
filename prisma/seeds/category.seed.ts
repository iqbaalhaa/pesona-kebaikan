import { prisma } from "../../src/lib/prisma";

type SeedCategory = {
	slug: string;
	name: string;
	icon: string; // key in src/lib/categoryIcons.tsx
	examples?: string[];
	options?: { title: string; desc?: string }[];
};

/**
 * Canonical campaign categories. `icon` must match a key in
 * src/lib/categoryIcons.tsx. `medis` is the hardcoded medical category
 * (see src/lib/categoryUtils.ts MEDICAL_SLUG / MEDICAL_TITLE).
 */
const CATEGORIES: SeedCategory[] = [
	{
		slug: "medis",
		name: "Bantuan Medis & Kesehatan",
		icon: "medis",
		examples: ["Biaya operasi", "Rawat inap", "Pengobatan rutin"],
	},
	{
		slug: "bencana",
		name: "Bencana Alam",
		icon: "bencana",
		examples: ["Banjir", "Gempa bumi", "Kebakaran"],
	},
	{
		slug: "pendidikan",
		name: "Pendidikan",
		icon: "pendidikan",
		examples: ["Beasiswa", "Biaya sekolah", "Perlengkapan belajar"],
	},
	{
		slug: "kemanusiaan",
		name: "Kemanusiaan",
		icon: "kemanusiaan",
		examples: ["Bantuan pangan", "Pengungsi", "Krisis kemanusiaan"],
	},
	{
		slug: "sosial",
		name: "Bantuan Sosial",
		icon: "sosial",
		examples: ["Yatim & dhuafa", "Lansia", "Santunan"],
	},
	{
		slug: "difabel",
		name: "Difabel",
		icon: "difabel",
		examples: ["Alat bantu", "Kursi roda", "Terapi"],
	},
	{
		slug: "lingkungan",
		name: "Lingkungan & Hewan",
		icon: "lingkungan",
		examples: ["Penghijauan", "Penyelamatan hewan", "Kebersihan"],
	},
	{
		slug: "infrastruktur",
		name: "Infrastruktur & Fasilitas Umum",
		icon: "infrastruktur",
		examples: ["Jembatan", "Sarana air bersih", "Fasilitas umum"],
	},
	{
		slug: "wakaf",
		name: "Wakaf & Rumah Ibadah",
		icon: "wakaf",
		examples: ["Pembangunan masjid", "Wakaf Al-Qur'an", "Renovasi rumah ibadah"],
	},
	{
		slug: "zakat",
		name: "Zakat, Infak & Sedekah",
		icon: "zakat",
		examples: ["Zakat maal", "Infak", "Sedekah jariyah"],
	},
	{
		slug: "usaha",
		name: "Modal Usaha & Ekonomi",
		icon: "usaha",
		examples: ["Modal UMKM", "Pemberdayaan ekonomi", "Bantuan pedagang"],
	},
	{
		slug: "lainnya",
		name: "Lainnya",
		icon: "lainnya",
		examples: ["Kebutuhan lain yang mendesak"],
	},
];

/**
 * Reset & seed campaign categories only.
 *
 * - Upserts the canonical list (by slug) and rebuilds their options/examples.
 * - When `reset` is true, also removes stray categories that are NOT in the
 *   canonical list AND have no campaigns attached (FK-safe — never deletes a
 *   category still referenced by a campaign).
 */
export async function seedCategories({ reset = true }: { reset?: boolean } = {}) {
	for (let i = 0; i < CATEGORIES.length; i++) {
		const c = CATEGORIES[i];
		const cat = await prisma.campaignCategory.upsert({
			where: { slug: c.slug },
			update: { name: c.name, icon: c.icon, order: i, isActive: true },
			create: { name: c.name, slug: c.slug, icon: c.icon, order: i, isActive: true },
		});

		// Rebuild options & examples for this category.
		await prisma.campaignCategoryOption.deleteMany({ where: { categoryId: cat.id } });
		await prisma.campaignCategoryExample.deleteMany({ where: { categoryId: cat.id } });

		if (c.examples?.length) {
			await prisma.campaignCategoryExample.createMany({
				data: c.examples.map((title, idx) => ({
					categoryId: cat.id,
					title,
					order: idx,
				})),
			});
		}

		if (c.options?.length) {
			await prisma.campaignCategoryOption.createMany({
				data: c.options.map((o, idx) => ({
					categoryId: cat.id,
					title: o.title,
					desc: o.desc,
					order: idx,
				})),
			});
		}
	}

	if (reset) {
		const slugs = CATEGORIES.map((c) => c.slug);
		const stray = await prisma.campaignCategory.findMany({
			where: { slug: { notIn: slugs } },
			select: { id: true, name: true, _count: { select: { campaigns: true } } },
		});
		const removable = stray.filter((s) => s._count.campaigns === 0);
		const removableIds = removable.map((s) => s.id);

		if (removableIds.length) {
			await prisma.campaignCategoryOption.deleteMany({
				where: { categoryId: { in: removableIds } },
			});
			await prisma.campaignCategoryExample.deleteMany({
				where: { categoryId: { in: removableIds } },
			});
			await prisma.campaignCategory.deleteMany({ where: { id: { in: removableIds } } });
		}

		const kept = stray.filter((s) => s._count.campaigns > 0);
		if (kept.length) {
			console.warn(
				`Kept ${kept.length} non-canonical categor${kept.length === 1 ? "y" : "ies"} still used by campaigns:`,
				kept.map((k) => k.name).join(", "),
			);
		}
	}
}
