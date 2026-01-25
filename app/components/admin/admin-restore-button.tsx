"use client";

import { fullSyncWithClerk } from "@/app/actions/admin";
import { ConfirmButton } from "@/app/components/ui/confirm-button";
import { RefreshCw } from "lucide-react";
import { useLocalizedToast } from "@/hooks/use-localized-toast";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function AdminRestoreButton() {
    const { showSuccess, showError, showLoading, dismiss } = useLocalizedToast();
    const [loading, setLoading] = useState(false);

    const handleSync = async () => {
        setLoading(true);
        const toastId = showLoading("Synchronisation complète en cours...");
        try {
            const result = await fullSyncWithClerk();
            showSuccess(`${result.count} synchronisés, ${result.deleted} supprimés (orphelins).`);
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
            confirmMessage="Cela synchronisera TOUS les utilisateurs avec Clerk et SUPPRIMERA les utilisateurs locaux qui n'existent plus sur Clerk. Continuer ?"
            onClick={handleSync}
            disabled={loading}
        >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Full Database Sync
        </ConfirmButton>
    );
}
