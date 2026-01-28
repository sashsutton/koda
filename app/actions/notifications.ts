"use server";

import { connectToDatabase } from "@/lib/db";
import Notification from "@/models/Notification";
import { requireAuth } from "@/lib/auth-utils";
import { auth } from "@clerk/nextjs/server";

export interface INotificationData {
    _id: string;
    type: 'MESSAGE' | 'SALE' | 'ORDER' | 'REVIEW' | 'SYSTEM';
    title: string;
    message: string;
    titleKey?: string;
    messageKey?: string;
    params?: Record<string, string | number>;
    link: string;
    read: boolean;
    createdAt: string;
}

/**
 * Fetch notifications for the current user
 * Returns empty array if not authenticated (poll-safe)
 */
export async function getNotifications(limit = 10): Promise<INotificationData[]> {
    // Soft check prevents redirect loop during polling
    const { userId } = await auth();
    if (!userId) return [];

    await connectToDatabase();

    const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return notifications.map((n: any) => ({
        _id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        titleKey: n.titleKey,
        messageKey: n.messageKey,
        params: n.params,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString()
    }));
}

/**
 * Get unread notification count
 * Returns 0 if not authenticated (poll-safe)
 */
export async function getUnreadNotificationCount(): Promise<number> {
    // Soft check prevents redirect loop during polling
    const { userId } = await auth();
    if (!userId) return 0;

    await connectToDatabase();

    const count = await Notification.countDocuments({
        userId,
        read: false
    });

    return count;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
    const userId = await requireAuth();
    await connectToDatabase();

    await Notification.updateOne(
        { _id: notificationId, userId },
        { $set: { read: true } }
    );
    return { success: true };
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
    const userId = await requireAuth();
    await connectToDatabase();

    await Notification.updateMany(
        { userId, read: false },
        { $set: { read: true } }
    );
    return { success: true };
}

/**
 * INTERNAL USE ONLY: Create a notification (server-side only)
 * Does NOT require auth check as it's called by other server actions/webhooks
 */
export async function createNotification(
    userId: string,
    type: 'MESSAGE' | 'SALE' | 'ORDER' | 'REVIEW' | 'SYSTEM',
    title: string,
    message: string,
    link: string,
    titleKey?: string,
    messageKey?: string,
    params?: Record<string, string | number>
) {
    await connectToDatabase();

    try {
        await Notification.create({
            userId,
            type,
            title,
            message,
            link,
            titleKey,
            messageKey,
            params,
            read: false,
            createdAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to create notification:", error);
        return { success: false, error };
    }
}

/**
 * Delete a single notification
 */
export async function deleteNotification(notificationId: string) {
    const userId = await requireAuth();
    await connectToDatabase();

    await Notification.deleteOne({ _id: notificationId, userId });
    return { success: true };
}

/**
 * Delete all notifications for the current user
 */
export async function deleteAllNotifications() {
    const userId = await requireAuth();
    await connectToDatabase();

    await Notification.deleteMany({ userId });
    return { success: true };
}
