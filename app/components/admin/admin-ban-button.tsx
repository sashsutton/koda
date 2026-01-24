"use client";

import { toggleBanUser } from "@/app/actions/admin";
import { ConfirmButton } from "@/app/components/ui/confirm-button";
import { Ban, ShieldCheck } from "lucide-react";
import { useLocalizedToast } from "@/hooks/use-localized-toast";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface AdminBanButtonProps {
    userId: string;
    initialIsBanned: boolean;
}

export function AdminBanButton({ userId, initialIsBanned }: AdminBanButtonProps) {
    const { showSuccess, showError } = useLocalizedToast();
    const [isBanned, setIsBanned] = useState(initialIsBanned);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const result = await toggleBanUser(userId);
            setIsBanned(result.isBanned);
            showSuccess(result.isBanned ? "User banned" : "User unbanned");
        } catch (error: any) {
            showError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ConfirmButton
            variant={isBanned ? "outline" : "destructive"}
            size="sm"
            className="flex items-center gap-1"
            disabled={isLoading}
            confirmMessage={isBanned ? "Do you want to unban this user?" : "Do you really want to ban this user?"}
            onClick={handleToggle}
        >
            <div className="flex items-center gap-2">
                {isBanned ? (
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                    <Ban className="h-4 w-4 text-destructive" />
                )}
                {isBanned ? "Unban User" : "Ban User"}
            </div>
        </ConfirmButton>
    );
}
