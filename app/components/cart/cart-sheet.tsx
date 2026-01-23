"use client";

import { ShoppingCart, Trash2, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/components/ui/sheet";
import { Separator } from "@/app/components/ui/separator";
import { useEffect, useState, useTransition } from "react";
import { createCheckoutSession } from "@/app/actions/transaction";
import { getSavedCart, syncCart } from "@/app/actions/cart";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

export default function CartSheet() {
    const [isMounted, setIsMounted] = useState(false);
    const [isPending, startTransition] = useTransition();
    const cart = useCart();
    const { userId } = useAuth();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Gestion Connexion / Déconnexion
    useEffect(() => {
        if (userId) {
            // Utilisateur se connecte
            // On récupère son panier sauvegardé en base de données
            const loadCart = async () => {
                try {
                    const savedItems = await getSavedCart();
                    if (savedItems && savedItems.length > 0) {
                        cart.setItems(savedItems);
                    }
                } catch (error) {
                    console.error("Erreur chargement panier:", error);
                }
            };
            loadCart();
        } else {
            // Utilisateur se déconnecte (ou n'est pas connecté)
            // On vide le panier local pour ne pas afficher les articles de l'utilisateur précédent
            if (cart.items.length > 0) {
                cart.removeAll();
            }
        }
    }, [userId]); // On ne déclenche ceci que quand le statut de connexion change

    // Sauvegarde automatique
    // À chaque fois que le panier change localement, on met à jour la BDD (si connecté)
    useEffect(() => {
        if (userId && isMounted) {
            syncCart(cart.items);
        }
    }, [cart.items, userId, isMounted]);


    if (!isMounted) return null;
    const total = cart.items.reduce((total, item) => total + Number(item.price), 0);

    const onCheckout = async () => {
        if (!userId) {
            toast.error("Veuillez vous connecter pour payer.");
            return;
        }
        startTransition(async () => {
            try {
                const { url } = await createCheckoutSession(cart.items);
                if (url) window.location.href = url;
            } catch (error: any) {
                console.error(error);
                toast.error(error.message || "Erreur de paiement.");
            }
        });
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" className="relative">
                    <ShoppingCart size={20} />
                    {cart.items.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
              {cart.items.length}
            </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="z-[100] flex flex-col h-full bg-background">
                <SheetHeader>
                    <SheetTitle>Mon Panier ({cart.items.length})</SheetTitle>
                </SheetHeader>

                <div className="mt-8 flex flex-col gap-4 flex-grow overflow-y-auto">
                    {cart.items.length === 0 && (
                        <div className="text-center my-10 space-y-2">
                            <p className="text-muted-foreground">Votre panier est vide.</p>
                            {!userId && (
                                <p className="text-xs text-muted-foreground">Connectez-vous pour commencer vos achats.</p>
                            )}
                        </div>
                    )}

                    {cart.items.map((item) => (
                        <div key={item._id} className="flex justify-between items-center bg-secondary/20 p-3 rounded-lg">
                            <div className="flex flex-col gap-1 overflow-hidden">
                                <span className="font-semibold truncate text-sm">{item.title}</span>
                                <span className="text-xs text-muted-foreground">{item.price} €</span>
                            </div>
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => cart.removeItem(item._id)}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    ))}
                </div>

                {cart.items.length > 0 && (
                    <div className="pt-4 mt-auto">
                        <Separator className="my-4" />
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold">Total:</span>
                            <span className="font-bold text-lg">{total.toFixed(2)} €</span>
                        </div>

                        <Button className="w-full" onClick={onCheckout} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Préparation...
                                </>
                            ) : "Passer au paiement"}
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}