"use server";

import { connectToDatabase } from "@/lib/db";
import Purchase from "@/models/Purchase";

export async function getUserPurchasedProductIds(userId: string): Promise<string[]> {
    if (!userId) return [];

    try {
        await connectToDatabase();
        const purchases = await Purchase.find({ buyerId: userId }).select('productId').lean();
        return purchases.map((p: any) => p.productId.toString());
    } catch (error) {
        console.error("Error fetching user purchases:", error);
        return [];
    }
}
