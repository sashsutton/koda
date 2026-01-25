"use client";

import { deleteUser } from "@/app/actions/admin";
import { ConfirmButton } from "@/app/components/ui/confirm-button";
import { Trash2 } from "lucide-react";
import { useLocalizedToast } from "@/hooks/use-localized-toast";
import { useState } from "react";

import { useTranslations } from "next-intl";

interface AdminDeleteButtonProps {
    userId: string;
}

export function AdminDeleteButton({ userId }: AdminDeleteButtonProps) {
    const tAdmin = useTranslations('Admin');
    const { showSuccess, showError, showLoading, dismiss } = useLocalizedToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        const toastId = showLoading(tAdmin('delete.loading'));
        try {
            await deleteUser(userId);
            showSuccess("userDeleted");
        } catch (error: any) {
            showError(error);
        } finally {
            setIsLoading(false);
            dismiss(toastId);
        }
    };

    return (
        <ConfirmButton
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive transition-colors"
            disabled={isLoading}
            confirmMessage={tAdmin('delete.confirm')}
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4" />
        </ConfirmButton>
    );
}
