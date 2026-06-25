import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedCategories } from "./seeds/category.seed";

async function main() {
	console.log("Resetting & seeding campaign categories only...");
	await seedCategories({ reset: true });
	const count = await prisma.campaignCategory.count();
	console.log(`Done. ${count} categories in DB.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
