"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { AdminPermission, NotificationType } from "@prisma/client";

// Server actions are callable directly from the browser, so the user is
// always taken from the session — never from an argument.
async function sessionUserId() {
	const session = await auth();
	return session?.user?.id ?? null;
}

async function isAdmin() {
	const session = await auth();
	return session?.user?.role === "ADMIN";
}

export async function getNotifications(
	type?: NotificationType | NotificationType[],
	limit = 20,
) {
	try {
		const userId = await sessionUserId();
		if (!userId) return { notifications: [], unreadCount: 0 };
		const typeFilter = type
			? Array.isArray(type)
				? { in: type }
				: type
			: undefined;
		const where: any = { userId };
		if (typeFilter) where.type = typeFilter;

		// Unread count is scoped to the same type filter — otherwise a caller
		// asking only for admin-alert types would get back an unread count
		// polluted by the user's regular KABAR/PESAN notifications (and vice versa).
		const [notifications, unreadCount] = await Promise.all([
			prisma.notification.findMany({
				where,
				orderBy: { createdAt: "desc" },
				take: limit,
			}),
			prisma.notification.count({
				where: { userId, isRead: false, ...(typeFilter ? { type: typeFilter } : {}) },
			}),
		]);

		return { notifications, unreadCount };
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return { notifications: [], unreadCount: 0 };
	}
}

/**
 * Notify admins/staff that something needs their attention (new campaign
 * submitted, withdrawal requested, verification requested, etc). Recipients:
 * always every ADMIN, plus (when `opts.permission` is given) every STAFF who
 * holds that specific permission — so e.g. a withdrawal request only pings
 * staff granted MANAGE_WITHDRAWALS, not every staff account. Omit
 * `opts.permission` for events with no dedicated STAFF permission (e.g. user
 * identity verification, which is ADMIN-only per src/lib/admin-access.ts).
 */
export async function notifyAdmins(
	title: string,
	message: string,
	type: NotificationType,
	opts?: { permission?: AdminPermission },
) {
	try {
		const recipients = await prisma.user.findMany({
			where: opts?.permission
				? {
						OR: [
							{ role: "ADMIN" },
							{ role: "STAFF", permissions: { has: opts.permission } },
						],
					}
				: { role: "ADMIN" },
			select: { id: true },
		});

		if (recipients.length === 0) return { success: true, count: 0 };

		await prisma.notification.createMany({
			data: recipients.map((r) => ({
				userId: r.id,
				title,
				message,
				type,
				isBroadcast: false,
			})),
		});

		return { success: true, count: recipients.length };
	} catch (error) {
		console.error("Error notifying admins:", error);
		return { success: false, error: "Failed to notify admins" };
	}
}

export async function createNotification(
	userId: string,
	title: string,
	message: string,
	type: NotificationType,
) {
	try {
		await prisma.notification.create({
			data: {
				userId,
				title,
				message,
				type,
				isBroadcast: false,
			} as any,
		});
		return { success: true };
	} catch (error) {
		console.error("Error creating notification:", error);
		return { success: false, error: "Failed to create notification" };
	}
}

// Admin panel (/admin/notifikasi) entry point for sending to one user.
// createNotification itself stays unguarded for server-side callers (cron,
// other actions) and must not be imported by client components.
export async function sendNotificationToUser(
	userId: string,
	title: string,
	message: string,
	type: NotificationType,
) {
	if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
	return createNotification(userId, title, message, type);
}

export async function broadcastNotification(
	title: string,
	message: string,
	type: NotificationType,
) {
	if (!(await isAdmin())) return { success: false, error: "Unauthorized" };
	try {
		const users = await prisma.user.findMany({ select: { id: true } });

		if (users.length > 0) {
			await prisma.notification.createMany({
				data: users.map((user) => ({
					userId: user.id,
					title,
					message,
					type,
					isBroadcast: true,
				})) as any,
			});
		}

		return { success: true, count: users.length };
	} catch (error) {
		console.error("Error broadcasting notification:", error);
		return { success: false, error: "Failed to broadcast notification" };
	}
}

export async function markAsRead(id: string) {
	try {
		const userId = await sessionUserId();
		if (!userId) return { success: false };
		await prisma.notification.updateMany({
			where: { id, userId },
			data: { isRead: true },
		});
		return { success: true };
	} catch (error) {
		console.error("Error marking notification as read:", error);
		return { success: false };
	}
}

export async function markAllAsRead(
	type?: NotificationType | NotificationType[],
) {
	try {
		const userId = await sessionUserId();
		if (!userId) return { success: false };
		const typeFilter = type
			? Array.isArray(type)
				? { in: type }
				: type
			: undefined;
		await prisma.notification.updateMany({
			where: { userId, isRead: false, ...(typeFilter ? { type: typeFilter } : {}) },
			data: { isRead: true },
		});
		return { success: true };
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		return { success: false };
	}
}

export async function deleteNotification(id: string) {
	if (!(await isAdmin())) return { success: false };
	try {
		await prisma.notification.delete({
			where: { id },
		});
		revalidatePath("/admin/notifikasi");
		return { success: true };
	} catch (error) {
		return { success: false };
	}
}

export async function getAllNotifications(page = 1, limit = 10) {
	if (!(await isAdmin())) return { notifications: [], total: 0, totalPages: 0 };
	try {
		const [notifications, total] = await Promise.all([
			prisma.notification.findMany({
				skip: (page - 1) * limit,
				take: limit,
				orderBy: { createdAt: "desc" },
				include: { user: { select: { name: true, email: true } } },
			}),
			prisma.notification.count(),
		]);
		return { notifications, total, totalPages: Math.ceil(total / limit) };
	} catch (error) {
		console.error("Error fetching all notifications:", error);
		return { notifications: [], total: 0, totalPages: 0 };
	}
}
