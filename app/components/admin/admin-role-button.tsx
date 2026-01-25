"use client";

import { updateUserRole } from "@/app/actions/admin";
import { Button } from "@/app/components/ui/button";
import { Shield, UserCog, Loader2 } from "lucide-react";
import { useLocalizedToast } from "@/hooks/use-localized-toast";
import { useState } from "react";
import { useTranslations } from "next-intl"; // Keep useTranslations for other potential uses, though tErr is removed.
import { getErrorKey } from "@/lib/error-translator"; // Keep getErrorKey for other potential uses, though it's not directly used in the catch block anymore.

interface AdminRoleButtonProps {
    userId: string;
    initialRole: string;
}

export function AdminRoleButton({ userId, initialRole }: AdminRoleButtonProps) {
    const { showSuccess, showError } = useLocalizedToast();
    const [role, setRole] = useState(initialRole);
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations('Admin');

    const handleToggle = async () => {
        setIsLoading(true);
        const newRole = role === 'admin' ? 'user' : 'admin';
        try {
            await updateUserRole(userId, newRole);
            setRole(newRole);
            showSuccess("roleUpdated", { role: newRole });
        } catch (error: any) {
            showError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={handleToggle}
            className="flex items-center gap-2"
        >
            <UserCog className="h-4 w-4" />
            <span>{role === 'admin' ? t('usersTable.demoteLabel') : t('usersTable.promoteLabel')}</span>
        </Button>
    );
}
