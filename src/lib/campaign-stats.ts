import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PAID_STATUSES } from "@/lib/donation-settlement";

// Funnel stats: CampaignEvent (view → donate click → checkout) + Donation
// (created → paid). Everything aggregated in the DB. Donations are counted by
// createdAt inside the range (cohort), matching the event counts.

export type FunnelTotals = {
	views: number;
	visitors: number;
	donateClicks: number;
	checkouts: number;
	donationsCreated: number;
	donationsPaid: number;
	paidAmount: number;
};

export type DailyRow = { date: string; views: number; clicks: number; checkouts: number; paid: number; paidAmount: number };
export type BreakdownRow = {
	key: string;
	utmContent?: string | null;
	views: number;
	clicks: number;
	checkouts: number;
	created: number;
	paid: number;
	paidAmount: number;
};

const WIB_OFFSET_MS = 7 * 3600_000;

/** "YYYY-MM-DD" (WIB) range → UTC [from, to). Defaults to the last 30 days, max 366. */
export function parseRange(fromStr?: string, toStr?: string) {
	const day = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? Date.parse(`${s}T00:00:00Z`) : NaN);
	const todayWib = new Date(Date.now() + WIB_OFFSET_MS).toISOString().slice(0, 10);
	let to = day(toStr);
	if (!Number.isFinite(to)) to = day(todayWib);
	let from = day(fromStr);
	if (!Number.isFinite(from) || from > to) from = to - 29 * 86400_000;
	if (to - from > 365 * 86400_000) from = to - 365 * 86400_000;
	return {
		from: new Date(from - WIB_OFFSET_MS),
		to: new Date(to + 86400_000 - WIB_OFFSET_MS),
		fromStr: new Date(from).toISOString().slice(0, 10),
		toStr: new Date(to).toISOString().slice(0, 10),
	};
}

const isPaid = (status: string) => PAID_STATUSES.includes(status);
const num = (v: unknown) => Number(v ?? 0) || 0;

function emptyRow(key: string, utmContent?: string | null): BreakdownRow {
	return { key, utmContent, views: 0, clicks: 0, checkouts: 0, created: 0, paid: 0, paidAmount: 0 };
}

function addEvent(row: BreakdownRow, type: string, n: number) {
	if (type === "VIEW") row.views += n;
	else if (type === "DONATE_CLICK") row.clicks += n;
	else if (type === "CHECKOUT") row.checkouts += n;
}

function addDonation(row: BreakdownRow, status: string, n: number, amount: number) {
	row.created += n;
	if (isPaid(status)) {
		row.paid += n;
		row.paidAmount += amount;
	}
}

export async function getCampaignFunnel(input: {
	campaignId: string;
	fundraiserId?: string | null;
	from: Date;
	to: Date;
	withSources: boolean;
}) {
	const { campaignId, from, to } = input;
	const fr = input.fundraiserId || undefined;
	const eventWhere = { campaignId, fundraiserId: fr, createdAt: { gte: from, lt: to } };
	const donationWhere = { campaignId, fundraiserId: fr, createdAt: { gte: from, lt: to } };
	const frSql = fr ? Prisma.sql`AND "fundraiserId" = ${fr}` : Prisma.empty;

	const [byType, visitorsRow, byStatus, dailyEvents, dailyPaid] = await Promise.all([
		prisma.campaignEvent.groupBy({ by: ["type"], where: eventWhere, _count: { _all: true } }),
		prisma.$queryRaw<{ n: number }[]>`
			SELECT count(DISTINCT "visitorId")::int AS n FROM "CampaignEvent"
			WHERE "campaignId" = ${campaignId} AND type = 'VIEW'
			AND "createdAt" >= ${from} AND "createdAt" < ${to} ${frSql}`,
		prisma.donation.groupBy({ by: ["status"], where: donationWhere, _count: { _all: true }, _sum: { amount: true } }),
		prisma.$queryRaw<{ d: string; type: string; n: number }[]>`
			SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') AS d,
				type, count(*)::int AS n
			FROM "CampaignEvent"
			WHERE "campaignId" = ${campaignId} AND "createdAt" >= ${from} AND "createdAt" < ${to} ${frSql}
			GROUP BY 1, 2`,
		prisma.$queryRaw<{ d: string; n: number; amount: unknown }[]>`
			SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM-DD') AS d,
				count(*)::int AS n, coalesce(sum(amount), 0) AS amount
			FROM "Donation"
			WHERE "campaignId" = ${campaignId} AND status IN ('PAID', 'SETTLED')
			AND "createdAt" >= ${from} AND "createdAt" < ${to} ${frSql}
			GROUP BY 1`,
	]);

	const count = (t: string) => byType.find((r) => r.type === t)?._count._all ?? 0;
	const totals: FunnelTotals = {
		views: count("VIEW"),
		visitors: visitorsRow[0]?.n ?? 0,
		donateClicks: count("DONATE_CLICK"),
		checkouts: count("CHECKOUT"),
		donationsCreated: byStatus.reduce((a, r) => a + r._count._all, 0),
		donationsPaid: byStatus.filter((r) => isPaid(r.status)).reduce((a, r) => a + r._count._all, 0),
		paidAmount: byStatus.filter((r) => isPaid(r.status)).reduce((a, r) => a + num(r._sum.amount), 0),
	};

	// One row per day in range, so the chart has no gaps.
	const daily = new Map<string, DailyRow>();
	for (let t = from.getTime() + WIB_OFFSET_MS; t < to.getTime() + WIB_OFFSET_MS; t += 86400_000) {
		const date = new Date(t).toISOString().slice(0, 10);
		daily.set(date, { date, views: 0, clicks: 0, checkouts: 0, paid: 0, paidAmount: 0 });
	}
	for (const r of dailyEvents) {
		const row = daily.get(r.d);
		if (!row) continue;
		if (r.type === "VIEW") row.views += r.n;
		else if (r.type === "DONATE_CLICK") row.clicks += r.n;
		else if (r.type === "CHECKOUT") row.checkouts += r.n;
	}
	for (const r of dailyPaid) {
		const row = daily.get(r.d);
		if (row) {
			row.paid += r.n;
			row.paidAmount += num(r.amount);
		}
	}

	if (!input.withSources) return { totals, daily: [...daily.values()], sources: null, ads: null };

	const [evSrc, donSrc, evAds, donAds] = await Promise.all([
		prisma.campaignEvent.groupBy({ by: ["source", "type"], where: eventWhere, _count: { _all: true } }),
		prisma.donation.groupBy({
			by: ["source", "status"],
			where: donationWhere,
			_count: { _all: true },
			_sum: { amount: true },
		}),
		prisma.campaignEvent.groupBy({
			by: ["utmCampaign", "utmContent", "type"],
			where: { ...eventWhere, utmCampaign: { not: null } },
			_count: { _all: true },
		}),
		prisma.donation.groupBy({
			by: ["utmCampaign", "utmContent", "status"],
			where: { ...donationWhere, utmCampaign: { not: null } },
			_count: { _all: true },
			_sum: { amount: true },
		}),
	]);

	const sources = new Map<string, BreakdownRow>();
	const src = (k: string | null) => {
		const key = k || "unknown";
		if (!sources.has(key)) sources.set(key, emptyRow(key));
		return sources.get(key)!;
	};
	evSrc.forEach((r) => addEvent(src(r.source), r.type, r._count._all));
	donSrc.forEach((r) => addDonation(src(r.source), r.status, r._count._all, num(r._sum.amount)));

	const ads = new Map<string, BreakdownRow>();
	const ad = (c: string | null, content: string | null) => {
		const id = `${c}\u0000${content ?? ""}`;
		if (!ads.has(id)) ads.set(id, emptyRow(c || "", content));
		return ads.get(id)!;
	};
	evAds.forEach((r) => addEvent(ad(r.utmCampaign, r.utmContent), r.type, r._count._all));
	donAds.forEach((r) => addDonation(ad(r.utmCampaign, r.utmContent), r.status, r._count._all, num(r._sum.amount)));

	const byValue = (a: BreakdownRow, b: BreakdownRow) => b.paidAmount - a.paidAmount || b.views - a.views;
	return {
		totals,
		daily: [...daily.values()],
		sources: [...sources.values()].sort(byValue),
		ads: [...ads.values()].sort(byValue).slice(0, 50),
	};
}

export type CampaignFunnel = Awaited<ReturnType<typeof getCampaignFunnel>>;

/** All campaigns with activity in the range, for the admin ranking table. */
export async function getCampaignRanking(input: { from: Date; to: Date; source?: string }) {
	const { from, to } = input;
	const source = input.source || undefined;
	const where = { createdAt: { gte: from, lt: to }, source };
	const [ev, don] = await Promise.all([
		prisma.campaignEvent.groupBy({ by: ["campaignId", "type"], where, _count: { _all: true } }),
		prisma.donation.groupBy({ by: ["campaignId", "status"], where, _count: { _all: true }, _sum: { amount: true } }),
	]);

	const rows = new Map<string, BreakdownRow>();
	const row = (id: string) => {
		if (!rows.has(id)) rows.set(id, emptyRow(id));
		return rows.get(id)!;
	};
	ev.forEach((r) => addEvent(row(r.campaignId), r.type, r._count._all));
	don.forEach((r) => addDonation(row(r.campaignId), r.status, r._count._all, num(r._sum.amount)));

	const campaigns = await prisma.campaign.findMany({
		where: { id: { in: [...rows.keys()] } },
		// Never the CAPI token here (goes to the browser).
		select: { id: true, title: true, slug: true, status: true, metaPixelId: true, metaPixelDisabled: true },
	});
	const byId = new Map(campaigns.map((c) => [c.id, c]));
	return [...rows.values()]
		.filter((r) => byId.has(r.key))
		.map((r) => ({ ...r, campaign: byId.get(r.key)! }))
		.sort((a, b) => b.views - a.views || b.paidAmount - a.paidAmount);
}
