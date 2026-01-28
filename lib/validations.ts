import { z } from "zod";
import { ProductCategory } from "@/types/product";
import { AutomationPlatform } from "@/types/automation";

/**
 * Base schema for automation products (blueprints).
 */
export const ProductSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters.")
        .max(100, "Title cannot exceed 100 characters."),

    description: z
        .string()
        .min(20, "Description must be at least 20 characters.")
        .max(2000, "Description cannot exceed 2000 characters."),

    price: z
        .number()
        .min(1, "Minimum price is 1€.")
        .max(1000, "Maximum price is 1000€."),

    category: z.nativeEnum(ProductCategory),

    platform: z.enum(["n8n", "Make", "Zapier", "Python", "Other"] as const),

    tags: z.array(z.string()).default([]),

    fileUrl: z.string().url("Invalid file URL."),

    previewImageUrl: z
        .string()
        .url("Invalid image URL.")
        .optional(),

    version: z.string().optional().or(z.literal("")),
});

export type ProductInput = z.infer<typeof ProductSchema>;

/**
 * Schema for updating an existing product.
 */
export const UpdateProductSchema = ProductSchema.pick({
    title: true,
    description: true,
    price: true,
    previewImageUrl: true,
    category: true,
    platform: true,
    tags: true,
    version: true,
}).partial();

// Compatibility aliases
export const AutomationSchema = ProductSchema;
export type AutomationInput = ProductInput;
export const UpdateAutomationSchema = UpdateProductSchema;
