"use client";

import { restoreAllUsersFromClerk } from "@/app/actions/admin";
import { ConfirmButton } from "@/app/components/ui/confirm-button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useLocalizedToast } from "@/hooks/use-localized-toast";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorKey } from "@/lib/error-translator";

export function AdminRestoreButton() {
    const tErr = useTranslations('Errors');
    const { showSuccess, showError, showLoading, dismiss } = useLocalizedToast();
    const [loading, setLoading] = useState(false);

    const handleRestore = async () => {
        if (!confirm("Voulez-vous vraiment synchroniser tous les utilisateurs depuis Clerk ?")) return;
        setLoading(true);
        const toastId = showLoading("Synchronisation en cours...");
        try {
            const result = await restoreAllUsersFromClerk();
            showSuccess(`${result.count} utilisateurs synchronisés.`);
        } catch (error: any) {
            showError(error);
        } finally {
            setLoading(false);
            dismiss(toastId);
        }
    };

    return (
        <ConfirmButton
            variant="outline"
            confirmMessage="Voulez-vous vraiment synchroniser tous les utilisateurs depuis Clerk ?"
            onClick={handleRestore}
            disabled={loading}
        >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Sync all from Clerk
        </ConfirmButton>
    );
}
