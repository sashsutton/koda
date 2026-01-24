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
        // messageKey can be a simple string or a key in Notifications
        try {
            toast.success(tNotif(messageKey, params));
        } catch {
            toast.success(messageKey); // Fallback to raw string
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
