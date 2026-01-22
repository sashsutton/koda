"use server";

import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Automation from "@/models/Automation";
import User from "@/models/User";
import { redirect } from "next/navigation";
import { getPublicImageUrl } from "@/lib/image-helper";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function createCheckoutSession(automationId: string) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl || !/^https?:\/\//.test(appUrl)) {
        throw new Error("NEXT_PUBLIC_APP_URL manquant ou invalide (ex: https://ton-domaine.com).");
    }

    await connectToDatabase();

    const product = await Automation.findById(automationId).lean();
    if (!product) throw new Error("Produit introuvable.");

    const stringSellerId = typeof product.sellerId === "object" ? product.sellerId.toString() : product.sellerId;
    const seller = await User.findOne({ clerkId: stringSellerId });
    if (!seller || !seller.stripeConnectId) {
        throw new Error("Le vendeur n'a pas configuré ses paiements.");
    }

    const priceInCents = Math.round(product.price * 100);
    const applicationFeeAmount = Math.round(priceInCents * 0.15);

    const candidateImageUrl = product.previewImageUrl ? getPublicImageUrl(product.previewImageUrl) : "";
    const imageUrl = typeof candidateImageUrl === "string" ? candidateImageUrl.trim() : "";

    // Stripe est strict : on n'envoie l'image que si c'est une URL absolue HTTPS
    const images = /^https:\/\//.test(imageUrl) ? [imageUrl] : [];

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: product.title,
                        description: product.description,
                        images,
                    },
                    unit_amount: priceInCents,
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        payment_intent_data: {
            application_fee_amount: applicationFeeAmount,
            transfer_data: {
                destination: seller.stripeConnectId,
            },
        },
        metadata: {
            productId: automationId,
            userId: userId,
        },
        success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/product/${automationId}`,
    });

    const url = (session.url ?? "").trim();
    if (!url || (!url.startsWith("/") && !/^https?:\/\//.test(url))) {
        throw new Error("Stripe n'a pas retourné une URL de checkout valide.");
    }

    return url;
}
