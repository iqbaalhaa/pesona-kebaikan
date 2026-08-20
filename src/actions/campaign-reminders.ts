"use server";

import { prisma } from "@/lib/prisma";
import { createNotification } from "@/actions/notification";
import { NotificationType } from "@prisma/client";

// How many days before `end` the owner gets notified. A campaign only ever
// gets one reminder (endReminderSentAt gates re-sends), so this is really
// "notify once the campaign enters its last N days", not a recurring nag.
const REMINDER_DAYS_BEFORE_END = 7;

/**
 * Finds ACTIVE campaigns entering their last REMINDER_DAYS_BEFORE_END days
 * that haven't been reminded yet, and notifies each owner once. There is no
 * automatic trigger for this in the app itself (campaigns don't self-check
 * on any page view) — this must be invoked by a scheduled job. See
 * src/app/api/cron/campaign-reminders/route.ts, triggered daily by a VPS
 * crontab entry (see CLAUDE.md's Cron Jobs section).
 */
export async function sendCampaignEndingSoonReminders() {
	const now = new Date();
	const threshold = new Date(
		now.getTime() + REMINDER_DAYS_BEFORE_END * 24 * 60 * 60 * 1000,
	);

	try {
		// Unlimited-duration campaigns (end: null) never qualify — nothing to
		// warn about. Already-reminded campaigns (endReminderSentAt set) are
		// skipped so re-running the job doesn't spam the owner.
		const campaigns = await prisma.campaign.findMany({
			where: {
				status: "ACTIVE",
				end: { not: null, gte: now, lte: threshold },
				endReminderSentAt: null,
			},
			select: { id: true, title: true, end: true, createdById: true },
		});

		let sent = 0;
		for (const c of campaigns) {
			if (!c.end) continue;
			const daysLeft = Math.max(
				1,
				Math.ceil((c.end.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)),
			);

			await createNotification(
				c.createdById,
				"Campaign Anda Akan Segera Berakhir",
				`Campaign "${c.title}" akan berakhir dalam ${daysLeft} hari. Jika masih membutuhkan waktu atau target lebih, Anda bisa mengajukan perpanjangan lewat halaman kelola campaign.`,
				NotificationType.KABAR,
			);

			await prisma.campaign.update({
				where: { id: c.id },
				data: { endReminderSentAt: now },
			});

			sent++;
		}

		return { success: true, count: sent };
	} catch (error) {
		console.error("sendCampaignEndingSoonReminders error:", error);
		return { success: false, error: "Failed to send campaign reminders" };
	}
}
