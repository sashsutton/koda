
import fs from 'fs';
import path from 'path';
import { Stripe } from 'stripe';

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
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-01-27.acacia' as any
});

async function checkStatus() {
    try {
        console.log("Connecting to database...");
        const { connectToDatabase } = await import("../lib/db");
        const { default: User } = await import("../models/User");
        await connectToDatabase();

        // Find the admin user first just to see
        const email = process.argv[2];
        if (!email) {
            console.error("Usage: npx tsx scripts/check-stripe-status.ts <email>");
            process.exit(1);
        }

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User ${email} not found in DB.`);
            process.exit(1);
        }

        console.log(`Checking Stripe Status for user: ${user.email}`);
        console.log(`Current DB Status: onboardingComplete=${user.onboardingComplete}, stripeConnectId=${user.stripeConnectId}`);

        if (!user.stripeConnectId) {
            console.error("User has no Stripe Connect ID.");
            process.exit(1);
        }

        const account = await stripe.accounts.retrieve(user.stripeConnectId);
        console.log(`\n--- Stripe Account Details ---`);
        console.log(`ID: ${account.id}`);
        console.log(`Details Submitted: ${account.details_submitted}`);
        console.log(`Charges Enabled: ${account.charges_enabled}`);
        console.log(`Payouts Enabled: ${account.payouts_enabled}`);

        const isComplete = account.details_submitted && account.charges_enabled;

        if (isComplete && !user.onboardingComplete) {
            console.log(`\nMISMATCH DETECTED: Stripe says complete, DB says incomplete.`);
            console.log(`Updating DB...`);
            user.onboardingComplete = true;
            await user.save();
            console.log(`✅ User updated!`);
        } else if (!isComplete) {
            console.log(`\nStripe account is NOT fully ready.`);
            if (!account.details_submitted) console.log("- Details not submitted");
            if (!account.charges_enabled) console.log("- Charges not enabled (might need review)");
        } else {
            console.log(`\nData is in sync (Complete).`);
        }

        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkStatus();
