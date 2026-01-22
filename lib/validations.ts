import { z } from "zod";
import { ProductCategory } from "@/types/product";
import { AutomationPlatform } from "@/types/automation";

// Schéma pour la création d'une automation
export const AutomationSchema = z.object({
    title: z
        .string()
        .min(3, "Le titre doit contenir au moins 3 caractères.")
        .max(100, "Le titre ne peut pas dépasser 100 caractères."),

    description: z
        .string()
        .min(20, "La description doit être détaillée (min 20 caractères).")
        .max(2000, "Description trop longue (max 2000 caractères)."),

    price: z
        .number()
        .min(1, "Le prix minimum est de 1€.")
        .max(1000, "Le prix maximum est de 1000€."),

    category: z.nativeEnum(ProductCategory),

    platform: z.enum(["n8n", "Make", "Zapier", "Python", "Other"] as const),

    tags: z.array(z.string()).default([]),

    fileUrl: z.string().url("L'URL du fichier est invalide."),

    previewImageUrl: z
        .string()
        .url("L'URL de l'image est invalide.")
        .optional()
        .or(z.literal("")),

    version: z.string().optional(),
});

// Type inféré à partir du schéma
export type AutomationInput = z.infer<typeof AutomationSchema>;

// Schéma d'update (partiel possible)
export const UpdateAutomationSchema = AutomationSchema.pick({
    title: true,
    description: true,
    price: true,
    previewImageUrl: true
}).partial({
    previewImageUrl: true
});

// Legacy export for backward compatibility (to be removed later)
export const ProductSchema = AutomationSchema;
export type ProductInput = AutomationInput;
