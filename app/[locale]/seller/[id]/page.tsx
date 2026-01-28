import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getSellerProfile } from "@/app/actions/seller";
import Purchase from "@/models/Purchase";
import { ProductCard } from "@/app/components/products/product-card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import {
    ShieldCheck,
    Star,
    Package,
    ShoppingBag,
    Calendar,
    User,
    ArrowLeft
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";

interface SellerPageProps {
    params: Promise<{ locale: string; id: string }>;
}

export default async function SellerPage({ params }: SellerPageProps) {
    const { locale, id } = await params;
    setRequestLocale(locale);

    const t = await getTranslations('Seller');
    const { userId } = await auth();

    const seller = await getSellerProfile(id);

    // Fetch user's purchases to determine if they own any of the products
    let purchasedProductIds: string[] = [];
    if (userId) {
        const purchases = await Purchase.find({ buyerId: userId }).select('productId').lean();
        purchasedProductIds = purchases.map((p: any) => p.productId.toString());
    }

    if (!seller) {
        notFound();
    }

    const displayName = seller.username ||
        `${seller.firstName || ''} ${seller.lastName || ''}`.trim() ||
        'Vendeur';

    const formattedDate = new Date(seller.stats.memberSince).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background pt-24 pb-12">
                <div className="container mx-auto px-4">
                    {/* Back button */}
                    <Link href="/catalog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
                        <ArrowLeft className="h-4 w-4" />
                        {t('backToCatalog')}
                    </Link>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            {seller.imageUrl ? (
                                <img
                                    src={seller.imageUrl}
                                    alt={displayName}
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-xl object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background shadow-xl bg-muted flex items-center justify-center">
                                    <User className="w-16 h-16 text-muted-foreground" />
                                </div>
                            )}
                            {seller.onboardingComplete && (
                                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-4">
                                <h1 className="text-3xl md:text-4xl font-bold">{displayName}</h1>
                                {seller.onboardingComplete && (
                                    <Badge className="bg-green-600 text-white">
                                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                        {t('verified')}
                                    </Badge>
                                )}
                            </div>

                            {seller.bio && (
                                <p className="text-muted-foreground max-w-2xl mb-6">
                                    {seller.bio}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
                                <div className="flex items-center gap-2 text-sm">
                                    <Package className="w-4 h-4 text-primary" />
                                    <span className="font-semibold">{seller.stats.totalProducts}</span>
                                    <span className="text-muted-foreground">{t('products')}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <ShoppingBag className="w-4 h-4 text-primary" />
                                    <span className="font-semibold">{seller.stats.totalSales}</span>
                                    <span className="text-muted-foreground">{t('sales')}</span>
                                </div>
                                {seller.stats.averageRating > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-semibold">{seller.stats.averageRating}</span>
                                        <span className="text-muted-foreground">{t('rating')}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="text-muted-foreground">{t('memberSince')} {formattedDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold mb-8">
                    {t('productsBy', { name: displayName })}
                </h2>

                {seller.products.length === 0 ? (
                    <Card className="p-12 text-center">
                        <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-lg font-medium text-muted-foreground">
                            {t('noProducts')}
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {seller.products.map((product) => {
                            const isPurchased = purchasedProductIds.includes(product._id.toString());
                            return (
                                <ProductCard
                                    key={product._id}
                                    product={product as any}
                                    userId={userId}
                                    isPurchased={isPurchased}
                                />
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
