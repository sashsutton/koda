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
    role?: string;
}

export function AdminBanButton({ userId, initialIsBanned, role }: AdminBanButtonProps) {
    const { showSuccess, showError } = useLocalizedToast();
    const [isBanned, setIsBanned] = useState(initialIsBanned);
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations('Admin');

    const isAdmin = role === 'admin';

    const handleToggle = async () => {
        if (isAdmin) return;
        setIsLoading(true);
        try {
            const result = await toggleBanUser(userId);
            setIsBanned(result.isBanned);
            showSuccess(result.isBanned ? "userBanned" : "userUnbanned");
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
            className={`flex items-center gap-1 ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading || isAdmin}
            confirmMessage={isBanned ? t('usersTable.unbanConfirm') : t('usersTable.banConfirm')}
            onClick={handleToggle}
        >
            <div className="flex items-center gap-2">
                {isBanned ? (
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                    <Ban className="h-4 w-4 text-destructive" />
                )}
                {isBanned ? t('usersTable.unbanLabel') : t('usersTable.banLabel')}
            </div>
        </ConfirmButton>
    );
}
