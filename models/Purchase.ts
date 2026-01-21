import mongoose, { Schema, model, models } from 'mongoose';

const PurchaseSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Automation', required: true },
    buyerId: { type: String, required: true }, // ID Clerk de l'acheteur
    sellerId: { type: String, required: true }, // ID Clerk du vendeur
    amount: { type: Number, required: true },
    stripeSessionId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
});

const Purchase = models.Purchase || model('Purchase', PurchaseSchema);
export default Purchase;