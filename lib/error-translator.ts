/**
 * Utility to map backend English error messages to translation keys.
 * This allows developers to keep backend code in English while showing localized errors to users.
 */

const ERROR_MAP: Record<string, string> = {
    "Unauthorized": "unauthorized",
    "User not found.": "userNotFound",
    "User not found": "userNotFound",
    "You cannot ban yourself.": "cannotBanSelf",
    "You must be logged in to performing this action.": "mustBeLoggedIn",
    "You must be logged in to sell a product.": "mustBeLoggedIn",
    "Access Denied: Your account has been suspended.": "accountSuspended",
    "Please configure your payment account in the Dashboard before selling.": "configureStripe",
    "Product not found": "productNotFound",
    "You are not authorized to delete this product": "notAuthorizedToDelete",
    "The cart is empty.": "cartEmpty",
    "No valid products found in the database.": "noValidProducts",
    "The seller has not configured their payments.": "sellerStripeNotConfigured",
    "Please check the form fields.": "checkFormFields",
    "An error occurred while sending. Please try again later.": "sendingError",
    "Could not configure Stripe at the moment. Please verify that your platform account is active.": "stripeError",
    "Could not access the Stripe dashboard.": "stripeDashboardError",
    "File upload failed.": "fileUploadFailed",
    "Upload error": "fileUploadFailed",
    "An error occurred during payment preparation.": "paymentError",
    "An error occurred while preparing the payment.": "paymentError",
    "Sent successfully!": "reviewSuccess",
    "Server error.": "serverError",
};

/**
 * Returns the translation key for a given error message.
 * If no mapping exists, returns a generic fallback or the original message.
 */
export function getErrorKey(message: string): string {
    // Exact match
    if (ERROR_MAP[message]) return ERROR_MAP[message];

    // Partial match (e.g., for messages with dynamic parts)
    for (const [key, value] of Object.entries(ERROR_MAP)) {
        if (message.includes(key)) return value;
    }

    return "genericError"; // Fallback key
}
