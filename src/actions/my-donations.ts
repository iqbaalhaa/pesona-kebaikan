"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";

export async function getMyDonations() {
	const session = await auth();

	if (!session?.user?.id) {
		return { success: false, error: "Unauthorized" };
	}

	// Get user's phone number
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { phone: true },
	});

	try {
		let whereClause: any = {
			AND: [
				{ status: { in: ["PAID", "SETTLED"] } },
				{ userId: session.user.id },
			],
		};

		if (user?.phone) {
			whereClause = {
				AND: [
					{ status: { in: ["PAID", "SETTLED"] } },
					{ OR: [{ userId: session.user.id }, { donorPhone: user.phone }] },
				],
			};
		}

		const donations = await prisma.donation.findMany({
			where: whereClause,
			include: {
				campaign: {
					include: {
						category: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		const mappedDonations = donations.map((d) => ({
			id: d.id,
			campaign: d.campaign.title,
			amount: Number(d.amount),
			date: d.createdAt.toLocaleDateString("id-ID", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			}),
			rawDate: d.createdAt.toISOString().split("T")[0],
			status:
				d.status === "PAID" || d.status === "SETTLED"
					? "Berhasil"
					: d.status === "PENDING"
						? "Menunggu Pembayaran"
						: d.status === "FAILED"
							? "Gagal"
							: d.status === "REFUNDED"
								? "Dikembalikan"
								: d.status,
			paymentMethod: formatPaymentMethod(d.paymentMethod),
			prayer: d.message || "",
			campaignId: d.campaignId,
			category: d.campaign.category.name,
		}));

		return {
			success: true,
			data: mappedDonations,
			missingPhone: !user?.phone,
		};
	} catch (error) {
		console.error("Error fetching my donations:", error);
		return { success: false, error: "Gagal mengambil data donasi" };
	}
}

function formatPaymentMethod(method: PaymentMethod): string {
	switch (method) {
		case "EWALLET":
			return "E-Wallet";
		case "VIRTUAL_ACCOUNT":
			return "Virtual Account";
		case "TRANSFER":
			return "Transfer Bank";
		case "CARD":
			return "Kartu Kredit";
		default:
			return method;
	}
}
