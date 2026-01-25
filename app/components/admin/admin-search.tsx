"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/app/components/ui/input";
import { Search, X } from "lucide-react";
import { useTranslations } from 'next-intl';

interface AdminSearchProps {
    type: 'users' | 'products';
}

export function AdminSearch({ type }: AdminSearchProps) {
    // Si vous n'avez pas encore les traductions pour 'AdminSearch', vous pouvez mettre des strings en dur ou utiliser 'Common'
    // const t = useTranslations('Admin'); 
    const router = useRouter();
    const searchParams = useSearchParams();

    // Clés distinctes pour ne pas écraser la recherche de l'autre onglet
    const paramKey = type === 'users' ? 'userQ' : 'productQ';
    const [query, setQuery] = useState(searchParams.get(paramKey) || "");

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (query) {
            params.set(paramKey, query);
        } else {
            params.delete(paramKey);
        }

        // Debounce de 300ms pour éviter de recharger la page à chaque frappe
        const timeoutId = setTimeout(() => {
            router.replace(`/admin?${params.toString()}`, { scroll: false });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, paramKey, router, searchParams]);

    return (
        <div className="relative w-full max-w-sm mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={type === 'users' ? "Rechercher (pseudo, email)..." : "Rechercher un produit..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
            />
            {query && (
                <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    type="button"
                >
                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
            )}
        </div>
    );
}