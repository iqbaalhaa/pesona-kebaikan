import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EVENT_TYPES, recordCampaignEvent, type CampaignEventType } from "@/lib/campaign-events";
import { readRequestTracking } from "@/lib/tracking-server";

// Browser beacon for funnel events (VIEW on the campaign page, DONATE_CLICK when
// the donation form opens). CHECKOUT is recorded server-side in /api/payment/checkout.
export async function POST(req: Request) {
	let body: { campaignId?: unknown; fundraiserId?: unknown; type?: unknown };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ ok: false }, { status: 400 });
	}
	const type = body.type as CampaignEventType;
	if (
		typeof body.campaignId !== "string" ||
		body.campaignId.length > 40 ||
		type === "CHECKOUT" ||
		!EVENT_TYPES.includes(type)
	) {
		return NextResponse.json({ ok: false }, { status: 400 });
	}
	const fundraiserId =
		typeof body.fundraiserId === "string" && body.fundraiserId.length <= 40
			? body.fundraiserId
			: null;

	const campaign = await prisma.campaign.findUnique({
		where: { id: body.campaignId },
		select: { id: true, fundraisers: fundraiserId ? { where: { id: fundraiserId }, select: { id: true } } : false },
	});
	if (!campaign) return NextResponse.json({ ok: false }, { status: 404 });

	const result = await recordCampaignEvent({
		campaignId: campaign.id,
		fundraiserId: campaign.fundraisers?.[0]?.id ?? null,
		type,
		tracking: await readRequestTracking(),
	});
	return NextResponse.json({ ok: true, result });
}
