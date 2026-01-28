import PusherClient from "pusher-js";

// Singleton client-side Pusher instance
let pusherClient: PusherClient | null = null;

export const getPusherClient = () => {
    if (!pusherClient) {
        pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
            authEndpoint: "/api/pusher/auth",
        });
    }
    return pusherClient;
};
