"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { startConversation } from "@/app/actions/messaging";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { MessageSquare, Loader2, Send } from "lucide-react";
import { useLocalizedToast } from "@/hooks/use-localized-toast";
import { useTranslations } from "next-intl";

interface ContactSellerDialogProps {
    sellerId: string;
    sellerName: string;
    productTitle?: string;
    trigger?: React.ReactNode;
}

export default function ContactSellerDialog({ sellerId, sellerName, productTitle, trigger }: ContactSellerDialogProps) {
    const t = useTranslations('ContactSeller');
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const { userId } = useAuth();
    const { showSuccess, showError } = useLocalizedToast();
    const router = useRouter();

    const handleSendMessage = () => {
        if (!userId) {
            router.push("/sign-in");
            return;
        }

        if (userId === sellerId) {
            showError(t('cannotMessageSelf'));
            return;
        }

        if (!message.trim()) return;

        startTransition(async () => {
            try {
                const initialMessage = productTitle
                    ? `${t('regarding')}: "${productTitle}"\n\n${message}`
                    : message;

                await startConversation(sellerId, initialMessage);
                showSuccess(t('success'));
                setIsOpen(false);
                setMessage("");
            } catch (error: any) {
                if (error.message === "You cannot message yourself") {
                    showError(t('cannotMessageSelf'));
                } else {
                    showError(t('error'));
                }
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <MessageSquare className="w-4 h-4" />
                        {t('button')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('title', { name: sellerName })}</DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Textarea
                        placeholder={t('placeholder')}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        className="resize-none"
                    />
                </div>
                <DialogFooter>
                    <Button onClick={() => setIsOpen(false)} variant="ghost" disabled={isPending}>
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleSendMessage} disabled={!message.trim() || isPending}>
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        {t('send')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
