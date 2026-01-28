"use client";

import { useState } from "react";
import { FilteredUser } from "@/app/actions/admin-users";
import { sendBulkCampaign, sendBulkEmail, sendBulkNotification } from "@/app/actions/admin-email";
import UserFilterPanel from "@/app/components/admin/UserFilterPanel";
import EmailComposer from "@/app/components/admin/EmailComposer";
import { Button } from "@/app/components/ui/button";
import { Send, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "@/i18n/routing";

export default function AdminMarketingPage() {
    const router = useRouter();
    const [selectedUsers, setSelectedUsers] = useState<FilteredUser[]>([]);
    const [userCount, setUserCount] = useState(0);
    const [campaignData, setCampaignData] = useState({
        subject: "",
        htmlContent: "",
        notificationTitle: "",
        notificationMessage: "",
        sendEmail: true,
        sendNotification: true
    });
    const [isSending, setIsSending] = useState(false);
    const [sendResult, setSendResult] = useState<{
        success: boolean;
        emailsSent?: number;
        emailsFailed?: number;
        notificationsSent?: number;
        errors?: string[];
    } | null>(null);

    const handleSend = async () => {
        if (selectedUsers.length === 0) {
            alert("Please select users first by applying filters");
            return;
        }

        if (!campaignData.sendEmail && !campaignData.sendNotification) {
            alert("Please select at least one sending method (Email or Notification)");
            return;
        }

        if (campaignData.sendEmail && (!campaignData.subject || !campaignData.htmlContent)) {
            alert("Please fill in email subject and content");
            return;
        }

        if (campaignData.sendNotification && (!campaignData.notificationTitle || !campaignData.notificationMessage)) {
            alert("Please fill in notification title and message");
            return;
        }

        const confirmed = confirm(
            `Are you sure you want to send to ${selectedUsers.length} users?\n\n` +
            `${campaignData.sendEmail ? '✅ Email\n' : ''}` +
            `${campaignData.sendNotification ? '✅ Notification\n' : ''}`
        );

        if (!confirmed) return;

        setIsSending(true);
        setSendResult(null);

        try {
            const userIds = selectedUsers.map(u => u.clerkId);

            if (campaignData.sendEmail && campaignData.sendNotification) {
                // Send both
                const result = await sendBulkCampaign(
                    userIds,
                    campaignData.subject,
                    campaignData.htmlContent,
                    campaignData.notificationTitle,
                    campaignData.notificationMessage,
                    '/dashboard'
                );
                setSendResult(result);
            } else if (campaignData.sendEmail) {
                // Email only
                const result = await sendBulkEmail(
                    userIds,
                    campaignData.subject,
                    campaignData.htmlContent
                );
                setSendResult({
                    success: true,
                    emailsSent: result.sent,
                    emailsFailed: result.failed,
                    errors: result.errors
                });
            } else {
                // Notification only
                const result = await sendBulkNotification(
                    userIds,
                    campaignData.notificationTitle,
                    campaignData.notificationMessage,
                    '/dashboard'
                );
                setSendResult({
                    success: true,
                    notificationsSent: result.sent
                });
            }
        } catch (error: any) {
            alert(error.message || "Failed to send campaign");
            if (error.message?.includes("Unauthorized")) {
                router.push("/");
            }
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Email Marketing & Notifications</h1>
                    <p className="text-muted-foreground">
                        Send bulk emails and notifications to your users
                    </p>
                </div>

                {/* User Filter Panel */}
                <UserFilterPanel
                    onUsersSelected={setSelectedUsers}
                    onCountUpdate={setUserCount}
                />

                {/* Email Composer */}
                <EmailComposer onContentChange={setCampaignData} />

                {/* Send Button */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                    <div className="text-sm text-muted-foreground">
                        {selectedUsers.length > 0 ? (
                            <span className="font-medium text-foreground">
                                Ready to send to {selectedUsers.length} users
                            </span>
                        ) : (
                            <span>Apply filters to select users</span>
                        )}
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={isSending || selectedUsers.length === 0}
                        size="lg"
                        className="gap-2"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Send to {selectedUsers.length} users
                            </>
                        )}
                    </Button>
                </div>

                {/* Send Result */}
                {sendResult && (
                    <div className={`p-4 border rounded-lg ${sendResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start gap-3">
                            {sendResult.success ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold mb-2">
                                    {sendResult.success ? 'Campaign Sent Successfully!' : 'Campaign Failed'}
                                </h3>
                                <ul className="text-sm space-y-1">
                                    {sendResult.emailsSent !== undefined && (
                                        <li>✉️ Emails sent: {sendResult.emailsSent}</li>
                                    )}
                                    {sendResult.emailsFailed !== undefined && sendResult.emailsFailed > 0 && (
                                        <li className="text-red-600">❌ Emails failed: {sendResult.emailsFailed}</li>
                                    )}
                                    {sendResult.notificationsSent !== undefined && (
                                        <li>🔔 Notifications sent: {sendResult.notificationsSent}</li>
                                    )}
                                </ul>
                                {sendResult.errors && sendResult.errors.length > 0 && (
                                    <details className="mt-2">
                                        <summary className="text-sm text-red-600 cursor-pointer">
                                            View errors ({sendResult.errors.length})
                                        </summary>
                                        <ul className="mt-2 text-xs space-y-1 text-red-600">
                                            {sendResult.errors.slice(0, 5).map((error, i) => (
                                                <li key={i}>{error}</li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
