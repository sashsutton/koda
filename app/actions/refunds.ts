"use server";

import Stripe from "stripe";
import { requireAdmin } from "@/lib/admin-utils";
import { connectToDatabase } from "@/lib/db";
import Purchase from "@/models/Purchase";
import Automation from "@/models/Automation";
import User from "@/models/User";
import { createNotification } from "@/app/actions/notifications";
import { revalidatePath } from "next/cache";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function getPendingRefunds() {
    await requireAdmin();
    await connectToDatabase();

    const refunds = await Purchase.find({
        refundStatus: 'pending'
    })
        .populate('productId')
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(refunds));
}

export async function getAllRefunds(filters?: { status?: string; limit?: number }) {
    await requireAdmin();
    await connectToDatabase();

    const query: any = { refundStatus: { $ne: 'none' } };

    if (filters?.status && filters.status !== 'all') {
        query.refundStatus = filters.status;
    }

    const refunds = await Purchase.find(query)
        .populate('productId')
        .sort({ refundedAt: -1, createdAt: -1 })
        .limit(filters?.limit || 50)
        .lean();

    return JSON.parse(JSON.stringify(refunds));
}

export async function createRefundRequest(purchaseId: string, reason?: string) {
    await requireAdmin();
    await connectToDatabase();

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
        throw new Error("Purchase not found");
    }

    if (purchase.refundStatus !== 'none') {
        throw new Error("Refund already exists for this purchase");
    }

    purchase.refundStatus = 'pending';
    purchase.refundReason = reason || 'Refund requested by admin';
    await purchase.save();

    revalidatePath('/admin');
    return { success: true };
}

export async function processRefund(purchaseId: string, adminNote?: string) {
    await requireAdmin();
    await connectToDatabase();

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
        throw new Error("Purchase not found");
    }

    if (purchase.refundStatus === 'completed') {
        throw new Error("Purchase already refunded");
    }

    try {
        // Update status to approved
        purchase.refundStatus = 'approved';
        if (adminNote) {
            purchase.refundReason = adminNote;
        }
        await purchase.save();

        // Get the Stripe session to find the payment intent
        const session = await stripe.checkout.sessions.retrieve(purchase.stripeSessionId, {
            expand: ['payment_intent']
        });

        const paymentIntent = session.payment_intent as Stripe.PaymentIntent;

        if (!paymentIntent) {
            throw new Error("Payment intent not found");
        }

        // Create the refund (Stripe automatically reverses the transfer)
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntent.id,
            reason: 'requested_by_customer',
            metadata: {
                purchaseId: purchaseId.toString(),
                adminNote: adminNote || ''
            }
        });

        // Update purchase with refund details
        purchase.refundStatus = 'completed';
        purchase.refundedAt = new Date();
        purchase.stripeRefundId = refund.id;
        await purchase.save();

        // Get product details for notifications
        const product = await Automation.findById(purchase.productId);

        // Notify buyer
        await createNotification(
            purchase.buyerId,
            "ORDER",
            "Remboursement effectué",
            `Votre commande pour "${product?.title || 'produit'}" a été remboursée.`,
            "/dashboard",
            'notifications.refundCompletedTitle',
            'notifications.refundCompletedBody',
            {
                productTitle: product?.title || 'produit',
                amount: `${purchase.amount}€`
            }
        );

        // Notify seller
        await createNotification(
            purchase.sellerId,
            "SALE",
            "Vente remboursée",
            `Une vente a été remboursée. Le transfert a été annulé.`,
            "/dashboard?mode=seller",
            'notifications.saleRefundedTitle',
            'notifications.saleRefundedBody',
            {
                productTitle: product?.title || 'produit',
                amount: `${purchase.amount}€`
            }
        );

        revalidatePath('/admin');
        revalidatePath('/dashboard');

        return {
            success: true,
            refundId: refund.id,
            message: "Refund processed successfully"
        };

    } catch (error: any) {
        console.error("Refund processing error:", error);

        // Mark as failed
        purchase.refundStatus = 'failed';
        purchase.refundReason = `Failed: ${error.message}`;
        await purchase.save();

        throw new Error(`Refund failed: ${error.message}`);
    }
}

export async function rejectRefund(purchaseId: string, reason: string) {
    await requireAdmin();
    await connectToDatabase();

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
        throw new Error("Purchase not found");
    }

    purchase.refundStatus = 'rejected';
    purchase.refundReason = reason;
    await purchase.save();

    revalidatePath('/admin');
    return { success: true };
}
