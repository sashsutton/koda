import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    senderId: string; // Clerk ID
    content: string;
    read: boolean;
    createdAt: Date;
}

const MessageSchema = new mongoose.Schema(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
        senderId: { type: String, required: true },
        content: { type: String, required: true, maxlength: 2000 },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Index to quickly fetch messages of a conversation
MessageSchema.index({ conversationId: 1, createdAt: 1 });

const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
