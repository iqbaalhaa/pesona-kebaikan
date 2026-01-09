import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		let donationId = body?.donationId as string | undefined;
		const campaignId = body?.campaignId as string | undefined;
		if (!donationId) {
			if (!campaignId) {
				return NextResponse.json(
					{ success: false, error: "donationId atau campaignId wajib diisi" },
					{ status: 400 }
				);
			}
			const latest = await prisma.donation.findFirst({
				where: { campaignId },
				orderBy: { createdAt: "desc" },
				select: { id: true },
			});
			if (!latest) {
				return NextResponse.json(
					{ success: false, error: "Donasi untuk campaign ini belum ada" },
					{ status: 404 }
				);
			}
			donationId = latest.id;
		}

		const donation = await prisma.donation.findUnique({
			where: { id: donationId },
			select: { id: true, amiinCount: true },
		});
		if (!donation) {
			return NextResponse.json(
				{ success: false, error: "Donasi tidak ditemukan" },
				{ status: 404 }
			);
		}

		const session = await auth();
		const cookieHeader = req.headers.get("cookie") || "";
		const cookieMatch = cookieHeader.match(/(?:^|;)\s*amiin_session=([^;]+)/);
		let sessionId = cookieMatch
			? decodeURIComponent(cookieMatch[1])
			: undefined;
		let setCookie = false;
		if (!session?.user?.id) {
			if (!sessionId) {
				sessionId = randomUUID();
				setCookie = true;
			}
		}

		let already = false;
		if (session?.user?.id) {
			const exist = await prisma.amiin.findFirst({
				where: { donationId, userId: session.user.id },
			});
			already = !!exist;
		} else if (sessionId) {
			const exist = await prisma.amiin.findFirst({
				where: { donationId, sessionId },
			});
			already = !!exist;
		}

		if (already) {
			const res = NextResponse.json({
				success: true,
				already: true,
				count: donation.amiinCount ?? 0,
			});
			if (setCookie && sessionId) {
				res.cookies.set("amiin_session", sessionId, {
					httpOnly: true,
					maxAge: 60 * 60 * 24 * 365,
					sameSite: "lax",
				});
			}
			return res;
		}

		const ip =
			req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
			req.headers.get("x-real-ip") ||
			"";

		if (session?.user?.id) {
			await prisma.amiin.create({
				data: { donationId, userId: session.user.id, ipAddress: ip || null },
			});
		} else if (sessionId) {
			await prisma.amiin.create({
				data: { donationId, sessionId, ipAddress: ip || null },
			});
		}

		const updated = await prisma.donation.update({
			where: { id: donationId },
			data: { amiinCount: { increment: 1 } },
			select: { amiinCount: true },
		});

		const res = NextResponse.json({
			success: true,
			count: updated?.amiinCount ?? 0,
		});
		if (setCookie && sessionId) {
			res.cookies.set("amiin_session", sessionId, {
				httpOnly: true,
				maxAge: 60 * 60 * 24 * 365,
				sameSite: "lax",
			});
		}
		return res;
	} catch (error) {
		console.error("Aamiin endpoint error:", error);
		const message =
			error instanceof Error ? error.message : "Terjadi kesalahan";
		return NextResponse.json(
			{ success: false, error: message },
			{ status: 500 }
		);
	}
}
