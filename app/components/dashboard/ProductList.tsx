"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Link } from "@/i18n/routing";
import { Package, Plus, Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { getPublicImageUrl } from "@/lib/image-helper";
import { Badge } from "@/app/components/ui/badge";

interface ProductListProps {
    products: any[];
    onDelete: (productId: string) => Promise<void>;
}

export function ProductList({ products, onDelete }: ProductListProps) {
    const t = useTranslations('Dashboard');

    return (
        <section className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black tracking-tight">{t('sections.products')}</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage your storefront and inventory</p>
                </div>
                <Button asChild className="rounded-full h-11 px-6 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]">
                    <Link href="/sell">
                        <Plus className="mr-2 h-5 w-5" />
                        {t('products.new')}
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                {products.length > 0 ? (
                    products.map((product) => (
                        <Card key={product._id} className="overflow-hidden group flex flex-col h-full hover:shadow-2xl transition-all duration-300 border-border/50 bg-card rounded-2xl border-2 hover:border-primary/20">
                            <div className="aspect-video bg-muted relative w-full overflow-hidden">
                                {product.previewImageUrl ? (
                                    <Image
                                        src={getPublicImageUrl(product.previewImageUrl)}
                                        alt={product.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center w-full h-full text-muted-foreground bg-muted/40">
                                        <Package className="h-10 w-10 opacity-10 mb-2" />
                                        <span className="text-[10px] uppercase font-black opacity-30 tracking-widest">{t('products.noImage')}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-[10px] font-bold uppercase tracking-wider">
                                        Active Listing
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex justify-between items-start gap-3 mb-4">
                                    <h3 className="font-bold text-lg line-clamp-2 leading-tight group-hover:text-primary transition-colors" title={product.title}>
                                        {product.title}
                                    </h3>
                                    <div className="text-xl font-black text-primary bg-primary/5 px-3 py-1 rounded-xl border border-primary/10">
                                        {product.price.toFixed(2)}€
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 flex gap-2">
                                    <Button variant="outline" className="flex-1 rounded-xl font-bold text-xs h-10 border-border/50 hover:bg-muted" asChild title="View on Market">
                                        <Link href={`/product/${product._id}`}>
                                            <Eye className="mr-2 h-3.5 w-3.5" />
                                            View
                                        </Link>
                                    </Button>

                                    <Button variant="outline" className="flex-1 rounded-xl font-bold text-xs h-10 border-border/50 hover:bg-muted" asChild>
                                        <Link href={`/dashboard/edit/${product._id}`}>
                                            <Edit className="mr-2 h-3.5 w-3.5" />
                                            {t('products.edit')}
                                        </Link>
                                    </Button>

                                    <form action={async () => {
                                        if (confirm("Are you sure?")) {
                                            await onDelete(product._id);
                                        }
                                    }}>
                                        <Button variant="destructive" size="icon" type="submit" className="rounded-xl h-10 w-10 shadow-lg shadow-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/50">
                        <div className="inline-flex p-5 bg-muted rounded-full mb-6">
                            <Package className="h-10 w-10 text-muted-foreground opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{t('products.noProducts')}</h3>
                        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                            Transform your workflows into passive income today.
                        </p>
                        <Button asChild className="rounded-full h-12 px-8 font-bold text-base shadow-xl shadow-primary/20">
                            <Link href="/sell">{t('products.startSelling')}</Link>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
