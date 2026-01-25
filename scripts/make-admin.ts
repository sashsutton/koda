import fs from 'fs';
import path from 'path';


// 1. Manually load .env.local to avoid shell complexity and dependency issues
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    console.log("Loading environment from .env.local...");
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
}

const identifier = process.argv[2]; // Can be email OR clerkId
const emailToSet = process.argv[3]; // Optional: set this email if missing

async function makeAdmin() {
    try {
        console.log("Connecting to database...");
        const { connectToDatabase } = await import("../lib/db");
        const { default: User } = await import("../models/User");
        await connectToDatabase();

        if (!identifier) {
            console.log("\n--- Debug: Raw User Data (No Email Found) ---");
            const allUsers = await User.find({}, 'clerkId email role stripeConnectId');
            if (allUsers.length === 0) {
                console.log("No users found in database.");
            } else {
                console.table(allUsers.map(u => ({
                    id: u._id.toString(),
                    clerkId: u.clerkId,
                    email: u.email || 'MISSING',
                    role: u.role || 'user'
                })));
                console.log("\nUsage: npx tsx scripts/make-admin.ts <clerkId_OR_email> [email_to_assign]");
                console.log("Example: npx tsx scripts/make-admin.ts user_123xyz myemail@test.com");
            }
            process.exit(1);
        }

        console.log(`Finding user with identifier: ${identifier}`);

        // Try finding by email OR clerkId OR _id
        let user = await User.findOne({
            $or: [
                { email: identifier },
                { clerkId: identifier },
                { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }
            ]
        });

        if (!user) {
            console.log(`User not found.`);

            // Check if we have enough info to create the user
            const isClerkId = identifier.startsWith('user_');
            const isEmail = identifier.includes('@');

            const clerkId = isClerkId ? identifier : null;
            const email = isEmail ? identifier : emailToSet;

            if (clerkId && email) {
                console.log(`Creating new user with Clerk ID: ${clerkId} and Email: ${email}`);
                user = new User({
                    clerkId,
                    email,
                    role: 'admin'
                });
                await user.save();
                console.log(`✅ Success! Created new ADMIN user: ${email} (${clerkId})`);
                process.exit(0);
            } else {
                console.error(`❌ User not found and insufficient info to create one.`);
                console.error(`To create a NEW admin user, provide both Clerk ID and Email:`);
                console.error(`Usage: npx tsx scripts/make-admin.ts <clerkId> <email>`);
                process.exit(1);
            }
        }

        console.log(`Found user: ${user.clerkId}`);

        // If specific email provided, update it
        if (emailToSet) {
            console.log(`Updating email to: ${emailToSet}`);
            user.email = emailToSet;
        }

        user.role = 'admin';
        await user.save();

        console.log(`✅ Success! User ${user.email} (${user.clerkId}) is now an ADMIN.`);
        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

makeAdmin();
