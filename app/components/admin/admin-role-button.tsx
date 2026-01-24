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

    const handleToggle = async () => {
        setIsLoading(true);
        const newRole = role === 'admin' ? 'user' : 'admin';
        try {
            await updateUserRole(userId, newRole);
            setRole(newRole);
            showSuccess(`Role updated to ${newRole}`);
        } catch (error: any) {
            showError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon-sm"
            disabled={isLoading}
            onClick={handleToggle}
            title={`Switch to ${role === 'admin' ? 'User' : 'Admin'}`}
        >
            <UserCog className="h-4 w-4" />
            {role === 'admin' ? "Demote" : "Promote"}
        </Button>
    );
}
