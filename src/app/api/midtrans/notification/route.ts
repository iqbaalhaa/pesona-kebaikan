import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type MidtransNotification = {
	order_id?: string;
	status_code?: string;
	gross_amount?: string;
	signature_key?: string;
	transaction_status?: string;
	fraud_status?: string;
	payment_type?: string;
};

function computeSignature(input: {
	orderId: string;
	statusCode: string;
	grossAmount: string;
	serverKey: string;
}) {
	return createHash("sha512")
		.update(
			`${input.orderId}${input.statusCode}${input.grossAmount}${input.serverKey}`
		)
		.digest("hex");
}

function mapMidtransToDonationStatus(payload: MidtransNotification) {
	const ts = (payload.transaction_status || "").toLowerCase();
	const fs = (payload.fraud_status || "").toLowerCase();

	if (ts === "settlement") return "SETTLED";
	if (ts === "capture") return fs === "accept" ? "PAID" : "PENDING";
	if (ts === "pending") return "PENDING";
	if (ts === "deny" || ts === "cancel" || ts === "expire" || ts === "failure")
		return "FAILED";
	if (ts === "refund" || ts === "partial_refund") return "REFUNDED";
	if (ts === "chargeback" || ts === "partial_chargeback") return "REFUNDED";
	return null;
}

async function parseBody(req: Request): Promise<MidtransNotification> {
	const contentType = req.headers.get("content-type") || "";
	if (contentType.includes("application/json")) {
		return (await req.json()) as MidtransNotification;
	}
	const text = await req.text();
	try {
		return JSON.parse(text) as MidtransNotification;
	} catch {
		return Object.fromEntries(new URLSearchParams(text)) as any;
	}
}

export async function POST(req: Request) {
	try {
		const serverKey = process.env.MIDTRANS_SERVER_KEY;
		if (!serverKey) {
			console.error("MIDTRANS_SERVER_KEY missing");
			return NextResponse.json(
				{ success: false, error: "MIDTRANS_SERVER_KEY belum dikonfigurasi" },
				{ status: 500 }
			);
		}

		const body = await parseBody(req);
		const orderId = body.order_id;
		const statusCode = body.status_code;
		const grossAmount = body.gross_amount;
		const signatureKey = (body.signature_key || "").toLowerCase();

		console.log("Midtrans Notification:", {
			orderId,
			statusCode,
			grossAmount,
			status: body.transaction_status,
			type: body.payment_type,
		});

		if (!orderId || !statusCode || !grossAmount) {
			console.error("Incomplete payload");
			return NextResponse.json(
				{ success: false, error: "Payload Midtrans tidak lengkap" },
				{ status: 400 }
			);
		}

		const expected = computeSignature({
			orderId,
			statusCode,
			grossAmount,
			serverKey,
		}).toLowerCase();

		if (!signatureKey || signatureKey !== expected) {
			// Fallback: Try with .00 if not present, or remove it if present
			// This handles potential number/string parsing discrepancies
			let altGrossAmount = grossAmount;
			if (grossAmount.toString().includes(".")) {
				// Remove decimals: 10000.00 -> 10000
				altGrossAmount = grossAmount.toString().split(".")[0];
			} else {
				// Add decimals: 10000 -> 10000.00
				altGrossAmount = `${grossAmount}.00`;
			}

			const expectedAlt = computeSignature({
				orderId,
				statusCode,
				grossAmount: altGrossAmount,
				serverKey,
			}).toLowerCase();

			if (signatureKey !== expectedAlt) {
				console.error("Invalid Signature", {
					received: signatureKey,
					expected,
					expectedAlt,
				});
				return NextResponse.json(
					{ success: false, error: "Signature tidak valid" },
					{ status: 401 }
				);
			}
		}

		const newStatus = mapMidtransToDonationStatus(body);
		console.log(`Mapping status: ${body.transaction_status} -> ${newStatus}`);

		if (!newStatus) {
			return NextResponse.json({ success: true });
		}

		const existing = await prisma.donation.findUnique({
			where: { id: orderId },
			select: { id: true, campaign: { select: { slug: true, id: true } } },
		});

		if (!existing) {
			console.error(`Donation not found: ${orderId}`);
			return NextResponse.json({ success: true });
		}

		const updated = await prisma.donation.update({
			where: { id: orderId },
			data: { status: newStatus },
		});

		console.log("Donation updated:", updated);

		revalidatePath("/admin/transaksi");
		revalidatePath("/donasi");
		revalidatePath("/donasi-saya");
		revalidatePath("/"); // Update homepage stats
		revalidatePath("/galang-dana"); // Update campaign list stats
		if (existing.campaign?.slug) {
			revalidatePath(`/donasi/${existing.campaign.slug}`);
			revalidatePath(`/galang-dana/${existing.campaign.slug}`);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Midtrans notification error:", error);
		return NextResponse.json(
			{ success: false, error: "Terjadi kesalahan memproses notifikasi" },
			{ status: 500 }
		);
	}
}
