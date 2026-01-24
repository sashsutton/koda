// app/actions/cart.ts
"use server";

import { requireAuth, requireUser } from "@/lib/auth-utils";
import User from "@/models/User";
import Automation from "@/models/Automation"; // Important pour que la 'ref' fonctionne
import { IAutomation } from "@/types/automation";

// Récupérer le panier depuis la BDD
export async function getSavedCart(): Promise<IAutomation[]> {
    const user = await requireUser();

    // On peuple manuellement le champ cart
    await user.populate("cart");

    if (!user.cart || user.cart.length === 0) return [];

    // Conversion propre des données pour le client
    const cartItems = user.cart as unknown as any[];

    return cartItems.map((item) => ({
        ...item,
        _id: item._id.toString(),
        createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
        sellerId: item.sellerId.toString(),
        // On s'assure que category est valide, sinon "Other" par défaut
        category: item.category || "Other"
    }));
}

// Sauvegarder le panier dans la BDD
export async function syncCart(items: IAutomation[]) {
    const user = await requireUser();

    const productIds = items.map((item) => item._id);

    user.cart = productIds as any;
    await user.save();
}