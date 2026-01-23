// app/api/webhooks/stripe/route.ts

import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Purchase from "@/models/Purchase";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    // On écoute l'événement "Session de paiement terminée"
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        // Récupération des métadonnées
        const userId = session.metadata?.userId;
        const productIdsString = session.metadata?.productIds; // C'est maintenant une liste (String JSON)

        // Fallback pour compatibilité (si c'est un vieil achat avec un seul ID)
        const singleProductId = session.metadata?.productId;

        if (userId) {
            await connectToDatabase();

            const productIds: string[] = [];

            // Cas 1 : Panier (Liste d'IDs)
            if (productIdsString) {
                try {
                    const parsed = JSON.parse(productIdsString);
                    if (Array.isArray(parsed)) {
                        productIds.push(...parsed);
                    }
                } catch (e) {
                    console.error("Erreur parsing productIds:", e);
                }
            }
            // Cas 2 : Achat unique (Ancienne méthode)
            else if (singleProductId) {
                productIds.push(singleProductId);
            }

            // On crée une preuve d'achat pour CHAQUE produit trouvé
            if (productIds.length > 0) {
                for (const productId of productIds) {
                    // On vérifie si l'achat existe déjà pour éviter les doublons
                    const existingPurchase = await Purchase.findOne({
                        userId: userId,
                        automationId: productId // Assure-toi que ton modèle Purchase utilise 'automationId' ou 'productId'
                    });

                    if (!existingPurchase) {
                        await Purchase.create({
                            userId: userId,
                            automationId: productId, // Lien vers le produit
                            stripeId: session.id,
                            amount: session.amount_total ? session.amount_total / 100 : 0, // Optionnel selon ton modèle
                        });
                    }
                }

                 //Optionnel : Vider le panier de l'utilisateur dans la BDD (double sécurité)
                 await User.findByIdAndUpdate(userId, { cart: [] });
            }
        }
    }

    return new NextResponse(null, { status: 200 });
}