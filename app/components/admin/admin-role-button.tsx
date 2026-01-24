"use client";

import { updateUserRole } from "@/app/actions/admin";
import { Button } from "@/app/components/ui/button";
import { Shield, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorKey } from "@/lib/error-translator";

interface AdminRoleButtonProps {
    userId: string;
    currentRole: string;
}

export function AdminRoleButton({ userId, currentRole }: AdminRoleButtonProps) {
    const tErr = useTranslations('Errors');
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            const result = await updateUserRole(userId, newRole);
            if (result.success) {
                toast.success(`Role updated: ${newRole.toUpperCase()}`);
            }
        } catch (err: any) {
            const errorKey = getErrorKey(err.message);
            toast.error(tErr(errorKey));
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
            title="Change role"
        >
            {currentRole === 'admin' ? (
                <UserIcon className={`h-3 w-3 ${isLoading ? 'animate-pulse' : ''}`} />
            ) : (
                <Shield className={`h-3 w-3 ${isLoading ? 'animate-pulse' : ''}`} />
            )}
        </Button>
    );
}
