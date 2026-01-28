"use server";

import { requireAdmin } from "@/lib/admin-utils";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { resend } from "@/lib/resend";
import { createNotification } from "./notifications";

/**
 * Send bulk emails to selected users (admin only)
 */
export async function sendBulkEmail(
    userIds: string[],
    subject: string,
    htmlContent: string
): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    await requireAdmin();
    await connectToDatabase();

    if (userIds.length === 0) {
        throw new Error("No users selected");
    }

    // Get users with emails
    const users = await User.find({
        clerkId: { $in: userIds },
        email: { $exists: true, $ne: null }
    }).select('email clerkId');

    const BATCH_SIZE = 50; // Resend rate limit safety
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send in batches
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE);

        const results = await Promise.allSettled(
            batch.map(user =>
                resend.emails.send({
                    from: 'Koda Market <noreply@resend.dev>', // TODO: Change after domain verification
                    to: user.email!,
                    subject,
                    html: htmlContent
                })
            )
        );

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                sent++;
            } else {
                failed++;
                errors.push(`Failed to send to ${batch[index].email}: ${result.reason}`);
            }
        });

        // Rate limiting: wait 1 second between batches
        if (i + BATCH_SIZE < users.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log(`[ADMIN] Bulk email sent: ${sent} success, ${failed} failed`);

    return { success: true, sent, failed, errors };
}

/**
 * Send bulk in-app notifications to selected users (admin only)
 */
export async function sendBulkNotification(
    userIds: string[],
    title: string,
    message: string,
    link?: string
): Promise<{ success: boolean; sent: number }> {
    await requireAdmin();

    if (userIds.length === 0) {
        throw new Error("No users selected");
    }

    // Create notifications for all users
    const results = await Promise.allSettled(
        userIds.map(userId =>
            createNotification(
                userId,
                'SYSTEM',
                title,
                message,
                link || '/dashboard',
                'notifications.systemTitle',
                'notifications.systemBody',
                { title, message }
            )
        )
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;

    console.log(`[ADMIN] Bulk notification sent to ${sent}/${userIds.length} users`);

    return { success: true, sent };
}

/**
 * Send both email and notification to selected users (admin only)
 */
export async function sendBulkCampaign(
    userIds: string[],
    subject: string,
    htmlContent: string,
    notificationTitle: string,
    notificationMessage: string,
    notificationLink?: string
): Promise<{
    success: boolean;
    emailsSent: number;
    emailsFailed: number;
    notificationsSent: number;
    errors: string[];
}> {
    await requireAdmin();

    // Send emails
    const emailResult = await sendBulkEmail(userIds, subject, htmlContent);

    // Send notifications
    const notificationResult = await sendBulkNotification(
        userIds,
        notificationTitle,
        notificationMessage,
        notificationLink
    );

    return {
        success: true,
        emailsSent: emailResult.sent,
        emailsFailed: emailResult.failed,
        notificationsSent: notificationResult.sent,
        errors: emailResult.errors
    };
}
