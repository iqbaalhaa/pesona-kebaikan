import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
	try {
		const origin = new URL(req.url).origin;
		const body = await req.json();
		const donationId = body?.donationId as string | undefined;

		if (!donationId) {
			return NextResponse.json(
				{ success: false, error: "donationId wajib diisi" },
				{ status: 400 }
			);
		}

		const donation = await prisma.donation.findUnique({
			where: { id: donationId },
			include: {
				campaign: {
					select: { title: true, slug: true, id: true },
				},
			},
		});

		if (!donation) {
			return NextResponse.json(
				{ success: false, error: "Donasi tidak ditemukan" },
				{ status: 404 }
			);
		}

		const serverKey = process.env.MIDTRANS_SERVER_KEY;
		if (!serverKey) {
			return NextResponse.json(
				{ success: false, error: "MIDTRANS_SERVER_KEY belum dikonfigurasi" },
				{ status: 500 }
			);
		}

		const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
		const snapUrl = isProd
			? "https://api.midtrans.com/snap/v1/transactions"
			: "https://api.sandbox.midtrans.com/snap/v1/transactions";

		const amount = Math.max(1, Math.round(Number(donation.amount)));
		const itemName = `Donasi - ${donation.campaign?.title || "Campaign"}`.slice(
			0,
			50
		);

		const finishUrl = `${origin}/donasi/${
			donation.campaign?.slug || donation.campaignId
		}?donation_success=true`;
		const notificationUrl = `${origin}/api/midtrans/notification`;

		const payload: any = {
			transaction_details: {
				order_id: donation.id,
				gross_amount: amount,
			},
			item_details: [
				{
					id: donation.campaignId,
					price: amount,
					quantity: 1,
					name: itemName,
				},
			],
			customer_details: {
				first_name: donation.donorName || "Donatur",
				phone: donation.donorPhone || "",
			},
			callbacks: {
				finish: finishUrl,
			},
			notification_url: notificationUrl,
		};

		const authHeader =
			"Basic " + Buffer.from(`${serverKey}:`).toString("base64");

		const res = await fetch(snapUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: authHeader,
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const errText = await res.text();
			return NextResponse.json(
				{ success: false, error: errText || "Gagal membuat Snap token" },
				{ status: 500 }
			);
		}

		const data = await res.json();

		return NextResponse.json({
			success: true,
			token: data?.token,
			redirect_url: data?.redirect_url,
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: "Terjadi kesalahan saat membuat Snap token" },
			{ status: 500 }
		);
	}
}
