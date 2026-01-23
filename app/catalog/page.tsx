import { Suspense } from "react";
import { getProducts } from "@/app/actions/products";
import { ProductCard } from "@/app/components/products/product-card";
import { Slider } from "@/app/components/ui/slider";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/app/components/ui/accordion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/app/components/ui/select";
import { Link, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";

// Constants
const PLATFORMS = ["n8n", "Make", "Zapier", "Python", "Other"];
const CATEGORIES = ["Social Media", "Email Marketing", "Productivity", "Sales", "Other"];

interface ProductsPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage(props: ProductsPageProps) {
    const searchParams = await props.searchParams;

    // Safe parsing of search params
    const platformsParam = searchParams.platforms;
    const categoriesParam = searchParams.categories;

    const platforms = typeof platformsParam === 'string' ? [platformsParam] : (Array.isArray(platformsParam) ? platformsParam : []);
    const categories = typeof categoriesParam === 'string' ? [categoriesParam] : (Array.isArray(categoriesParam) ? categoriesParam : []);

    const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : 0;
    const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : 1000;
    const sort = typeof searchParams.sort === 'string' ? searchParams.sort : "newest";
    const query = typeof searchParams.query === 'string' ? searchParams.query : "";

    const products = await getProducts({
        platforms,
        categories,
        minPrice,
        maxPrice,
        sort,
        query,
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">

                {/* Sticky Sidebar */}
                <aside className="w-full md:w-[250px] space-y-6 md:sticky md:top-24 h-fit">
                    <div className="space-y-4">
                        <SidebarSearch />
                        <h3 className="font-bold text-lg">Filtres</h3>

                        {/* Filter Form - Using standard form submission to update URL params via native browser behavior or we can use a Client Component wrapper. 
                For simplicity in this server component skeleton, I'll structure it, but ideally the filters should be a Client Component to manage state and URL updates smoothly.
                I will implement the Sidebar as a Client Component in a separate file for better interactivity or wrap the interactive parts.
                For now, let's create a Client Component for the sidebar filters.
            */}
                        <FiltersSidebar
                            initialPlatforms={platforms}
                            initialCategories={categories}
                            initialMinPrice={minPrice}
                            initialMaxPrice={maxPrice}
                        />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h1 className="text-2xl font-bold">
                            {products.length} {products.length > 1 ? "automatisations trouvées" : "automatisation trouvée"}
                        </h1>

                        {/* Sort Dropdown - Needs to be client component or part of the form */}
                        <SortSelect initialSort={sort} />
                    </div>

                    {/* Grid */}
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product: any) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-muted/10">
                            <Search className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">Aucune automatisation trouvée</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">
                                Essayez de modifier vos filtres ou effectuez une nouvelle recherche.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// Client Components for Filters and Sort
// I will separate these into their own files properly in the next steps or put them here if simple enough, 
// but for cleanliness and best practices, I should separate them.
// Let's create a placeholder here and I will extract them right after.
import { FiltersSidebar } from "@/app/components/products/filters-sidebar";
import { SortSelect } from "@/app/components/products/sort-select";
import { SidebarSearch } from "@/app/components/products/sidebar-search";
