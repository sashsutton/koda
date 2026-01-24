"use server";

import { requireUser } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";
import Purchase from "@/models/Purchase";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";


export async function submitContent(prevState: any, formData: FormData) {
    let user;
    try {
        user = await requireUser();
    } catch (err: any) {
        return { error: err.message };
    }

    const userId = user.clerkId;
    const rawData = {
        productId: formData.get("productId"),
        path: formData.get("path"),
        type: formData.get("type") || 'review',
        rating: formData.get("rating") ? Number(formData.get("rating")) : undefined,
        comment: formData.get("comment"),
    };

    const { productId, type, rating, comment } = rawData as any;
    const path = formData.get("path") as string;

    await connectToDatabase();



    //logique de vérification d'achat
    try {
        // logique de création/update
        if (type === 'review') {
            await Review.findOneAndUpdate(
                { userId, productId, type: 'review' },
                {
                    userName: user.firstName || "User",
                    rating,
                    comment
                },
                { upsert: true, new: true }
            );
        } else {
            // ...
        }

        // CALCUL DE MOYENNE
        if (type === 'review') {
            const stats = await Review.aggregate([
                {
                    $match: {
                        productId: new mongoose.Types.ObjectId(productId),
                        type: 'review'
                    }
                },
                { $group: { _id: "$productId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
            ]);

            if (stats.length > 0) {
                await Product.findByIdAndUpdate(productId, {
                    averageRating: Math.round(stats[0].avg * 10) / 10,
                    reviewCount: stats[0].count
                });
            }
        }

        if (path) {
            revalidatePath(path); // Rafraîchit /fr/product/123 au lieu de /product/123
        } else {
            revalidatePath(`/product/${productId}`); // Fallback
        }

        return { success: true, message: "Sent successfully!" };

    } catch (error) {
        console.error(error);
        return { error: "Server error." };
    }
}