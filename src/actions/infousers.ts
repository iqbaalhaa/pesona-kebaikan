"use server";

import { prisma } from "@/lib/prisma";
import { paidDonationsByProvince, paidDonationsByUser } from "@/lib/donation-stats";
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

	const [provinces, usersByProv, donationByProv, byUser, users] = await Promise.all([
		prisma.province.findMany({ select: { id: true, name: true } }),
		prisma.user.groupBy({
			by: ["provinceId"],
			_count: { id: true },
			where: { role: "USER", provinceId: { not: null } },
		}),
		paidDonationsByProvince(),
		paidDonationsByUser(),
		prisma.user.findMany({
			where: { role: "USER" },
			select: {
				id: true,
				name: true,
				email: true,
				phone: true,
				province: { select: { name: true } },
			},
		}),
	]);
	const donationByProvMap = donationByProv.amount;
	const donationCountByProvMap = donationByProv.count;

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

	const rows: UserInfoRow[] = users.map((u) => {
		const st = byUser.get(u.id);
		const totalDonation = Number(st?._sum.amount ?? 0);
		const donationCount = st?._count._all ?? 0;
		const lastDonationAt = st?._max.createdAt
			? st._max.createdAt.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
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
