import { describe, it, expect, vi, beforeEach } from "vitest";
import { getSavedCart, syncCart } from "@/app/actions/cart";
import { requireUser } from "@/lib/auth-utils";
import User from "@/models/User";

// Mocks
vi.mock("@/lib/auth-utils", () => ({
    requireUser: vi.fn(),
}));

vi.mock("@/models/User", () => ({
    default: {
        findOne: vi.fn(),
    }
}));

vi.mock("@/models/Automation", () => ({
    default: {}
}));

describe("cart actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getSavedCart", () => {
        it("should return empty array if user has no cart", async () => {
            const mockUser = {
                populate: vi.fn().mockResolvedValue({}),
                cart: []
            };
            vi.mocked(requireUser).mockResolvedValue(mockUser as any);

            const result = await getSavedCart();
            expect(result).toEqual([]);
            expect(mockUser.populate).toHaveBeenCalledWith("cart");
        });

        it("should return formatted cart items", async () => {
            const mockItem = {
                _id: "id_123",
                createdAt: new Date("2023-01-01"),
                sellerId: "seller_123",
                category: "Social Media",
                title: "Test Automation"
            };
            const mockUser = {
                populate: vi.fn().mockResolvedValue({}),
                cart: [mockItem]
            };
            vi.mocked(requireUser).mockResolvedValue(mockUser as any);

            const result = await getSavedCart();
            expect(result).toHaveLength(1);
            expect(result[0]._id).toBe("id_123");
            expect(result[0].category).toBe("Social Media");
        });
    });

    describe("syncCart", () => {
        it("should update user cart with product IDs", async () => {
            const mockUser = {
                cart: [],
                save: vi.fn().mockResolvedValue({})
            };
            vi.mocked(requireUser).mockResolvedValue(mockUser as any);
            const items = [{ _id: "id_1" }, { _id: "id_2" }] as any;

            await syncCart(items);

            expect(mockUser.cart).toEqual(["id_1", "id_2"]);
            expect(mockUser.save).toHaveBeenCalled();
        });
    });
});
