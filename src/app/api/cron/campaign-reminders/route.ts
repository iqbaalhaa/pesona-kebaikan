import { NextRequest, NextResponse } from "next/server";
import { sendCampaignEndingSoonReminders } from "@/actions/campaign-reminders";

// No built-in scheduler — this route is meant to be hit once a day by an
// external trigger (VPS crontab calling curl, see the crontab line in
// CLAUDE.md's Cron Jobs section) with `Authorization: Bearer $CRON_SECRET`.
export async function GET(req: NextRequest) {
	const authHeader = req.headers.get("authorization");
	if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const res = await sendCampaignEndingSoonReminders();
	return NextResponse.json(res, { status: res.success ? 200 : 500 });
}
