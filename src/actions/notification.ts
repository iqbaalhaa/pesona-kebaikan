"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AdminPermission, NotificationType } from "@prisma/client";

export async function getNotifications(
	userId: string,
	type?: NotificationType | NotificationType[],
	limit = 20,
) {
	try {
		const typeFilter = type
			? Array.isArray(type)
				? { in: type }
				: type
			: undefined;
		const where: any = { userId };
		if (typeFilter) where.type = typeFilter;

		const notifications = await prisma.notification.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: limit,
		});

		// Scoped to the same type filter — otherwise a caller asking only for
		// admin-alert types would get back an unread count polluted by the
		// user's regular KABAR/PESAN notifications (and vice versa).
		const unreadCount = await prisma.notification.count({
			where: { userId, isRead: false, ...(typeFilter ? { type: typeFilter } : {}) },
		});

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

export async function broadcastNotification(
	title: string,
	message: string,
	type: NotificationType,
) {
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
		await prisma.notification.update({
			where: { id },
			data: { isRead: true },
		});
		return { success: true };
	} catch (error) {
		console.error("Error marking notification as read:", error);
		return { success: false };
	}
}

export async function markAllAsRead(
	userId: string,
	type?: NotificationType | NotificationType[],
) {
	try {
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
