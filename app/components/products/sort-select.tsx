"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";

interface SortSelectProps {
    initialSort: string;
}

export function SortSelect({ initialSort }: SortSelectProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSortChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);
        router.push(`/catalog?${params.toString()}`);
    };

    return (
        <Select value={initialSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
            </SelectContent>
        </Select>
    );
}
