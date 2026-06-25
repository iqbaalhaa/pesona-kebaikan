import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { seedAddress } from "./seeds/address.seed";

async function main() {
	try {
		console.log("Starting address (region) seed...");
		await seedAddress();
		console.log("Address seeding completed.");
	} catch (e) {
		console.error(e);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

main();
