import { FeedbackForm } from "@/app/components/forms/feedback-form";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function FeedbackPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 bg-muted/10">
            <div className="w-full">
                <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin" /></div>}>
                    <FeedbackForm />
                </Suspense>
            </div>
        </div>
    );
}