import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

/**
 * Get the current authenticated user from database
 */
export async function getCurrentUser() {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized: Please sign in");
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

/**
 * Require admin access - throws error if user is not admin
 */
export async function requireAdmin() {
    const user = await getCurrentUser();

    if (user.role !== 'admin') {
        throw new Error("Unauthorized: Admin access required");
    }

    return user;
}

/**
 * Check if current user is admin (returns boolean, doesn't throw)
 */
export async function isAdmin(): Promise<boolean> {
    try {
        const user = await getCurrentUser();
        return user.role === 'admin';
    } catch {
        return false;
    }
}
