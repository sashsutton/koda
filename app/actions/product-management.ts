import { requireUser } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";
import { UpdateAutomationSchema } from "@/lib/validations";
import Automation from "@/models/Automation";
import { invalidateCache } from "@/lib/cache-utils";

export async function deleteProduct(productId: string) {
    try {
        const user = await requireUser();

        const product = await Product.findOne({ _id: productId });

        if (!product) {
            throw new Error("Product not found");
        }

        if (product.sellerId !== user.clerkId) {
            throw new Error("You are not authorized to delete this product");
        }

        await Product.deleteOne({ _id: productId });

        // Invalidate cache for product listings
        await invalidateCache("products_v2:*");

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
}

/**
 * Met à jour un produit (titre, description, prix, image).
 */
export async function updateProduct(productId: string, data: { title: string; description: string; price: number; previewImageUrl?: string }) {
    const user = await requireUser();

    // Validation Zod (Partielle car on ne valide que les champs reçus)
    const validationResult = UpdateAutomationSchema.safeParse(data);

    if (!validationResult.success) {
        throw new Error(validationResult.error.issues[0].message);
    }

    const validData = validationResult.data;

    await connectToDatabase();

    const product = await Automation.findOne({ _id: productId });

    if (!product) throw new Error("Product not found");
    if (product.sellerId !== user.clerkId) throw new Error("Unauthorized");

    product.title = validData.title;
    product.description = validData.description;
    product.price = validData.price;
    if (validData.previewImageUrl) {
        product.previewImageUrl = validData.previewImageUrl;
    }

    await product.save();

    await invalidateCache("products_v2:*");

    revalidatePath("/dashboard");
    return { success: true };
}