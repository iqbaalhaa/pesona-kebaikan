import { prisma } from "../../src/lib/prisma";
import { CampaignStatus, CampaignMediaType, PaymentMethod } from "@/generated/prisma";
import { faker } from "@faker-js/faker";

async function upsertCampaignCategory(name: string) {
	return prisma.campaignCategory.upsert({
		where: { name },
		update: {},
		create: { name },
	});
}

function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function makeSlug(title: string) {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.concat("-", faker.string.alphanumeric(6).toLowerCase());
}

export async function seedCampaigns() {
	// Ensure categories
	const kesehatan = await upsertCampaignCategory("Kesehatan");
	const pendidikan = await upsertCampaignCategory("Pendidikan");
	const bencana = await upsertCampaignCategory("Bencana Alam");
	const kemanusiaan = await upsertCampaignCategory("Kemanusiaan");

	const categories = [kesehatan, pendidikan, bencana, kemanusiaan];

	// Load users to assign as campaign creators and donors
	const users = await prisma.user.findMany({ select: { id: true, name: true } });
	if (users.length === 0) {
		console.warn("No users found. Skipping campaign seeding.");
		return;
	}

	// Seed 10 campaigns per category
	for (const category of categories) {
		for (let i = 0; i < 10; i++) {
			const createdBy = pickRandom(users);
			const title = `${category.name} - ${faker.company.catchPhrase()}`;
			const slug = makeSlug(title);

			const story = `
        <p>${faker.lorem.paragraph()}</p>
        <p>${faker.lorem.paragraph()}</p>
        <p>${faker.lorem.paragraph()}</p>
      `;

			// Upsert campaign by unique slug
			const campaign = await prisma.campaign.upsert({
				where: { slug },
				update: {},
				create: {
					title,
					slug,
					story,
					target: faker.number.int({ min: 25_000_000, max: 500_000_000 }),
					categoryId: category.id,
					createdById: createdBy.id,
					isEmergency: false,
					status: CampaignStatus.ACTIVE,
					start: new Date(),
					end: new Date(Date.now() + faker.number.int({ min: 30, max: 120 }) * 24 * 60 * 60 * 1000),
					verifiedAt: new Date(),
					phone: faker.phone.number(),
					media: {
						create: [
							{
								type: CampaignMediaType.IMAGE,
								url: `https://picsum.photos/800/600?random=${faker.number.int({ min: 1, max: 9999 })}`,
								isThumbnail: true,
							},
						],
					},
				},
			});

			// Create at least 50 donations per campaign
			const donationsToCreate = 50;
			const donationsData: {
				donorName: string;
				donorPhone?: string;
				message?: string;
				amount: number;
				paymentMethod: PaymentMethod;
				campaignId: string;
				userId?: string | null;
			}[] = [];

			for (let d = 0; d < donationsToCreate; d++) {
				const amount = faker.number.int({ min: 10_000, max: 1_000_000 });
				const pmValues = [PaymentMethod.EWALLET, PaymentMethod.VIRTUAL_ACCOUNT, PaymentMethod.TRANSFER, PaymentMethod.CARD];
				const paymentMethod = pickRandom(pmValues);
				const donorUser = Math.random() < 0.6 ? pickRandom(users) : null; // 60% donations linked to users

				donationsData.push({
					donorName: donorUser?.name || faker.person.fullName(),
					donorPhone: faker.phone.number(),
					message: Math.random() < 0.5 ? faker.lorem.sentence() : undefined,
					amount,
					paymentMethod,
					campaignId: campaign.id,
					userId: donorUser?.id || null,
				});
			}

			await prisma.donation.createMany({
				data: donationsData,
				skipDuplicates: true,
			});

			// Create one withdrawal per campaign (e.g., 10% of total donations)
			const totalDonationsAmount = donationsData.reduce((sum, d) => sum + d.amount, 0);
			const withdrawalAmount = Math.max(100_000, Math.floor(totalDonationsAmount * 0.1));

			await prisma.withdrawal.create({
				data: {
					amount: withdrawalAmount,
					bankName: pickRandom(["BCA", "BRI", "BNI", "Mandiri"]),
					bankAccount: faker.finance.accountNumber(),
					accountHolder: createdBy.name || "Pemilik Rekening",
					proofUrl: "https://picsum.photos/seed/proof/800/600",
					notes: "Penarikan awal untuk kebutuhan operasional.",
					campaignId: campaign.id,
				},
			});
		}
	}

	console.log("Seeded campaigns with donations and withdrawals per category.");
}
