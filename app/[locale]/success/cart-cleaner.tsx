"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { syncCart } from "@/app/actions/cart";

export default function CartCleaner() {
    const cart = useCart();

    useEffect(() => {
        const clearCart = async () => {
            if (cart.items.length > 0) {
                console.log("Paiement réussi : Nettoyage du panier...");

                // Clear local cart immediately
                cart.removeAll();

                // Sync with database - handle errors gracefully
                try {
                    await syncCart([]);
                    console.log("Panier synchronisé avec la base de données");
                } catch (error) {
                    // Log error but don't break the user experience
                    console.error("Erreur lors de la synchronisation du panier (non-bloquant):", error);
                }
            }
        };

        clearCart();
    }, [cart]);

    return null; // Ce composant ne rend rien visuellement
}