"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function mapTxStatus(raw: string) {
	const s = (raw || "").toUpperCase();
	if (s === "PENDING") return "pending";
	if (s === "FAILED" || s === "GAGAL" || s === "DENY" || s === "CANCEL")
		return "failed";
	if (s === "REFUNDED" || s === "REFUND" || s === "CHARGEBACK")
		return "refunded";
	return "paid";
}

// Helper function to check status with Midtrans
async function checkMidtransStatus(orderId: string) {
	try {
		const serverKey = process.env.MIDTRANS_SERVER_KEY;
		const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
		const baseUrl = isProd
			? "https://api.midtrans.com/v2"
			: "https://api.sandbox.midtrans.com/v2";

		const authHeader =
			"Basic " + Buffer.from(`${serverKey}:`).toString("base64");

		const res = await fetch(`${baseUrl}/${orderId}/status`, {
			headers: {
				Authorization: authHeader,
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			cache: "no-store",
		});

		if (!res.ok) return null;

		const data = await res.json();
		return data; // returns full midtrans status object
	} catch (error) {
		console.error(`Failed to check Midtrans status for ${orderId}:`, error);
		return null;
	}
}

// Helper to map Midtrans status to our internal status
function mapMidtransToInternal(status: string, fraud: string = "") {
	const s = (status || "").toLowerCase();
	const f = (fraud || "").toLowerCase();

	if (s === "settlement" || s === "capture") {
		if (s === "capture" && f === "challenge") return "PENDING";
		return "PAID";
	}
	if (s === "pending") return "PENDING";
	if (s === "deny" || s === "cancel" || s === "expire" || s === "failure")
		return "FAILED";
	if (s === "refund" || s === "partial_refund" || s === "chargeback")
		return "REFUNDED";

	return "PENDING";
}

export async function getAdminTransactions() {
	try {
		const session = await auth();
		if (!session?.user || session.user.role !== "ADMIN") {
			// Uncomment this in production to enforce admin access
			// return { success: false, error: "Unauthorized" };
		}

		let donations = await prisma.donation.findMany({
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

		// Check for stale PENDING transactions (older than 30 seconds)
		// We limit this to recent 20 pending transactions to avoid performance issues
		const pendingDonations = donations
			.filter((d) => d.status === "PENDING")
			.slice(0, 10); // Check up to 10 latest pending transactions

		if (pendingDonations.length > 0) {
			const updates = await Promise.all(
				pendingDonations.map(async (d) => {
					const midtransData = await checkMidtransStatus(d.id);
					if (midtransData && midtransData.transaction_status) {
						const newStatus = mapMidtransToInternal(
							midtransData.transaction_status,
							midtransData.fraud_status
						);

						if (newStatus !== "PENDING" && newStatus !== d.status) {
							// Update DB
							await prisma.donation.update({
								where: { id: d.id },
								data: { status: newStatus },
							});
							return { id: d.id, status: newStatus };
						}
					}
					return null;
				})
			);

			// Refresh donations list if any updates occurred
			if (updates.some((u) => u !== null)) {
				donations = await prisma.donation.findMany({
					include: {
						campaign: { select: { title: true } },
						user: { select: { name: true, email: true, phone: true } },
					},
					orderBy: { createdAt: "desc" },
				});
			}
		}

		const mappedDonations = donations.map((d) => {
			let method = "manual";
			if (d.paymentMethod === "EWALLET") method = "gopay"; // Default mapping
			else if (d.paymentMethod === "VIRTUAL_ACCOUNT") method = "va_bca";
			else if (d.paymentMethod === "TRANSFER") method = "manual";
			else if (d.paymentMethod === "CARD") method = "qris"; // Approx mapping

			const status = mapTxStatus(d.status);

			return {
				id: d.id,
				createdAt: d.createdAt.toLocaleString("id-ID", {
					day: "numeric",
					month: "short",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				}),
				campaignId: d.campaignId,
				campaignTitle: d.campaign.title,
				donorName: d.donorName,
				donorPhone: d.donorPhone || "-",
				donorEmail: d.user?.email || "-", // Keep for backward compat or display logic
				message: d.message || "-",
				isAnonymous: d.isAnonymous,
				amount: Number(d.amount),
				method: method,
				status: status,
				refCode: d.id.substring(0, 8).toUpperCase(), // Use first 8 chars of ID as ref
				account: d.user
					? {
							name: d.user.name || "No Name",
							email: d.user.email,
							phone: d.user.phone || "-",
					  }
					: null,
			};
		});

		return { success: true, data: mappedDonations };
	} catch (error) {
		console.error("Error fetching admin transactions:", error);
		return { success: false, error: "Gagal mengambil data transaksi" };
	}
}

export async function getCampaignTransactions(campaignId: string) {
	try {
		const session = await auth();
		if (!session?.user || session.user.role !== "ADMIN") {
			// Uncomment this in production to enforce admin access
			// return { success: false, error: "Unauthorized" };
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

		const mappedDonations = donations.map((d) => {
			let method = "manual";
			if (d.paymentMethod === "EWALLET") method = "gopay";
			else if (d.paymentMethod === "VIRTUAL_ACCOUNT") method = "va_bca";
			else if (d.paymentMethod === "TRANSFER") method = "manual";
			else if (d.paymentMethod === "CARD") method = "qris";

			const status = mapTxStatus(d.status);

			return {
				id: d.id,
				createdAt: d.createdAt.toLocaleString("id-ID", {
					day: "numeric",
					month: "short",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				}),
				campaignId: d.campaignId,
				campaignTitle: d.campaign.title,
				donorName: d.donorName,
				donorPhone: d.donorPhone || "-",
				donorEmail: d.user?.email || "-",
				message: d.message || "-",
				isAnonymous: d.isAnonymous,
				amount: Number(d.amount),
				method: method,
				status: status,
				refCode: d.id.substring(0, 8).toUpperCase(),
				account: d.user
					? {
							name: d.user.name || "No Name",
							email: d.user.email,
							phone: d.user.phone || "-",
					  }
					: null,
			};
		});

		return { success: true, data: mappedDonations };
	} catch (error) {
		console.error("Error fetching campaign transactions:", error);
		return { success: false, error: "Gagal mengambil data transaksi campaign" };
	}
}
