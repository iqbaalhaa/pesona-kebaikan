"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { startOfDay, subDays, format, startOfMonth } from "date-fns";
import { id } from "date-fns/locale";

export async function getDashboardStats() {
	const session = await auth();
	if (!session?.user || session.user.role !== "ADMIN") {
		return null;
	}

	try {
		const today = startOfDay(new Date());
		const firstDayOfMonth = startOfMonth(today);

		// 1. KPI Cards
		const [
			activeCampaigns,
			totalUsers,
			pendingCampaigns,
			totalCampaigns,
			donationTodayAgg,
			donationMonthAgg,
			payoutPending,
			payoutMonthAgg,
			provinces,
			usersByProv,
			donationsWithUser,
 		] = await Promise.all([
 			prisma.campaign.count({ where: { status: "ACTIVE" } }),
 			prisma.user.count({ where: { role: "USER" } }),
 			prisma.campaign.count({ where: { status: "PENDING" } }),
 			prisma.campaign.count(),
			prisma.donation.aggregate({
				_sum: { amount: true },
				where: {
					status: { in: ["PAID", "paid", "SETTLED", "COMPLETED"] },
					createdAt: { gte: today },
				},
			}),
			prisma.donation.aggregate({
				_sum: { amount: true },
				where: {
					status: { in: ["PAID", "paid", "SETTLED", "COMPLETED"] },
					createdAt: { gte: firstDayOfMonth },
				},
			}),
			prisma.withdrawal.count({ where: { status: "PENDING" } }),
			prisma.withdrawal.aggregate({
				_sum: { amount: true },
				where: {
					status: { in: ["PENDING"] },
				},
			}),
 			prisma.province.findMany({ select: { id: true, name: true } }),
 			prisma.user.groupBy({
 				by: ["provinceId"],
 				_count: { id: true },
 				where: { role: "USER", provinceId: { not: null } },
 			}),
 			prisma.donation.findMany({
 				where: {
 					status: { in: ["PAID", "paid", "SETTLED", "COMPLETED"] },
 					user: { provinceId: { not: null } },
 				},
 				select: {
 					amount: true,
 					user: {
 						select: { provinceId: true },
 					},
 				},
 			}),
 		]);

		const donationToday = Number(donationTodayAgg._sum.amount || 0);
		const donationMonth = Number(donationMonthAgg._sum.amount || 0);
		const payoutMonth = Number(payoutMonthAgg._sum.amount || 0);

 		// Aggregate donations by provinceId
 		const donationByProvMap: Record<string, number> = {};
 		const donationCountByProvMap: Record<string, number> = {};
 		donationsWithUser.forEach((d) => {
 			const pid = d.user?.provinceId;
 			if (pid) {
 				donationByProvMap[pid] = (donationByProvMap[pid] || 0) + Number(d.amount);
 				donationCountByProvMap[pid] = (donationCountByProvMap[pid] || 0) + 1;
 			}
 		});
 
 		// Create Map for User Counts
 		const userByProvMap: Record<string, number> = {};
		usersByProv.forEach((u) => {
			if (u.provinceId) {
				userByProvMap[u.provinceId] = u._count.id;
			}
		});

 		const provinceStats = provinces.map((p) => ({
 			name: p.name,
 			users: userByProvMap[p.id] || 0,
 			donation: donationByProvMap[p.id] || 0,
 			donationCount: donationCountByProvMap[p.id] || 0,
 		}));

		// 2. Donation Last 7 Days
		const donation7dData = [];
		for (let i = 6; i >= 0; i--) {
			const date = subDays(today, i);
			const nextDate = subDays(today, i - 1);

			const agg = await prisma.donation.aggregate({
				_sum: { amount: true },
				where: {
					status: { in: ["PAID", "paid", "SETTLED", "COMPLETED"] },
					createdAt: {
						gte: date,
						lt: nextDate,
					},
				},
			});

			donation7dData.push({
				name: format(date, "EEE", { locale: id }),
				value: Number(agg._sum.amount || 0),
			});
		}

		// 3. Category Distribution
		const categories = await prisma.campaignCategory.findMany({
			include: {
				_count: {
					select: { campaigns: true },
				},
			},
		});

		const categoryDist = categories
			.map((cat) => ({
				name: cat.name,
				value: cat._count.campaigns,
			}))
			.sort((a, b) => b.value - a.value)
			.slice(0, 5);

		// 4. Payment Method Distribution
		const paymentMethods = await prisma.donation.groupBy({
			by: ["paymentMethod"],
			_count: {
				paymentMethod: true,
			},
			where: {
				status: { in: ["PAID", "paid", "SETTLED", "COMPLETED"] },
			},
		});

		const payMethodDist = paymentMethods.map((pm) => {
			let name = "Lainnya";
			if (pm.paymentMethod === "EWALLET") name = "E-Wallet";
			else if (pm.paymentMethod === "VIRTUAL_ACCOUNT") name = "Virtual Account";
			else if (pm.paymentMethod === "TRANSFER") name = "Transfer";
			else if (pm.paymentMethod === "CARD") name = "Kartu";

			return {
				name,
				value: pm._count.paymentMethod,
			};
		});

		// 5. Campaign Created Last 14 Days
		const campaignCreated14d = [];
		for (let i = 13; i >= 0; i--) {
			const date = subDays(today, i);
			const nextDate = subDays(today, i - 1);

			const count = await prisma.campaign.count({
				where: {
					createdAt: {
						gte: date,
						lt: nextDate,
					},
				},
			});

			campaignCreated14d.push({
				day: i === 0 ? "Hari ini" : `D-${i}`,
				value: count,
			});
		}

		// 6. Recent Queue (Pending Campaigns)
		const recentQueueRaw = await prisma.campaign.findMany({
			where: { status: "PENDING" },
			orderBy: { createdAt: "asc" },
			take: 5,
			include: {
				createdBy: {
					select: { name: true, image: true },
				},
				category: {
					select: { name: true },
				},
			},
		});

		const recentQueue = recentQueueRaw.map((c) => ({
			id: c.id,
			title: c.title,
			meta: `Menunggu verifikasi • ${format(c.createdAt, "dd MMM yyyy", {
				locale: id,
			})}`,
		}));

		// 7. Review Solved Rate
		const totalProcessed = await prisma.campaign.count({
			where: { status: { in: ["ACTIVE", "REJECTED", "COMPLETED"] } },
		});
		const totalAll = totalProcessed + pendingCampaigns;
		const reviewSolvedRate =
			totalAll > 0 ? Math.round((totalProcessed / totalAll) * 100) : 0;

		return {
			kpi: {
				campaignTotal: totalCampaigns,
				campaignActive: activeCampaigns,
				campaignReview: pendingCampaigns,
				donationToday,
				donationMonth,
				payoutPending,
				payoutMonth,
				usersTotal: totalUsers,

				donation7d: donation7dData,
				categoryDist,
				payMethodDist,
				campaignCreated14d,
				provinceStats,
			},
			reviewSolvedRate,
			recentQueue,
		};
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		return null;
	}
}
