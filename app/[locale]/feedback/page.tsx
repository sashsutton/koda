import { FeedbackForm } from "@/app/components/forms/feedback-form";

export default function FeedbackPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-muted/10">
            <div className="w-full">
                <FeedbackForm />
            </div>
        </div>
    );
}