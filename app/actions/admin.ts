"use server";

import { requireAdmin } from "@/lib/auth-utils";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { Product } from "@/models/Product";
import Automation from "@/models/Automation";
import Purchase from "@/models/Purchase";
import { ratelimit } from "@/lib/ratelimit";
import { getDownloadUrl } from "@/lib/s3";
import { getOrSetCache, invalidateCache } from "@/lib/cache-utils";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

/**
 * Récupère tous les produits avec support de recherche et cache.
 */
export async function getAllProducts(search?: string) {
    await requireAdmin();

    // Clé de cache dynamique
    const cacheKey = `admin:products:${search || 'all'}`;

    return await getOrSetCache(cacheKey, async () => {
        const query = search ? { title: { $regex: search, $options: 'i' } } : {};

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Récupération des vendeurs pour l'affichage
        const sellerIds = [...new Set(products.map((p: any) => p.sellerId))];
        const sellers = await User.find({ clerkId: { $in: sellerIds } }).lean();
        const sellerMap = new Map(sellers.map((s: any) => [s.clerkId, s]));

        return products.map((product: any) => ({
            ...product,
            _id: product._id.toString(),
            createdAt: product.createdAt?.toISOString(),
            updatedAt: product.updatedAt?.toISOString(),
            seller: sellerMap.get(product.sellerId) ? {
                username: (sellerMap.get(product.sellerId) as any).username ||
                    `${(sellerMap.get(product.sellerId) as any).firstName || ''} ${(sellerMap.get(product.sellerId) as any).lastName || ''}`.trim() ||
                    "Vendeur",
            } : null
        }));
    }, 60); // Cache de 60 secondes
}

/**
 * Récupère tous les utilisateurs avec support de recherche et cache.
 */
export async function getAllUsers(search?: string) {
    await requireAdmin();

    const cacheKey = `admin:users:${search || 'all'}`;

    return await getOrSetCache(cacheKey, async () => {
        const query = search ? {
            $or: [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const users = await User.find(query)
            .select("-cart")
            .sort({ createdAt: -1 })
            .lean();

        // Note: La synchro automatique Clerk est omise ici pour la performance de la recherche
        // Utilisez le bouton "Restaurer/Sync" pour forcer une mise à jour si nécessaire.

        return users.map((user: any) => ({
            ...user,
            _id: user._id.toString(),
            isBanned: !!user.isBanned,
            createdAt: user.createdAt?.toISOString(),
            updatedAt: user.updatedAt?.toISOString(),
        }));
    }, 60);
}

/**
 * Change le statut de certification d'un produit.
 */
export async function toggleProductCertification(productId: string, isCertified: boolean) {
    await requireAdmin();
    await Product.findByIdAndUpdate(productId, { isCertified });

    // Invalidation des caches pertinents
    await invalidateCache("admin:products:*");
    await invalidateCache("products_v2:*");

    revalidatePath("/admin");
    revalidatePath(`/product/${productId}`);
    revalidatePath("/");

    return { success: true };
}

/**
 * Génère un lien de téléchargement pour l'admin (audit).
 */
export async function getAdminDownloadUrl(productId: string) {
    await requireAdmin();
    const product = await Automation.findById(productId).lean();
    if (!product || !product.fileUrl) {
        throw new Error("Product or file not found.");
    }

    try {
        const fileKey = product.fileUrl.split('.com/')[1];
        const filename = `${product.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        const secureDownloadUrl = await getDownloadUrl(fileKey, filename);
        return { success: true, url: secureDownloadUrl };
    } catch (e) {
        console.error("Erreur génération lien S3 admin:", e);
        throw new Error("Failed to generate download URL.");
    }
}

/**
 * Change le rôle d'un utilisateur.
 */
export async function updateUserRole(userId: string, newRole: 'user' | 'admin') {
    await requireAdmin();
    await User.findOneAndUpdate({ clerkId: userId }, { role: newRole });
    await invalidateCache("admin:users:*");
    revalidatePath("/admin");
    return { success: true };
}

/**
 * Change le statut 'Banni' d'un utilisateur.
 */
export async function toggleBanUser(userId: string) {
    const admin = await requireAdmin();
    if (admin.clerkId === userId) {
        throw new Error("You cannot ban yourself.");
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) throw new Error("User not found.");

    user.isBanned = !user.isBanned;
    await user.save();

    await invalidateCache("admin:users:*");
    revalidatePath("/admin");
    return { success: true, isBanned: user.isBanned };
}

/**
 * Full Sync with Clerk. (C'est la fonction qui manquait !)
 */
export async function fullSyncWithClerk() {
    const admin = await requireAdmin();

    const { success } = await ratelimit.limit(`admin_sync_${admin.clerkId}`);
    if (!success) {
        throw new Error("Too many requests. Please try again later.");
    }
    const client = await clerkClient();
    let totalSynced = 0;
    const clerkIds = new Set<string>();

    let hasMore = true;
    let offset = 0;
    const limit = 100;

    while (hasMore) {
        const { data: clerkUsers, totalCount } = await client.users.getUserList({
            limit,
            offset,
        });

        if (clerkUsers.length === 0) {
            hasMore = false;
            break;
        }

        await Promise.all(clerkUsers.map(async (clerkUser) => {
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            clerkIds.add(clerkUser.id);

            await User.findOneAndUpdate(
                { clerkId: clerkUser.id },
                {
                    clerkId: clerkUser.id,
                    email: email,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                    imageUrl: clerkUser.imageUrl,
                    username: clerkUser.username,
                    $setOnInsert: {
                        role: 'user',
                        isBanned: false,
                        onboardingComplete: false
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            totalSynced++;
        }));

        offset += limit;
        if (offset >= totalCount) hasMore = false;
    }

    // Cleanup orphelins
    const localUsers = await User.find({}, "clerkId").lean();
    const idsToDelete = localUsers
        .filter(lu => !clerkIds.has(lu.clerkId))
        .map(lu => lu.clerkId);

    if (idsToDelete.length > 0) {
        await User.deleteMany({ clerkId: { $in: idsToDelete } });
    }

    await invalidateCache("admin:users:*");
    revalidatePath("/admin");
    return { success: true, count: totalSynced, deleted: idsToDelete.length };
}

/**
 * Supprime un utilisateur de manière COMPLÈTE.
 */
export async function deleteUser(userId: string) {
    const admin = await requireAdmin();

    const { success } = await ratelimit.limit(`admin_delete_${admin.clerkId}`);
    if (!success) {
        throw new Error("Too many requests. Please try again later.");
    }

    if (admin.clerkId === userId) throw new Error("You cannot delete yourself.");

    const user = await User.findOne({ clerkId: userId });
    if (!user) throw new Error("User not found in local database.");

    const client = await clerkClient();

    if (user.stripeConnectId) {
        try {
            await stripe.accounts.del(user.stripeConnectId);
        } catch (err) {
            console.error("Failed to delete Stripe account:", err);
        }
    }

    try {
        await client.users.deleteUser(userId);
    } catch (err) {
        console.error("Failed to delete Clerk user:", err);
    }

    try {
        await Product.deleteMany({ sellerId: userId });
        await Purchase.deleteMany({
            $or: [{ buyerId: userId }, { sellerId: userId }]
        });
    } catch (err) {
        console.error("Failed to delete related data:", err);
    }

    await User.findOneAndDelete({ clerkId: userId });

    await invalidateCache("admin:*");
    revalidatePath("/admin");
    return { success: true };
}