"use client";

import { useState } from "react";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Mail, Bell } from "lucide-react";

interface EmailComposerProps {
    onContentChange: (data: {
        subject: string;
        htmlContent: string;
        notificationTitle: string;
        notificationMessage: string;
        sendEmail: boolean;
        sendNotification: boolean;
    }) => void;
}

export default function EmailComposer({ onContentChange }: EmailComposerProps) {
    const [subject, setSubject] = useState("");
    const [htmlContent, setHtmlContent] = useState("");
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationMessage, setNotificationMessage] = useState("");
    const [sendEmail, setSendEmail] = useState(true);
    const [sendNotification, setSendNotification] = useState(true);

    const handleUpdate = () => {
        onContentChange({
            subject,
            htmlContent,
            notificationTitle,
            notificationMessage,
            sendEmail,
            sendNotification
        });
    };

    return (
        <div className="space-y-6 p-4 border rounded-lg bg-card">
            {/* Email Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="sendEmail"
                        checked={sendEmail}
                        onChange={(e) => {
                            setSendEmail(e.target.checked);
                            handleUpdate();
                        }}
                        className="w-4 h-4"
                    />
                    <Mail className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">Email Campaign</h3>
                </div>

                {sendEmail && (
                    <div className="space-y-4 pl-6">
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <input
                                id="subject"
                                type="text"
                                className="w-full px-3 py-2 border rounded-md bg-background"
                                placeholder="Enter email subject"
                                value={subject}
                                onChange={(e) => {
                                    setSubject(e.target.value);
                                    handleUpdate();
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="htmlContent">Email Content (HTML)</Label>
                            <Textarea
                                id="htmlContent"
                                rows={8}
                                className="font-mono text-sm"
                                placeholder="<h1>Hello!</h1><p>Your message here...</p>"
                                value={htmlContent}
                                onChange={(e) => {
                                    setHtmlContent(e.target.value);
                                    handleUpdate();
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Tip: Use HTML tags for formatting. Keep it simple for better deliverability.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Notification Section */}
            <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="sendNotification"
                        checked={sendNotification}
                        onChange={(e) => {
                            setSendNotification(e.target.checked);
                            handleUpdate();
                        }}
                        className="w-4 h-4"
                    />
                    <Bell className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">In-App Notification</h3>
                </div>

                {sendNotification && (
                    <div className="space-y-4 pl-6">
                        <div className="space-y-2">
                            <Label htmlFor="notifTitle">Notification Title</Label>
                            <input
                                id="notifTitle"
                                type="text"
                                className="w-full px-3 py-2 border rounded-md bg-background"
                                placeholder="Short notification title"
                                value={notificationTitle}
                                onChange={(e) => {
                                    setNotificationTitle(e.target.value);
                                    handleUpdate();
                                }}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notifMessage">Notification Message</Label>
                            <Textarea
                                id="notifMessage"
                                rows={3}
                                placeholder="Brief message for notification"
                                value={notificationMessage}
                                onChange={(e) => {
                                    setNotificationMessage(e.target.value);
                                    handleUpdate();
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                This will appear in the notification bell. Keep it concise.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
