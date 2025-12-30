import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma";
import { faker } from "@faker-js/faker";

export async function seedUsers() {
	const password = await bcrypt.hash("password123", 10);

	/* ===== USERS ===== */
	const admin = await prisma.user.upsert({
		where: { email: "admin@pesonakebaikan.id" },
		update: { role: Role.ADMIN },
		create: {
			email: "admin@pesonakebaikan.id",
			name: "Super Admin",
			role: Role.ADMIN,
			password,
		},
	});

	await prisma.user.upsert({
		where: { email: "alfadlirputra@gmail.com" },
		update: {},
		create: {
			email: "alfadlirputra@gmail.com",
			name: "Normal User",
			role: Role.USER,
			password,
		},
	});

	// Generate 100 dummy users with addresses
	console.log("Generating 100 dummy users...");
	
	// Fetch some villages to use for addresses
	// We select villages and include their full hierarchy (District -> Regency -> Province)
	const villages = await prisma.village.findMany({
		take: 100,
		include: {
			district: {
				include: {
					regency: {
						include: {
							province: true,
						},
					},
				},
			},
		},
	});

	if (villages.length === 0) {
		console.warn("No villages found. Dummy users will be created without addresses. Make sure to run address seeder first.");
	}

	for (let i = 0; i < 100; i++) {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();
		
		// Pick a random village if available
		let addressData = {};
		if (villages.length > 0) {
			const village = villages[Math.floor(Math.random() * villages.length)];
			// Automatically populate the full hierarchy based on the chosen village
			addressData = {
				villageId: village.id,
				districtId: village.district.id,
				regencyId: village.district.regency.id,
				provinceId: village.district.regency.province.id,
				address: faker.location.streetAddress(),
			};
		}

		try {
			await prisma.user.create({
				data: {
					name: `${firstName} ${lastName}`,
					email: email,
					password: password,
					role: Role.USER,
					phone: faker.phone.number(),
					...addressData,
				},
			});
		} catch (error) {
			// Ignore duplicates (email or phone) and continue
			// console.log(`Skipped duplicate user generation: ${email}`);
		}
	}
	
	console.log("Dummy users generation completed.");

    return admin;
}
