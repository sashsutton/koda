"use server";

import { requireUser } from "@/lib/auth-utils";
import { connectToDatabase } from "@/lib/db";
import Automation from "@/models/Automation";
import User from "@/models/User";
import { revalidatePath } from "next/cache";
import { ensureSellerIsReady } from "@/lib/stripe-utils";
import { CreateAutomationInput } from "@/types/automation";
import { ProductSchema } from "@/lib/validations";
import { ratelimit } from "@/lib/ratelimit";

export async function createAutomation(formData: CreateAutomationInput) {
    const user = await requireUser();

    // RATE LIMITING
    const { success } = await ratelimit.limit(`create_automation_${user.clerkId}`);
    if (!success) {
        throw new Error("Too many requests. Please try again later.");
    }

    // Sanitize empty strings to undefined
    const sanitizedData = {
        ...formData,
        previewImageUrl: formData.previewImageUrl?.trim() || undefined,
        version: formData.version?.trim() || undefined,
    };

    // Validation Zod
    const validationResult = ProductSchema.safeParse(sanitizedData);

    if (!validationResult.success) {
        // On renvoie la première erreur trouvée pour simplifier l'affichage
        const firstError = validationResult.error.issues[0];
        throw new Error(`${firstError.path.join('.')}: ${firstError.message}`);
    }

    const validData = validationResult.data;

    try {
        await connectToDatabase();

        // NOTE: Removed Stripe validation to allow product creation before Stripe setup
        // Users can set up Stripe later in their dashboard
        // Products will be created but payments won't work until Stripe is configured

        // Création du produit
        const newAutomation = await Automation.create({
            ...validData,
            sellerId: user.clerkId,
        });

        revalidatePath("/");
        return { success: true, id: newAutomation._id.toString() };
    } catch (error) {
        console.error("Error creating automation:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to create product. Please try again.");
    }
}