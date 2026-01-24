"use client";

import { toggleBanUser } from "@/app/actions/admin";
import { ConfirmButton } from "@/app/components/ui/confirm-button";
import { UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorKey } from "@/lib/error-translator";

interface AdminBanButtonProps {
    userId: string;
    isBanned: boolean;
}

export function AdminBanButton({ userId, isBanned }: AdminBanButtonProps) {
    const tErr = useTranslations('Errors');
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const result = await toggleBanUser(userId);
            if (result.success) {
                toast.success(result.isBanned ? "User banned successfully" : "User unbanned successfully");
            }
        } catch (err: any) {
            const errorKey = getErrorKey(err.message);
            toast.error(tErr(errorKey));
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
            {isBanned ? (
                <>
                    <UserCheck className="h-3 w-3" />
                    Unban
                </>
            ) : (
                <>
                    <UserX className="h-3 w-3" />
                    Ban
                </>
            )}
        </ConfirmButton>
    );
}
