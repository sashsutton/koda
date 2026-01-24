"use server";

import { z } from "zod";
import { resend } from "@/lib/resend";
import { requireUser } from "@/lib/auth-utils";

const feedbackSchema = z.object({
    type: z.enum(["bug", "contact", "feature"]),
    email: z.string().email({ message: "Invalid email" }),
    subject: z.string().min(5, { message: "Subject is too short" }),
    message: z.string().min(10, { message: "Your message is a bit too short..." }),
});

export type FeedbackState = {
    success?: boolean;
    errors?: {
        [K in keyof z.infer<typeof feedbackSchema>]?: string[];
    };
    message?: string;
};

export async function sendFeedbackAction(prevState: FeedbackState, formData: FormData): Promise<FeedbackState> {
    try {
        await requireUser();
    } catch (err: any) {
        return {
            success: false,
            message: err.message || "You must be logged in and not banned to send a message."
        };
    }

    // Data validation
    const validatedFields = feedbackSchema.safeParse({
        type: formData.get("type"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Please check the form fields.",
        };
    }

    const { type, email, subject, message } = validatedFields.data;

    try {
        // Send email via Resend
        await resend.emails.send({
            from: 'Koda Feedback <onboarding@resend.dev>',
            to: 'hello.kodateam@gmail.com',
            replyTo: email,
            subject: `[${type.toUpperCase()}] ${subject}`,
            html: `
        <h1>New message from Koda</h1>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>From:</strong> ${email}</p>
        <hr />
        <h3>Message:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      `
        });

        return {
            success: true,
            message: "Thank you! Your message has been received.",
        };

    } catch (error) {
        console.error("Resend send error:", error);
        return {
            success: false,
            message: "An error occurred while sending. Please try again later.",
        };
    }
}