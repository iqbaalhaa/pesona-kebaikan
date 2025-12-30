"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type ProvinceStat = {
	name: string;
	users: number;
	donation: number;
	donationCount: number;
};
export type UserInfoRow = {
	id: string;
	name: string | null;
	email: string;
	phone: string | null;
	province: string | null;
	totalDonation: number;
	donationCount: number;
	lastDonationAt: string | null;
};

export async function getInfoUsersStats() {
	const session = await auth();
	if (!session?.user || session.user.role !== "ADMIN") {
		return null;
	}

	const provinces = await prisma.province.findMany({
		select: { id: true, name: true },
	});
	const usersByProv = await prisma.user.groupBy({
		by: ["provinceId"],
		_count: { id: true },
		where: { role: "USER", provinceId: { not: null } },
	});
	const donationsWithUser = await prisma.donation.findMany({
		where: {
			status: { in: ["PAID", "paid", "SETTLED", "COMPLETED"] },
			user: { provinceId: { not: null } },
		},
		select: {
			amount: true,
			createdAt: true,
			user: { select: { provinceId: true } },
		},
	});

	const donationByProvMap: Record<string, number> = {};
	const donationCountByProvMap: Record<string, number> = {};
	donationsWithUser.forEach((d) => {
		const pid = d.user?.provinceId || "";
		if (pid) {
			donationByProvMap[pid] = (donationByProvMap[pid] || 0) + Number(d.amount);
			donationCountByProvMap[pid] = (donationCountByProvMap[pid] || 0) + 1;
		}
	});

	const userByProvMap: Record<string, number> = {};
	usersByProv.forEach((u) => {
		if (u.provinceId) {
			userByProvMap[u.provinceId] = u._count.id;
		}
	});

	const provinceStats: ProvinceStat[] = provinces.map((p) => ({
		name: p.name,
		users: userByProvMap[p.id] || 0,
		donation: donationByProvMap[p.id] || 0,
		donationCount: donationCountByProvMap[p.id] || 0,
	}));

	const users = await prisma.user.findMany({
		where: { role: "USER" },
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			province: { select: { name: true } },
			donations: {
				select: { amount: true, status: true, createdAt: true },
			},
		},
	});

	const rows: UserInfoRow[] = users.map((u) => {
		const paid = u.donations.filter((d) =>
			["PAID", "paid", "SETTLED", "COMPLETED"].includes(d.status)
		);
		const totalDonation = paid.reduce((sum, d) => sum + Number(d.amount), 0);
		const donationCount = paid.length;
		const lastDonationAt =
			paid.length > 0
				? paid
						.map((d) => d.createdAt)
						.sort((a, b) => b.getTime() - a.getTime())[0]
						.toLocaleString("id-ID")
				: null;
		return {
			id: u.id,
			name: u.name || null,
			email: u.email,
			phone: u.phone || null,
			province: u.province?.name || null,
			totalDonation,
			donationCount,
			lastDonationAt,
		};
	});

	return { provinceStats, users: rows };
}
