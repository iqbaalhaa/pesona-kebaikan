import { prisma } from "../../src/lib/prisma";
import * as fs from "fs";
import * as path from "path";

export async function seedAddress() {
	console.log("Seeding Address...");

	const readCsv = (filename: string) => {
		const filePath = path.join(process.cwd(), "prisma", filename);
		if (!fs.existsSync(filePath)) {
			console.warn(`File not found: ${filename}`);
			return [];
		}
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const lines = fileContent.split("\n").filter((l) => l.trim() !== "");
		// Skip header
		return lines.slice(1).map((line) => {
			const parts = line.split(",");
			const clean = (s: string) => (s ? s.trim().replace(/^"|"$/g, "") : "");
			return parts.map(clean);
		});
	};

	try {
		const provinces = readCsv("_Province__202512271348.csv");
		if (provinces.length > 0) {
			await prisma.province.createMany({
				data: provinces.map((p) => ({
					id: p[0],
					code: p[1],
					name: p[2],
				})),
				skipDuplicates: true,
			});
			console.log(`Seeded ${provinces.length} provinces`);
		}

		const regencies = readCsv("_Regency__202512271348.csv");
		if (regencies.length > 0) {
			await prisma.regency.createMany({
				data: regencies.map((p) => ({
					id: p[0],
					code: p[1],
					name: p[2],
					provinceId: p[3],
				})),
				skipDuplicates: true,
			});
			console.log(`Seeded ${regencies.length} regencies`);
		}

		const districts = readCsv("_District__202512271348.csv");
		if (districts.length > 0) {
			for (let i = 0; i < districts.length; i += 1000) {
				const chunk = districts.slice(i, i + 1000);
				await prisma.district.createMany({
					data: chunk.map((p) => ({
						id: p[0],
						code: p[1],
						name: p[2],
						regencyId: p[3],
					})),
					skipDuplicates: true,
				});
			}
			console.log(`Seeded ${districts.length} districts`);
		}

		const villages = readCsv("_Village__202512271348.csv");
		if (villages.length > 0) {
			// Get all existing district IDs first to ensure FK validity
			const existingDistricts = await prisma.district.findMany({
				select: { id: true }
			});
			const districtIdSet = new Set(existingDistricts.map(d => d.id));

			const validVillages = villages.filter(p => districtIdSet.has(p[3]));
			if (validVillages.length < villages.length) {
				console.warn(`Skipping ${villages.length - validVillages.length} villages due to missing district FK`);
			}

			for (let i = 0; i < validVillages.length; i += 1000) {
				const chunk = validVillages.slice(i, i + 1000);
				await prisma.village.createMany({
					data: chunk.map((p) => ({
						id: p[0],
						code: p[1],
						name: p[2],
						districtId: p[3],
					})),
					skipDuplicates: true,
				});
			}
			console.log(`Seeded ${validVillages.length} villages`);
		}
	} catch (error) {
		console.error("Error seeding address:", error);
	}
}
