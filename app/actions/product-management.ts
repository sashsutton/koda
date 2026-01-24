import { requireUser } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { revalidatePath } from "next/cache";
import { UpdateAutomationSchema } from "@/lib/validations";
import Automation from "@/models/Automation";

export async function deleteProduct(productId: string) {
    try {
        const userId = await requireUser();

        const product = await Product.findOne({ _id: productId });

        if (!product) {
            throw new Error("Produit introuvable");
        }

        if (product.sellerId !== userId) {
            throw new Error("Vous n'êtes pas autorisé à supprimer ce produit");
        }

        await Product.deleteOne({ _id: productId });

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
    const userId = await requireUser();

    // Validation Zod (Partielle car on ne valide que les champs reçus)
    const validationResult = UpdateAutomationSchema.safeParse(data);

    if (!validationResult.success) {
        throw new Error(validationResult.error.issues[0].message);
    }

    const validData = validationResult.data;

    await connectToDatabase();

    const product = await Automation.findOne({ _id: productId });

    if (!product) throw new Error("Produit introuvable");
    if (product.sellerId !== userId) throw new Error("Non autorisé");

    product.title = validData.title;
    product.description = validData.description;
    product.price = validData.price;
    if (validData.previewImageUrl) {
        product.previewImageUrl = validData.previewImageUrl;
    }

    await product.save();

    revalidatePath("/dashboard");
    return { success: true };
}