'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { NotificationType } from '@prisma/client';

export async function getNotifications(userId: string, type?: NotificationType, limit = 20) {
  try {
    const where: any = { userId };
    if (type) where.type = type;

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    
    const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false }
    });

    return { notifications, unreadCount };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function createNotification(userId: string, title: string, message: string, type: NotificationType) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
            },
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: 'Failed to create notification' };
    }
}

export async function broadcastNotification(title: string, message: string, type: NotificationType) {
    try {
        const users = await prisma.user.findMany({ select: { id: true } });
        
        if (users.length > 0) {
            await prisma.notification.createMany({
                data: users.map(user => ({
                    userId: user.id,
                    title,
                    message,
                    type,
                })),
            });
        }
        
        return { success: true, count: users.length };
    } catch (error) {
        console.error('Error broadcasting notification:', error);
        return { success: false, error: 'Failed to broadcast notification' };
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
         console.error('Error marking notification as read:', error);
        return { success: false };
    }
}

export async function markAllAsRead(userId: string) {
    try {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { success: true };
    } catch (error) {
         console.error('Error marking all notifications as read:', error);
        return { success: false };
    }
}

export async function deleteNotification(id: string) {
    try {
        await prisma.notification.delete({
            where: { id },
        });
        revalidatePath('/admin/notifikasi');
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
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.notification.count(),
    ]);
    return { notifications, total, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    return { notifications: [], total: 0, totalPages: 0 };
  }
}
