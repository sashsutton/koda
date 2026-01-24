"use client";

import { restoreAllUsersFromClerk } from "@/app/actions/admin";
import { ConfirmButton } from "@/app/components/ui/confirm-button";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { getErrorKey } from "@/lib/error-translator";

export function AdminRestoreButton() {
    const tErr = useTranslations('Errors');
    const [isPending, setIsPending] = useState(false);

    const handleRestore = async () => {
        setIsPending(true);
        const promise = restoreAllUsersFromClerk();

        toast.promise(promise, {
            loading: 'Synchronizing with Clerk...',
            success: (data) => `Synchronization complete! ${data.count} users synchronized.`,
            error: (err: any) => tErr(getErrorKey(err.message)),
        });

        try {
            await promise;
        } catch (err) {
            console.error(err);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <ConfirmButton
            variant="outline"
            className="flex items-center gap-2"
            confirmMessage="Do you want to synchronize all users from Clerk? This will create any missing accounts locally."
            onClick={handleRestore}
            disabled={isPending}
        >
            <RefreshCcw className={`h-4 w-4 ${isPending ? 'animate-spin' : ''}`} />
            Sync / Restore Clerk
        </ConfirmButton>
    );
}
