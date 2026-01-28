import { resend } from './resend';

const APP_NAME = "Koda Market";
const FROM_EMAIL = "Koda Market <onboarding@resend.dev>";

interface OrderItem {
    title: string;
    price: number;
}

/**
 * Sends a confirmation email to the buyer with Stripe receipt
 */
export async function sendBuyerEmail(
    email: string,
    products: OrderItem[],
    total: number,
    stripeReceiptUrl?: string
) {
    try {
        const productListHtml = products.map(p => `
            <div style="padding: 12px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                <span style="font-weight: bold; color: #111;">${p.title}</span>
                <span style="color: #666;">${p.price.toFixed(2)} €</span>
            </div>
        `).join('');

        const receiptButton = stripeReceiptUrl ? `
            <a href="${stripeReceiptUrl}" style="display: inline-block; background: #635bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 10px 10px 0;">
                📄 View Stripe Receipt
            </a>
        ` : '';

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: `Thank you for your purchase on ${APP_NAME}! 🎉`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #1a1a1a;">Thank you for your order! 🎉</h1>
                    <p style="color: #444; line-height: 1.6;">Your payment has been successfully processed. Here's a summary of your purchase:</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0 0 12px 0; color: #111;">Order Summary</h3>
                        ${productListHtml}
                        <div style="padding-top: 12px; font-size: 18px; font-weight: 900; display: flex; justify-content: space-between; color: #000;">
                            <span>Total</span>
                            <span>${total.toFixed(2)} €</span>
                        </div>
                    </div>

                    <p style="color: #444; line-height: 1.6;">You can access your purchased products from your dashboard:</p>
                    
                    <div style="margin: 20px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Access My Products
                        </a>
                        ${receiptButton}
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend Error (Buyer):", error);
        }
        return { data, error };
    } catch (err) {
        console.error("Failed to send buyer email:", err);
    }
}

/**
 * Sends a notification email to the seller for THEIR product only
 * This is called once per product, so each seller only sees their own sales
 */
export async function sendSellerEmail(email: string, productTitle: string, amount: number) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: `New sale on ${APP_NAME}! 🎉`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #1a1a1a;">Congratulations! 🎉</h1>
                    <p style="color: #444; line-height: 1.6;">You just made a new sale on ${APP_NAME}!</p>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
                        <p style="margin: 0; font-size: 14px; color: #166534; font-weight: bold;">Product Sold:</p>
                        <p style="margin: 4px 0 12px 0; font-size: 18px; font-weight: 900; color: #111;">${productTitle}</p>
                        
                        <p style="margin: 0; font-size: 14px; color: #166534; font-weight: bold;">Amount Credited (after 15% platform fee):</p>
                        <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: 900; color: #166534;">${amount.toFixed(2)} €</p>
                        <p style="margin: 8px 0 0 0; font-size: 12px; color: #166534;">The transfer to your Stripe Connect account has been initiated automatically.</p>
                    </div>

                    <p style="color: #444; line-height: 1.6;">View your sales and earnings in your dashboard:</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard?mode=seller" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">View My Sales</a>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
                </div>
            `,
        });

        if (error) {
            console.error("Resend Error (Seller):", error);
        }
        return { data, error };
    } catch (err) {
        console.error("Failed to send seller email:", err);
    }
}
