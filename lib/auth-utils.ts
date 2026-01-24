import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Ensures the user is authenticated and connects to the database.
 * Returns the userId if successful, otherwise redirects or throws.
 */
export async function requireAuth() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    await connectToDatabase();

    return userId;
}

/**
 * Ensures the user is authenticated strictly (for API/Actions/Mutation).
 * Throws an error instead of redirecting (better for Try/Catch blocks).
 */
export async function requireUser() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized: User is declared but not authenticated");
    }

    await connectToDatabase();

    return userId;
}
