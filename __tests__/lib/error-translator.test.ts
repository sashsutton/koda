import { describe, it, expect } from "vitest";
import { getErrorKey } from "@/lib/error-translator";

describe("getErrorKey", () => {
    it("should return exact match transition key", () => {
        expect(getErrorKey("Unauthorized")).toBe("unauthorized");
        expect(getErrorKey("User not found.")).toBe("userNotFound");
    });

    it("should return partial match for dynamic messages", () => {
        expect(getErrorKey("Error: Unauthorized access detected")).toBe("unauthorized");
        expect(getErrorKey("The cart is empty. Please add items.")).toBe("cartEmpty");
    });

    it("should return genericError for unknown messages", () => {
        expect(getErrorKey("Something completely unknown happened")).toBe("genericError");
    });

    it("should handle empty or null messages gracefully", () => {
        expect(getErrorKey("")).toBe("genericError");
    });
});
