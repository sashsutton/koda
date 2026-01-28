"use server";

import { requireAdmin } from "@/lib/admin-utils";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export interface UserFilters {
    role?: 'all' | 'user' | 'admin';
    status?: 'all' | 'active' | 'banned';
    sellerStatus?: 'all' | 'sellers' | 'non-sellers';
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface FilteredUser {
    clerkId: string;
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    role: 'user' | 'admin';
    isBanned: boolean;
    isSeller: boolean;
    createdAt: Date;
}

/**
 * Get users based on filter criteria (admin only)
 */
export async function getFilteredUsers(filters: UserFilters): Promise<FilteredUser[]> {
    await requireAdmin();
    await connectToDatabase();

    const query: any = {};

    // Filter by role
    if (filters.role === 'user') {
        query.role = 'user';
    } else if (filters.role === 'admin') {
        query.role = 'admin';
    }

    // Filter by ban status
    if (filters.status === 'active') {
        query.isBanned = false;
    } else if (filters.status === 'banned') {
        query.isBanned = true;
    }

    // Filter by seller status
    if (filters.sellerStatus === 'sellers') {
        query.stripeConnectId = { $exists: true, $ne: null };
    } else if (filters.sellerStatus === 'non-sellers') {
        query.$or = [
            { stripeConnectId: { $exists: false } },
            { stripeConnectId: null }
        ];
    }

    // Filter by creation date
    if (filters.createdAfter || filters.createdBefore) {
        query.createdAt = {};
        if (filters.createdAfter) {
            query.createdAt.$gte = filters.createdAfter;
        }
        if (filters.createdBefore) {
            query.createdAt.$lte = filters.createdBefore;
        }
    }

    const users = await User.find(query)
        .select('clerkId email username firstName lastName role isBanned stripeConnectId createdAt')
        .lean();

    return users.map(user => ({
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isBanned: user.isBanned,
        isSeller: !!user.stripeConnectId,
        createdAt: user.createdAt
    }));
}

/**
 * Get count of users matching filters (for preview)
 */
export async function getFilteredUsersCount(filters: UserFilters): Promise<number> {
    await requireAdmin();
    await connectToDatabase();

    const query: any = {};

    if (filters.role === 'user') query.role = 'user';
    else if (filters.role === 'admin') query.role = 'admin';

    if (filters.status === 'active') query.isBanned = false;
    else if (filters.status === 'banned') query.isBanned = true;

    if (filters.sellerStatus === 'sellers') {
        query.stripeConnectId = { $exists: true, $ne: null };
    } else if (filters.sellerStatus === 'non-sellers') {
        query.$or = [
            { stripeConnectId: { $exists: false } },
            { stripeConnectId: null }
        ];
    }

    if (filters.createdAfter || filters.createdBefore) {
        query.createdAt = {};
        if (filters.createdAfter) query.createdAt.$gte = filters.createdAfter;
        if (filters.createdBefore) query.createdAt.$lte = filters.createdBefore;
    }

    return await User.countDocuments(query);
}
