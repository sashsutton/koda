"use server";

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import Automation from "@/models/Automation";
import User from "@/models/User"; // Import du modèle User
import { revalidatePath } from "next/cache";
import { CreateAutomationInput } from "@/types/automation";

export async function createAutomation(formData: CreateAutomationInput) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Vous devez être connecté pour vendre un produit.");
    }

    await connectToDatabase();

    // VÉRIFICATION STRIPE CONNECT
    const userDoc = await User.findOne({ clerkId: userId });

    if (!userDoc || !userDoc.stripeConnectId || !userDoc.onboardingComplete) {
        throw new Error("Veuillez configurer votre compte de paiement dans le Dashboard avant de vendre.");
    }

    // Création du produit uniquement si le compte Stripe est prêt
    const newAutomation = await Automation.create({
        ...formData,
        sellerId: userId,
    });

    revalidatePath("/");
    return { success: true, id: newAutomation._id.toString() };
}