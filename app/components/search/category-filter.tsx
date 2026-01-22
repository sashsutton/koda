"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";

const CATEGORIES = [
    "Tous",
    "n8n",
    "Make",
    "Zapier",
    "AI"
];

export function CategoryFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // On récupère la catégorie active (ou "Tous" par défaut)
    const activeCategory = searchParams.get("category") || "Tous";

    const handleSelect = (category: string) => {
        // On crée une copie des paramètres actuels pour ne pas perdre la recherche (q=...)
        const params = new URLSearchParams(searchParams.toString());

        if (category === "Tous") {
            params.delete("category"); // On retire le filtre
        } else {
            params.set("category", category); // On ajoute le filtre
        }


        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar w-full justify-center">
            {CATEGORIES.map((cat) => (
                <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    onClick={() => handleSelect(cat)}
                    className={cn(
                        "rounded-full text-sm font-medium transition-all",
                        activeCategory === cat
                            ? "bg-primary hover:bg-primary/90 shadow-md"
                            : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-transparent hover:border-border"
                    )}
                    size="sm"
                >
                    {cat}
                </Button>
            ))}
        </div>
    );
}