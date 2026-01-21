import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Purchase from "@/models/Purchase";
import Automation from "@/models/Automation";

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
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    await connectToDatabase();

    switch (event.type) {
        case "account.updated":
            const account = event.data.object as Stripe.Account;
            if (account.details_submitted) {
                await User.findOneAndUpdate(
                    { stripeConnectId: account.id },
                    { onboardingComplete: true }
                );
            }
            break;

        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            const { productId, userId } = session.metadata || {};

            if (productId && userId) {
                // 1. Récupérer les infos du produit pour avoir le sellerId
                const product = await Automation.findById(productId);

                if (product) {
                    // 2. Créer l'enregistrement de l'achat
                    await Purchase.create({
                        productId: productId,
                        buyerId: userId,
                        sellerId: product.sellerId,
                        amount: session.amount_total ? session.amount_total / 100 : product.price,
                        stripeSessionId: session.id,
                    });

                    console.log(`Transaction enregistrée : Produit ${productId} acheté par ${userId}`);

                    // Note : L'accès au fichier S3 est géré dynamiquement sur la page /success
                    // via une URL pré-signée générée à la volée.
                }
            }
            break;

        default:
            console.log(`Événement non géré : ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
}