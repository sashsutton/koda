import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db";
import { redirect } from "next/navigation";
import User from "@/models/User";

/**
 * Ensures the user is authenticated and connects to the database.
 * Returns the userId if successful, otherwise redirects or throws.
 * Checks for BAN status.
 */
export async function requireAuth() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    await connectToDatabase();

    // Check if banned - only fetch the field we need
    let user = await User.findOne({ clerkId: userId as string }).select('isBanned').lean();

    // Lazy sync for requireAuth
    if (!user) {
        try {
            const { clerkClient } = await import("@clerk/nextjs/server");
            const client = await clerkClient();
            const clerkUser = await client.users.getUser(userId);

            if (clerkUser) {
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                // Create and return the user (we only need isBanned here)
                const newUser = await User.create({
                    clerkId: userId,
                    email: email,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                    imageUrl: clerkUser.imageUrl,
                    username: clerkUser.username,
                    role: 'user',
                    onboardingComplete: false
                });
                user = newUser as any;
            }
        } catch (error) {
            console.error("Failed to lazy-sync user in requireAuth:", error);
            // We don't throw here, we just proceed. If they really don't exist, other checks might fail later.
        }
    }
    if (user?.isBanned) {
        redirect("/banned");
    }

    return userId;
}

/**
 * Ensures the user is authenticated strictly (for API/Actions/Mutation).
 * Throws an error instead of redirecting (better for Try/Catch blocks).
 * Checks for BAN status.
 */
export async function requireUser() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("unauthorized");
    }

    await connectToDatabase();

    let user = await User.findOne({ clerkId: userId as string });

    // Lazy sync: If user is authenticated in Clerk but not in DB, create them now.
    if (!user) {
        try {
            const { clerkClient } = await import("@clerk/nextjs/server");
            const client = await clerkClient();
            const clerkUser = await client.users.getUser(userId);

            if (clerkUser) {
                const email = clerkUser.emailAddresses[0]?.emailAddress;
                user = await User.create({
                    clerkId: userId,
                    email: email,
                    firstName: clerkUser.firstName,
                    lastName: clerkUser.lastName,
                    imageUrl: clerkUser.imageUrl,
                    username: clerkUser.username,
                    role: 'user',
                    onboardingComplete: false
                });
            }
        } catch (error) {
            console.error("Failed to lazy-sync user:", error);
            throw new Error("userNotFound");
        }
    }

    if (!user) {
        throw new Error("userNotFound");
    }

    if (user.isBanned) {
        throw new Error("accountSuspended");
    }

    return user;
}

/**
 * Ensures the user is authenticated AND is an admin.
 */
export async function requireAdmin() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId as string });

    if (!user || user.role !== 'admin') {
        redirect("/");
    }

    if (user.isBanned) {
        redirect("/banned");
    }

    return user;
}
