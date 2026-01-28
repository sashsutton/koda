"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getErrorKey } from "@/lib/error-translator";

/**
 * Hook to handle localized toasts (success, error, info) consistently.
 * Uses the 'Errors' and 'Notifications' namespaces from localization files.
 */
export function useLocalizedToast() {
    const tErr = useTranslations("Errors");
    const tNotif = useTranslations("Notifications");

    const showSuccess = (messageKey: string, params?: any) => {
        // Check if input is a raw sentence (contains spaces/punctuation)
        if (messageKey.includes(' ') || messageKey.endsWith('!') || messageKey.endsWith('.')) {
            toast.success(messageKey);
            return;
        }

        try {
            toast.success(tNotif(messageKey, params));
        } catch {
            toast.success(messageKey);
        }
    };

    const showError = (error: any) => {
        const message = typeof error === "string" ? error : error?.message || "An error occurred";
        const errorKey = getErrorKey(message);
        toast.error(tErr(errorKey));
    };

    const showInfo = (messageKey: string, params?: any) => {
        try {
            toast.info(tNotif(messageKey, params));
        } catch {
            toast.info(messageKey);
        }
    };

    const showLoading = (message: string) => {
        return toast.loading(message);
    };

    return {
        showSuccess,
        showError,
        showInfo,
        showLoading,
        dismiss: toast.dismiss,
    };
}
