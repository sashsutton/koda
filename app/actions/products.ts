"use server";

import { connectToDatabase } from "@/lib/db";
import Automation from "@/models/Automation";
import User from "@/models/User";

export interface ProductFilterParams {
    platforms?: string[];
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    query?: string;
}

export async function getProducts(params: ProductFilterParams) {
    try {
        await connectToDatabase();

        const filters: any = {};

        if (params.query) {
            filters.title = { $regex: params.query, $options: "i" };
        }

        if (params.platforms && params.platforms.length > 0) {
            filters.platform = { $in: params.platforms };
        }

        if (params.categories && params.categories.length > 0) {
            filters.category = { $in: params.categories };
        }

        if (params.minPrice !== undefined || params.maxPrice !== undefined) {
            filters.price = {};
            if (params.minPrice !== undefined) filters.price.$gte = params.minPrice;
            if (params.maxPrice !== undefined) filters.price.$lte = params.maxPrice;
        }

        let sortOption: any = { createdAt: -1 }; // Default: Newest
        if (params.sort === "price_asc") sortOption = { price: 1 };
        if (params.sort === "price_desc") sortOption = { price: -1 };
        if (params.sort === "newest") sortOption = { createdAt: -1 };

        const automations = await Automation.find(filters)
            .sort(sortOption)
            .lean();

        // Get distinct seller IDs
        const sellerIds = [...new Set(automations.map((a: any) => a.sellerId))];
        const sellers = await User.find({ clerkId: { $in: sellerIds } }).lean();
        const sellerMap = new Map(sellers.map((s: any) => [s.clerkId, s]));

        return automations.map((a: any) => ({
            ...a,
            _id: a._id.toString(),
            createdAt: a.createdAt ? a.createdAt.toISOString() : null,
            updatedAt: a.updatedAt ? a.updatedAt.toISOString() : null,
            seller: sellerMap.get(a.sellerId) ? {
                username: (sellerMap.get(a.sellerId) as any).username,
                firstName: (sellerMap.get(a.sellerId) as any).firstName,
                lastName: (sellerMap.get(a.sellerId) as any).lastName,
                imageUrl: (sellerMap.get(a.sellerId) as any).imageUrl
            } : null
        }));

    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}
