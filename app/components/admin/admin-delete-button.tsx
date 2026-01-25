"use client";

import { deleteUser } from "@/app/actions/admin";
import { ConfirmButton } from "@/app/components/ui/confirm-button";
import { Trash2 } from "lucide-react";
import { useLocalizedToast } from "@/hooks/use-localized-toast";
import { useState } from "react";

interface AdminDeleteButtonProps {
    userId: string;
}

export function AdminDeleteButton({ userId }: AdminDeleteButtonProps) {
    const { showSuccess, showError, showLoading, dismiss } = useLocalizedToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        const toastId = showLoading("Suppression nucléaire en cours (Clerk + Stripe + DB)...");
        try {
            await deleteUser(userId);
            showSuccess("L'utilisateur et toutes ses données ont été supprimés.");
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
            confirmMessage="ATTENTION : Cela supprimera définitivement le compte Clerk, le compte Stripe Connect, tous les produits et tout l'historique de cet utilisateur. Cette action est irréversible. Continuer ?"
            onClick={handleDelete}
        >
            <Trash2 className="h-4 w-4" />
        </ConfirmButton>
    );
}
