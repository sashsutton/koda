"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { ShoppingCart, Eye } from "lucide-react"; // Icône pour le panier
import { useCart } from "@/hooks/use-cart";   // Ton hook panier
import { IAutomation } from "@/types/automation";

interface ProductCardProps {
    product: IAutomation; // On passe l'objet entier pour le panier
    userId?: string | null;
}

export function ProductCard({ product, userId }: ProductCardProps) {
    const cart = useCart();
    const isOwner = userId === product.sellerId;

    // Gestion du clic "Ajouter au panier"
    const onAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        cart.addItem(product);
    };

    // Platform Icon Map (Simple fallback for now)
    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case "n8n": return <span className="font-bold text-orange-500">n8n</span>;
            case "Make": return <span className="font-bold text-purple-600">Make</span>;
            case "Zapier": return <span className="font-bold text-orange-600">Zapier</span>;
            case "Python": return <span className="font-bold text-blue-500">Python</span>;
            default: return <span className="font-medium text-foreground">{platform}</span>;
        }
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 border-border/50 group overflow-hidden relative">

            {/* Image Preview / Gradient Fallback */}
            <div className="relative w-full aspect-video bg-muted overflow-hidden">
                {product.previewImageUrl ? (
                    <img
                        src={product.previewImageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center">
                        <span className="text-4xl opacity-20 font-black tracking-tighter">KODA</span>
                    </div>
                )}

                {/* Quick View Overlay Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button asChild variant="secondary" size="sm" className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <Link href={`/product/${product._id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Aperçu rapide
                        </Link>
                    </Button>
                </div>

                {/* Badge Category (Top Left) */}
                <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="backdrop-blur-md bg-background/80 hover:bg-background/90">
                        {product.category}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                        {/* Dynamic Platform Icon */}
                        {getPlatformIcon(product.platform)}
                    </div>
                    <span className="font-bold text-lg text-primary">{product.price} €</span>
                </div>

                <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                </h3>

                {/* Seller Info */}
                <div className="text-xs text-muted-foreground mt-1">
                    Proposé par <span className="font-medium text-foreground">
                        {product.seller?.username || product.seller?.firstName || "Vendeur"}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2 flex-grow">
                <p className="text-muted-foreground text-sm line-clamp-2">
                    {product.description}
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-0 mt-auto">
                <Button
                    onClick={onAddToCart}
                    className="w-full bg-primary/90 hover:bg-primary"
                    disabled={isOwner}
                >
                    {isOwner ? (
                        <>
                            <ShoppingCart className="mr-2 h-4 w-4 opacity-50" />
                            Votre produit
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Ajouter au panier
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}