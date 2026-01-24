"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ShoppingCart, Trash2, Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/hooks/use-cart";
import { createCheckoutSession } from "@/app/actions/transaction";
import { getMyOrders } from "@/app/actions/dashboard";
import { getPublicImageUrl } from "@/lib/image-helper";

import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/app/components/ui/sheet";
import { Separator } from "@/app/components/ui/separator";

export default function CartSheet() {
    const [isMounted, setIsMounted] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Set pour stocker les IDs des produits déjà achetés
    const [purchasedIds, setPurchasedIds] = useState<Set<string> | null>(null);

    const cart = useCart();
    const { userId } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // 1. Chargement des achats à la connexion
    useEffect(() => {
        if (userId) {
            getMyOrders()
                .then((orders) => {
                    // Extraction robuste des IDs produits
                    const productIds = orders.map((o: any) => {
                        // Cas A: L'objet est directement un produit
                        if (!o.buyerId && !o.stripeId && o.title) {
                            return String(o._id);
                        }

                        // Cas B: C'est une commande peuplée avec un objet produit
                        if (o.productId && typeof o.productId === 'object' && o.productId._id) {
                            return String(o.productId._id);
                        }

                        // Cas C: C'est une commande avec juste l'ID
                        if (o.productId) {
                            return String(o.productId);
                        }

                        return null;
                    }).filter((id): id is string => !!id); // 👈 CORRECTION ICI (Type Guard)

                    setPurchasedIds(new Set(productIds));
                })
                .catch((err) => {
                    console.error("Erreur récupération achats", err);
                });
        } else {
            setPurchasedIds(null);
        }
    }, [userId]);

    // 2. Nettoyage automatique du panier
    useEffect(() => {
        // Sécurité : on attend que le composant soit monté et les achats chargés
        if (!isMounted || !purchasedIds || cart.items.length === 0) return;

        // Identification des doublons (comparaison stricte de chaînes)
        const itemsToRemove = cart.items.filter(item => {
            const itemId = String(item._id).trim();
            return purchasedIds.has(itemId);
        });

        if (itemsToRemove.length > 0) {
            // Filtrage : on garde uniquement ce qui n'est pas acheté
            const cleanItems = cart.items.filter(item => !purchasedIds.has(String(item._id).trim()));

            // Mise à jour du store
            cart.setItems(cleanItems);

            // Notification utilisateur professionnelle
            if (itemsToRemove.length === 1) {
                toast.info(`"${itemsToRemove[0].title}" a été retiré de votre panier car vous possédez déjà cet article.`);
            } else {
                toast.info(`${itemsToRemove.length} articles ont été retirés de votre panier car vous les possédez déjà.`);
            }
        }
    }, [purchasedIds, cart.items, isMounted, cart]);


    if (!isMounted) return null;

    const total = cart.items.reduce((total, item) => total + Number(item.price), 0);

    const onCheckout = async () => {
        if (!userId) {
            toast.info("Veuillez vous connecter pour valider votre commande. Votre panier sera conservé.");
            router.push("/sign-in");
            return;
        }

        startTransition(async () => {
            try {
                const { url } = await createCheckoutSession(cart.items);
                if (url) window.location.href = url;
            } catch (error: any) {
                console.error(error);
                toast.error(error.message || "Une erreur est survenue lors de la préparation du paiement.");
            }
        });
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" className="relative hover:bg-secondary/50">
                    <ShoppingCart size={20} />
                    {cart.items.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center animate-in zoom-in">
                            {cart.items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="z-[100] flex flex-col h-full bg-background/95 backdrop-blur-sm sm:max-w-md">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Mon Panier <span className="text-muted-foreground font-normal text-sm">({cart.items.length})</span>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-4 flex-grow overflow-y-auto py-6">
                    {cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground font-medium">Votre panier est vide.</p>
                            <SheetClose asChild>
                                <Button variant="outline" size="sm">
                                    Continuer mes achats
                                </Button>
                            </SheetClose>
                        </div>
                    ) : (
                        cart.items.map((item) => (
                            <div key={item._id} className="flex gap-4 p-3 bg-card border rounded-lg hover:shadow-sm transition-all group">
                                <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                                    {item.previewImageUrl ? (
                                        <img
                                            src={getPublicImageUrl(item.previewImageUrl)}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xs font-bold text-muted-foreground">Koda</span>
                                    )}
                                </div>

                                <div className="flex flex-col justify-between flex-grow">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-sm line-clamp-2 leading-tight">{item.title}</span>
                                        <span className="font-bold text-sm ml-2 whitespace-nowrap">{item.price} €</span>
                                    </div>
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                            {item.category || "Automation"}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => cart.removeItem(item._id)}
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.items.length > 0 && (
                    <div className="border-t pt-6 mt-auto bg-background">
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Sous-total</span>
                                <span>{total.toFixed(2)} €</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Total</span>
                                <span className="text-primary">{total.toFixed(2)} €</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-11 text-base shadow-lg"
                            onClick={onCheckout}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Chargement...
                                </>
                            ) : !userId ? (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Se connecter pour payer
                                </>
                            ) : (
                                "Passer au paiement"
                            )}
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}