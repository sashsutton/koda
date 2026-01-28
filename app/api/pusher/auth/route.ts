import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { pusherServer } from "@/lib/pusher-server";

/**
 * Pusher authentication endpoint for private channels
 * Authenticates users before allowing them to subscribe to private channels
 */
export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.text();
        const params = new URLSearchParams(body);
        const socketId = params.get("socket_id");
        const channelName = params.get("channel_name");

        if (!socketId || !channelName) {
            return NextResponse.json(
                { error: "Missing socket_id or channel_name" },
                { status: 400 }
            );
        }

        // Verify the user has access to this private channel
        // Channel naming convention: private-user-{userId} or private-conversation-{conversationId}
        if (channelName.startsWith("private-user-")) {
            const channelUserId = channelName.replace("private-user-", "");
            if (channelUserId !== userId) {
                return NextResponse.json(
                    { error: "Forbidden: Cannot access another user's channel" },
                    { status: 403 }
                );
            }
        }
        // For conversation channels, we could add additional verification
        // to check if the user is a participant in the conversation

        // Authenticate the user for this channel
        const authResponse = pusherServer.authorizeChannel(socketId, channelName);

        return NextResponse.json(authResponse);
    } catch (error) {
        console.error("Pusher auth error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
