"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Slider } from "@/app/components/ui/slider";
import { Button } from "@/app/components/ui/button";

const PLATFORMS = ["n8n", "Make", "Zapier", "Python", "Other"];
const CATEGORIES = ["Social Media", "Email Marketing", "Productivity", "Sales", "Other"];

interface FiltersSidebarProps {
    initialPlatforms: string[];
    initialCategories: string[];
    initialMinPrice: number;
    initialMaxPrice: number;
}

export function FiltersSidebar({
    initialPlatforms,
    initialCategories,
    initialMinPrice,
    initialMaxPrice,
}: FiltersSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [platforms, setPlatforms] = useState<string[]>(initialPlatforms);
    const [categories, setCategories] = useState<string[]>(initialCategories);
    const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice, initialMaxPrice]);

    // Update local state when URL params change (e.g. back button)
    useEffect(() => {
        // Only update if the values are actually different to avoid loops if we were syncing strictly
        // But since we drive from props which are from server components, we trust props usually.
        // However, for client-side navigation updates, we should sync with searchParams if needed.
        // For now, simpler is better: rely on internal state for UI, and push to URL on change.
    }, [searchParams]);

    const updateURL = (newPlatforms: string[], newCategories: string[], newPrice: [number, number]) => {
        const params = new URLSearchParams(searchParams.toString());

        // Platforms
        params.delete("platforms");
        newPlatforms.forEach(p => params.append("platforms", p));

        // Categories
        params.delete("categories");
        newCategories.forEach(c => params.append("categories", c));

        // Price
        params.set("minPrice", newPrice[0].toString());
        params.set("maxPrice", newPrice[1].toString());

        // Reset page if needed, or query
        router.push(`/catalog?${params.toString()}`);
    };

    const handlePlatformChange = (platform: string, checked: boolean) => {
        const newPlatforms = checked
            ? [...platforms, platform]
            : platforms.filter((p) => p !== platform);

        setPlatforms(newPlatforms);
        updateURL(newPlatforms, categories, priceRange);
    };

    const handleCategoryChange = (category: string, checked: boolean) => {
        const newCategories = checked
            ? [...categories, category]
            : categories.filter((c) => c !== category);

        setCategories(newCategories);
        updateURL(platforms, newCategories, priceRange);
    };

    const handlePriceChange = (value: number[]) => {
        const newRange: [number, number] = [value[0], value[1]]; // Slider returns array
        setPriceRange(newRange);
    };

    const handlePriceCommit = (value: number[]) => {
        // Update URL only when drag ends
        const newRange: [number, number] = [value[0], value[1]];
        updateURL(platforms, categories, newRange);
    }

    return (
        <div className="space-y-6">
            <Accordion type="multiple" defaultValue={["platforms", "categories", "price"]} className="w-full">

                {/* PLATFORMS */}
                <AccordionItem value="platforms">
                    <AccordionTrigger>Plateforme</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pt-2">
                            {PLATFORMS.map((platform) => (
                                <div key={platform} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`platform-${platform}`}
                                        checked={platforms.includes(platform)}
                                        onCheckedChange={(checked) => handlePlatformChange(platform, checked as boolean)}
                                    />
                                    <Label htmlFor={`platform-${platform}`} className="cursor-pointer">{platform}</Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* CATEGORIES */}
                <AccordionItem value="categories">
                    <AccordionTrigger>Catégorie</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pt-2">
                            {CATEGORIES.map((category) => (
                                <div key={category} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${category}`}
                                        checked={categories.includes(category)}
                                        onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                                    />
                                    <Label htmlFor={`category-${category}`} className="cursor-pointer">{category}</Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* PRICE */}
                <AccordionItem value="price">
                    <AccordionTrigger>Prix</AccordionTrigger>
                    <AccordionContent>
                        <div className="pt-4 px-2 space-y-4">
                            <Slider
                                defaultValue={[0, 1000]}
                                value={[priceRange[0], priceRange[1]]}
                                min={0}
                                max={1000}
                                step={5}
                                minStepsBetweenThumbs={1}
                                onValueChange={handlePriceChange}
                                onValueCommit={handlePriceCommit}
                            />
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                <span>{priceRange[0]} €</span>
                                <span>{priceRange[1]} €</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>

            {(platforms.length > 0 || categories.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000) && (
                <Button variant="outline" className="w-full" onClick={() => {
                    setPlatforms([]);
                    setCategories([]);
                    setPriceRange([0, 1000]);
                    updateURL([], [], [0, 1000]);
                }}>
                    Réinitialiser les filtres
                </Button>
            )}
        </div>
    );
}
