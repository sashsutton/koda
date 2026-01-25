import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAuth, requireUser, requireAdmin } from "@/lib/auth-utils";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import User from "@/models/User";

// Mocks
vi.mock("@clerk/nextjs/server", () => ({
    auth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    connectToDatabase: vi.fn(),
}));

vi.mock("@/models/User", () => ({
    default: {
        findOne: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                lean: vi.fn(),
            }),
        }),
    },
}));

describe("auth-utils", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("requireAuth", () => {
        it("should redirect to /sign-in if no userId", async () => {
            vi.mocked(auth).mockResolvedValue({ userId: null } as any);
            await requireAuth();
            expect(redirect).toHaveBeenCalledWith("/sign-in");
        });

        it("should redirect to /banned if user is banned", async () => {
            vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
            const mockUser = { isBanned: true };
            vi.mocked(User.findOne).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue(mockUser),
                }),
            } as any);

            await requireAuth();
            expect(redirect).toHaveBeenCalledWith("/banned");
        });

        it("should return userId if authenticated and not banned", async () => {
            vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
            vi.mocked(User.findOne).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    lean: vi.fn().mockResolvedValue({ isBanned: false }),
                }),
            } as any);

            const result = await requireAuth();
            expect(result).toBe("user_123");
        });
    });

    describe("requireUser", () => {
        it("should throw error if no userId", async () => {
            vi.mocked(auth).mockResolvedValue({ userId: null } as any);
            await expect(requireUser()).rejects.toThrow("Unauthorized: User is declared but not authenticated");
        });

        it("should throw error if user not found", async () => {
            vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
            vi.mocked(User.findOne).mockResolvedValue(null);
            await expect(requireUser()).rejects.toThrow("User not found");
        });

        it("should throw error if user is banned", async () => {
            vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
            vi.mocked(User.findOne).mockResolvedValue({ isBanned: true });
            await expect(requireUser()).rejects.toThrow("Access Denied: Your account has been suspended.");
        });

        it("should return user if everything is OK", async () => {
            vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
            const mockUser = { clerkId: "user_123", isBanned: false };
            vi.mocked(User.findOne).mockResolvedValue(mockUser);

            const result = await requireUser();
            expect(result).toEqual(mockUser);
        });
    });

    describe("requireAdmin", () => {
        it("should redirect to /sign-in if no userId", async () => {
            vi.mocked(auth).mockResolvedValue({ userId: null } as any);
            await requireAdmin();
            expect(redirect).toHaveBeenCalledWith("/sign-in");
        });

        it("should redirect to / if not admin", async () => {
            vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
            vi.mocked(User.findOne).mockResolvedValue({ role: "user" });
            await requireAdmin();
            expect(redirect).toHaveBeenCalledWith("/");
        });

        it("should return user if admin and not banned", async () => {
            vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);
            const mockAdmin = { clerkId: "user_123", role: "admin", isBanned: false };
            vi.mocked(User.findOne).mockResolvedValue(mockAdmin);

            const result = await requireAdmin();
            expect(result).toEqual(mockAdmin);
        });
    });
});
