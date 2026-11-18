"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { DokuProvider, mapDokuStatus } from "@/lib/payment/providers/doku-provider";

const dokuProvider = new DokuProvider();

function mapTxStatus(raw: string) {
	const s = (raw || "").toUpperCase();
	if (s === "PENDING") return "pending";
	if (s === "FAILED" || s === "GAGAL" || s === "DENY" || s === "CANCEL")
		return "failed";
	if (s === "REFUNDED" || s === "REFUND" || s === "CHARGEBACK")
		return "refunded";
	return "paid";
}

function mapDonationRow(d: any) {
	let method = "manual";
	if (d.paymentMethod === "EWALLET") method = "gopay";
	else if (d.paymentMethod === "VIRTUAL_ACCOUNT") method = "va_bca";
	else if (d.paymentMethod === "TRANSFER") method = "manual";
	else if (d.paymentMethod === "CARD") method = "qris";

	return {
		id: d.id,
		createdAt: d.createdAt.toLocaleString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Jakarta",
		}),
		campaignId: d.campaignId,
		campaignTitle: d.campaign.title,
		donorName: d.donorName,
		donorPhone: d.donorPhone || "-",
		donorEmail: d.user?.email || "-",
		message: d.message || "-",
		isAnonymous: d.isAnonymous,
		allowContact: d.allowContact,
		amount: Number(d.amount),
		method,
		status: mapTxStatus(d.status),
		refCode: d.id.substring(0, 8).toUpperCase(),
		account: d.user
			? {
					name: d.user.name || "No Name",
					email: d.user.email,
					phone: d.user.phone || "-",
				}
			: null,
	};
}

// Raw Donation.status values grouped the same way mapTxStatus does, so the
// admin list can filter by the UI status in the database.
const withLower = (xs: string[]) => xs.flatMap((x) => [x, x.toLowerCase()]);
const TX_STATUS_RAW: Record<string, string[]> = {
	pending: withLower(["PENDING"]),
	failed: withLower(["FAILED", "GAGAL", "DENY", "CANCEL"]),
	refunded: withLower(["REFUNDED", "REFUND", "CHARGEBACK"]),
};
const NON_PAID_RAW = Object.values(TX_STATUS_RAW).flat();
const TX_METHOD_ENUM: Record<string, "EWALLET" | "VIRTUAL_ACCOUNT" | "TRANSFER" | "CARD"> = {
	gopay: "EWALLET",
	va_bca: "VIRTUAL_ACCOUNT",
	manual: "TRANSFER",
	qris: "CARD",
};

function txStatusWhere(status: string) {
	if (status === "paid") return { status: { notIn: NON_PAID_RAW } };
	const raw = TX_STATUS_RAW[status];
	return raw ? { status: { in: raw } } : {};
}

// Re-check the latest pending payments with DOKU so stale PENDING rows
// settle when an admin opens the list.
async function refreshPendingDonations() {
	const pending = await prisma.donation.findMany({
		where: { status: "PENDING" },
		orderBy: { createdAt: "desc" },
		take: 10,
		select: { id: true, status: true },
	});
	await Promise.all(
		pending.map(async (d) => {
			const dokuData = await dokuProvider.checkStatus(d.id);
			const newStatus = dokuData?.status ? mapDokuStatus(dokuData.status) : null;
			if (newStatus && newStatus !== "PENDING" && newStatus !== d.status) {
				await prisma.donation.update({
					where: { id: d.id },
					data: { status: newStatus },
				});
			}
		}),
	);
}

export async function getAdminTransactions(
	opts: {
		page?: number;
		pageSize?: number;
		q?: string;
		status?: string;
		method?: string;
	} = {},
) {
	try {
		const session = await auth();
		if (!session?.user || session.user.role !== "ADMIN") {
			return { success: false, error: "Unauthorized" };
		}

		const page = Math.max(1, Math.floor(Number(opts.page) || 1));
		const pageSize = Math.min(100, Math.max(1, Math.floor(Number(opts.pageSize) || 10)));
		const q = (opts.q || "").trim().slice(0, 100);
		const status = opts.status || "all";
		const method = opts.method || "all";

		if (page === 1) await refreshPendingDonations();

		const and: any[] = [];
		if (status !== "all") and.push(txStatusWhere(status));
		if (method !== "all") {
			const pm = TX_METHOD_ENUM[method];
			// A UI method with no stored equivalent (e.g. va_bri) matches nothing.
			and.push(pm ? { paymentMethod: pm } : { id: { in: [] } });
		}
		if (q) {
			and.push({
				OR: [
					{ id: { contains: q, mode: "insensitive" } },
					{ campaignId: { contains: q, mode: "insensitive" } },
					{ donorName: { contains: q, mode: "insensitive" } },
					{ campaign: { title: { contains: q, mode: "insensitive" } } },
				],
			});
		}
		const where = and.length ? { AND: and } : {};

		const [donations, total, paidAgg] = await Promise.all([
			prisma.donation.findMany({
				where,
				include: {
					campaign: { select: { title: true } },
					user: { select: { name: true, email: true, phone: true } },
				},
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.donation.count({ where }),
			prisma.donation.aggregate({
				where: txStatusWhere("paid"),
				_sum: { amount: true },
			}),
		]);

		return {
			success: true,
			data: donations.map(mapDonationRow),
			total,
			paidTotal: Number(paidAgg._sum.amount || 0),
		};
	} catch (error) {
		console.error("Error fetching admin transactions:", error);
		return { success: false, error: "Gagal mengambil data transaksi" };
	}
}

export async function getCampaignTransactions(
	campaignId: string,
	page = 1,
	pageSize = 20,
) {
	try {
		const session = await auth();
		if (!session?.user || session.user.role !== "ADMIN") {
			// SECURITY: this used to be a no-op (check ran, but the guard itself
			// was commented out) — anyone could call this action directly and get
			// every donor's name/phone/email/message for any campaign.
			return { success: false, error: "Unauthorized" };
		}

		const [donations, total] = await Promise.all([
			prisma.donation.findMany({
				where: { campaignId },
				include: {
					campaign: {
						select: {
							title: true,
						},
					},
					user: {
						select: {
							name: true,
							email: true,
							phone: true,
						},
					},
				},
				orderBy: {
					createdAt: "desc",
				},
				skip: (page - 1) * pageSize,
				take: pageSize,
			}),
			prisma.donation.count({ where: { campaignId } }),
		]);

		const mappedDonations = donations.map(mapDonationRow);

		return {
			success: true,
			data: mappedDonations,
			total,
			totalPages: Math.max(1, Math.ceil(total / pageSize)),
		};
	} catch (error) {
		console.error("Error fetching campaign transactions:", error);
		return { success: false, error: "Gagal mengambil data transaksi campaign" };
	}
}

export async function getCampaignDonorsExport(campaignId: string) {
	try {
		const session = await auth();
		if (!session?.user || session.user.role !== "ADMIN") {
			return { success: false, error: "Unauthorized" };
		}

		const donations = await prisma.donation.findMany({
			where: { campaignId },
			include: {
				campaign: {
					select: {
						title: true,
					},
				},
				user: {
					select: {
						name: true,
						email: true,
						phone: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return { success: true, data: donations.map(mapDonationRow) };
	} catch (error) {
		console.error("Error fetching campaign donors export:", error);
		return {
			success: false,
			error: "Gagal mengambil data donatur untuk export",
		};
	}
}

export async function updateAllCampaignsFee(feePercentage: number) {
	try {
		const session = await auth();
		if (!session?.user || session.user.role !== "ADMIN") {
			return { success: false, error: "Unauthorized" };
		}

		// Update ALL campaigns
		await prisma.campaign.updateMany({
			data: { foundationFee: feePercentage },
		});

		revalidatePath("/admin/campaign");
		revalidatePath("/admin/transaksi");
		revalidatePath("/"); // Optionally revalidate home if fees are shown there

		return { success: true };
	} catch (error) {
		console.error("Error updating all campaigns fee:", error);
		return {
			success: false,
			error: "Gagal mengupdate fee yayasan untuk semua campaign",
		};
	}
}

export async function searchCampaigns(query: string) {
	try {
		const session = await auth();
		if (!session?.user || session.user.role !== "ADMIN") {
			return { success: false, error: "Unauthorized" };
		}

		const campaigns = await prisma.campaign.findMany({
			where: {
				title: { contains: query, mode: "insensitive" },
			},
			take: 10,
			select: {
				id: true,
				title: true,
				foundationFee: true,
			},
		});

		return { success: true, data: campaigns };
	} catch (error) {
		console.error("Error searching campaigns:", error);
		return { success: false, error: "Gagal mencari campaign" };
	}
}
