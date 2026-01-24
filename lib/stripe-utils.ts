import { IUser } from "@/models/User";

/**
 * Utility functions for Stripe-related business logic.
 */

/**
 * Checks if a user is ready to sell on Koda.
 * A user must have a Stripe Connect ID and have completed the onboarding.
 * @param user The Mongoose user document
 */
export function isSellerReady(user: IUser): boolean {
    return !!(user.stripeConnectId && user.onboardingComplete);
}

/**
 * Validates seller requirements and throws a user-friendly error if not met.
 * @param user The Mongoose user document
 */
export function ensureSellerIsReady(user: IUser): void {
    if (!isSellerReady(user)) {
        throw new Error("Please configure your payment account in the Dashboard before selling.");
    }
}
