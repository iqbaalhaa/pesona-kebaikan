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

	// Fetch all provinces IDs to distribute users across Indonesia
	const provinces = await prisma.province.findMany({ select: { id: true } });

	for (let i = 0; i < 100; i++) {
		const firstName = faker.person.firstName();
		const lastName = faker.person.lastName();
		const email = faker.internet.email({ firstName, lastName }).toLowerCase();

		// Pick a random province
		const randomProvince =
			provinces[Math.floor(Math.random() * provinces.length)];

		// Pick a random village in that province
		const village = await prisma.village.findFirst({
			where: { district: { regency: { provinceId: randomProvince.id } } },
			// Skip a random amount to vary within province (limit skip to avoid performance hit, assuming each province has > 0 villages)
			// For simplicity in seed, just take the first one or a random one from top 10
			skip: Math.floor(Math.random() * 10),
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

		let addressData = {};
		if (village) {
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
			// Ignore duplicates
		}
	}

	console.log("Dummy users generation completed.");

	return admin;
}
