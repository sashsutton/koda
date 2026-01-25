"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { getStripeLoginLink, getStripeOnboardingLink } from "@/app/actions/stripe-connect";
import { useLocalizedToast } from "@/hooks/use-localized-toast";
import { Loader2 } from "lucide-react";

export function StripeDashboardButton() {
    const [isLoading, setIsLoading] = useState(false);
    const { showError } = useLocalizedToast();

    const handleClick = async () => {
        setIsLoading(true);
        try {
            const url = await getStripeLoginLink();
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (error) {
            showError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isLoading}
            className="w-full"
        >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Voir mon Dashboard Stripe
        </Button>
    );
}

export function StripeOnboardingButton() {
    const [isLoading, setIsLoading] = useState(false);
    const { showError } = useLocalizedToast();

    const handleClick = async () => {
        setIsLoading(true);
        try {
            const url = await getStripeOnboardingLink();
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (error) {
            showError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading}
            className="w-full"
        >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Configurer mes paiements
        </Button>
    );
}
