"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Search, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";

const PLATFORMS = [
    { value: "all", label: "Toutes les plateformes" },
    { value: "n8n", label: "n8n" },
    { value: "Make", label: "Make" },
    { value: "Zapier", label: "Zapier" },
    { value: "Python", label: "Python" },
    { value: "Other", label: "Autre" },
];

const CATEGORIES = [
    { value: "all", label: "Toutes catégories" },
    { value: "Social Media", label: "Social Media" },
    { value: "Email Marketing", label: "Email Marketing" },
    { value: "Productivity", label: "Productivity" },
    { value: "Sales", label: "Sales" },
    { value: "Other", label: "Autre" },
];

interface SearchBarProps {
    sellers?: { value: string; label: string }[];
}

export function SearchBar({ sellers = [] }: SearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [platform, setPlatform] = useState(searchParams.get("platform") || "all");
    const [category, setCategory] = useState(searchParams.get("category") || "all");
    const [seller, setSeller] = useState(searchParams.get("seller") || "all");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        const params = new URLSearchParams();

        if (query.trim()) params.set("q", query);
        if (platform !== "all") params.set("platform", platform);
        if (category !== "all") params.set("category", category);
        if (seller !== "all") params.set("seller", seller);

        const queryString = params.toString();
        router.push(queryString ? `/?${queryString}` : "/");
    };

    const clearFilters = () => {
        setQuery("");
        setPlatform("all");
        setCategory("all");
        setSeller("all");
        router.push("/");
    };

    const hasActiveFilters = query || platform !== "all" || category !== "all" || seller !== "all";

    // Appliquer les filtres quand ils changent
    useEffect(() => {
        applyFilters();
    }, [platform, category, seller]);

    return (
        <div className="w-full max-w-4xl space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher une automatisation..."
                        className="pl-10 bg-background/50 border-muted-foreground/20"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                {/* Platform Filter */}
                <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Plateforme" />
                    </SelectTrigger>
                    <SelectContent>
                        {PLATFORMS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                                {p.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Category Filter */}
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                                {c.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Seller Filter - Only show if there are sellers */}
                {sellers.length > 0 && (
                    <Select value={seller} onValueChange={setSeller}>
                        <SelectTrigger className="w-full md:w-[200px]">
                            <SelectValue placeholder="Vendeur" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les vendeurs</SelectItem>
                            {sellers.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Button type="submit" className="md:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                </Button>
            </form>

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Filtres actifs :</span>
                    {query && (
                        <Badge variant="secondary" className="gap-1">
                            Recherche: {query}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => setQuery("")} />
                        </Badge>
                    )}
                    {platform !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            {PLATFORMS.find((p) => p.value === platform)?.label}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => setPlatform("all")} />
                        </Badge>
                    )}
                    {category !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            {CATEGORIES.find((c) => c.value === category)?.label}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => setCategory("all")} />
                        </Badge>
                    )}
                    {seller !== "all" && (
                        <Badge variant="secondary" className="gap-1">
                            Vendeur: {sellers.find((s) => s.value === seller)?.label || "Inconnu"}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => setSeller("all")} />
                        </Badge>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                        Tout effacer
                    </Button>
                </div>
            )}
        </div>
    );
}