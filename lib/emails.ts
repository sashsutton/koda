import { resend } from './resend';

const APP_NAME = "Koda Market";
const FROM_EMAIL = "Koda Market <onboarding@resend.dev>";

interface OrderItem {
    title: string;
    price: number;
}

/**
 * Sends a confirmation email to the buyer
 */
export async function sendBuyerEmail(email: string, products: OrderItem[], total: number) {
    try {
        const productListHtml = products.map(p => `
            <div style="padding: 12px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                <span style="font-weight: bold; color: #111;">${p.title}</span>
                <span style="color: #666;">${p.price.toFixed(2)} €</span>
            </div>
        `).join('');

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: `Merci pour votre achat sur ${APP_NAME} !`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #1a1a1a;">Merci pour votre commande !</h1>
                    <p style="color: #444; line-height: 1.6;">Nous avons bien reçu votre paiement. Voici le récapitulatif de votre commande :</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        ${productListHtml}
                        <div style="padding-top: 12px; font-size: 18px; font-weight: 900; display: flex; justify-content: space-between; color: #000;">
                            <span>Total</span>
                            <span>${total.toFixed(2)} €</span>
                        </div>
                    </div>

                    <p style="color: #444; line-height: 1.6;">Vous pouvez accéder à vos produits directement depuis votre dashboard :</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Accéder à mes produits</a>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} ${APP_NAME}. Tous droits réservés.</p>
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
 * Sends a notification email to the seller
 */
export async function sendSellerEmail(email: string, productTitle: string, amount: number) {
    try {
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: `Nouvelle vente sur ${APP_NAME} ! 🎉`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h1 style="color: #1a1a1a;">Félicitations ! 🎉</h1>
                    <p style="color: #444; line-height: 1.6;">Vous venez de réaliser une nouvelle vente sur ${APP_NAME}.</p>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
                        <p style="margin: 0; font-size: 14px; color: #166534; font-weight: bold;">Produit vendu :</p>
                        <p style="margin: 4px 0 12px 0; font-size: 18px; font-weight: 900; color: #111;">${productTitle}</p>
                        
                        <p style="margin: 0; font-size: 14px; color: #166534; font-weight: bold;">Montant crédité (après frais) :</p>
                        <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: 900; color: #166534;">${amount.toFixed(2)} €</p>
                    </div>

                    <p style="color: #444; line-height: 1.6;">Le transfert vers votre compte Stripe Connect a été initié automatiquement.</p>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Voir mes ventes</a>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="font-size: 12px; color: #888; text-align: center;">&copy; ${new Date().getFullYear()} ${APP_NAME}. Tous droits réservés.</p>
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
