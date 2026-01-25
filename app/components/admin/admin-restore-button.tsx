"use client";

import { fullSyncWithClerk } from "@/app/actions/admin";
import { ConfirmButton } from "@/app/components/ui/confirm-button";
import { RefreshCw } from "lucide-react";
import { useLocalizedToast } from "@/hooks/use-localized-toast";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function AdminRestoreButton() {
    const tAdmin = useTranslations('Admin');
    const { showSuccess, showError, showLoading, dismiss } = useLocalizedToast();
    const [loading, setLoading] = useState(false);

    const handleSync = async () => {
        setLoading(true);
        const toastId = showLoading(tAdmin('sync.loading'));
        try {
            const result = await fullSyncWithClerk();
            showSuccess("syncResult", { synced: result.count, deleted: result.deleted });
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
            confirmMessage={tAdmin('sync.confirm')}
            onClick={handleSync}
            disabled={loading}
        >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {tAdmin('sync.button')}
        </ConfirmButton>
    );
}
