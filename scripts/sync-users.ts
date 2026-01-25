
import fs from 'fs';
import path from 'path';

// 1. Load env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log("Loading environment from .env.local...");
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });

    // Double check important keys
    if (process.env.CLERK_SECRET_KEY) {
        console.log("Verified CLERK_SECRET_KEY is present.");
    } else {
        console.error("WARNING: CLERK_SECRET_KEY not found in .env.local parsing.");
    }
}

async function syncUsers() {
    try {
        console.log("Connecting to database...");
        const { connectToDatabase } = await import("../lib/db");
        const { default: User } = await import("../models/User");
        await connectToDatabase();

        console.log("Fetching users from Clerk...");
        // Dynamic import to ensure env is ready
        const { createClerkClient } = await import("@clerk/backend");
        const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

        let totalSynced = 0;
        let hasMore = true;
        let offset = 0;
        const limit = 100;

        while (hasMore) {
            const { data: clerkUsers, totalCount } = await client.users.getUserList({
                limit,
                offset,
            });

            if (clerkUsers.length === 0) {
                hasMore = false;
                break;
            }

            console.log(`Processing batch of ${clerkUsers.length} users...`);

            await Promise.all(clerkUsers.map(async (clerkUser) => {
                const email = clerkUser.emailAddresses[0]?.emailAddress;

                await User.findOneAndUpdate(
                    { clerkId: clerkUser.id },
                    {
                        clerkId: clerkUser.id,
                        email: email,
                        firstName: clerkUser.firstName,
                        lastName: clerkUser.lastName,
                        imageUrl: clerkUser.imageUrl,
                        username: clerkUser.username,
                        $setOnInsert: {
                            role: 'user',
                            isBanned: false,
                            onboardingComplete: false
                        }
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                totalSynced++;
            }));

            offset += limit;
            if (offset >= totalCount) hasMore = false;
        }

        console.log(`✅ Successfully synced ${totalSynced} users from Clerk to MongoDB.`);
        process.exit(0);

    } catch (error) {
        console.error("Error syncing users:", error);
        process.exit(1);
    }
}

syncUsers();
