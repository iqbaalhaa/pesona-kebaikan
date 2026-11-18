import { prisma } from "@/lib/prisma";

// Paid donation totals summed in Postgres instead of loading every row.
const PAID = ["PAID", "paid", "SETTLED", "COMPLETED"];

export async function paidDonationsByProvince() {
	const rows = await prisma.$queryRaw<
		{ provinceId: string; total: number; count: number }[]
	>`
		SELECT u."provinceId", SUM(d.amount)::float8 AS total, COUNT(*)::int AS count
		FROM "Donation" d
		JOIN "User" u ON u.id = d."userId"
		WHERE d.status = ANY(${PAID}) AND u."provinceId" IS NOT NULL
		GROUP BY u."provinceId"
	`;
	const amount: Record<string, number> = {};
	const count: Record<string, number> = {};
	for (const r of rows) {
		amount[r.provinceId] = r.total;
		count[r.provinceId] = r.count;
	}
	return { amount, count };
}

export async function paidDonationsByUser() {
	const rows = await prisma.donation.groupBy({
		by: ["userId"],
		where: { status: { in: PAID }, userId: { not: null } },
		_sum: { amount: true },
		_count: { _all: true },
		_max: { createdAt: true },
	});
	return new Map(rows.map((r) => [r.userId as string, r]));
}
