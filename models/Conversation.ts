import mongoose, { Schema, Document, Model } from "mongoose";

export interface IConversation extends Document {
    participants: string[]; // Clerk IDs
    lastMessage: string;
    lastMessageAt: Date;
    updatedAt: Date;
    createdAt: Date;
}

const ConversationSchema = new mongoose.Schema(
    {
        participants: { type: [String], required: true }, // [buyerId, sellerId]
        lastMessage: { type: String, default: "" },
        lastMessageAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Index compound to easily find conversation between two people
ConversationSchema.index({ participants: 1 });

const Conversation: Model<IConversation> =
    mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
