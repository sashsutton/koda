import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOrSetCache, invalidateCache } from "@/lib/cache-utils";
import { Redis } from "@upstash/redis";

// Mock @upstash/redis
vi.mock("@upstash/redis", () => {
    return {
        Redis: {
            fromEnv: vi.fn().mockReturnValue({
                get: vi.fn(),
                set: vi.fn(),
                keys: vi.fn(),
                del: vi.fn(),
            }),
        },
    };
});

describe("cache-utils", () => {
    let mockRedis: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRedis = Redis.fromEnv();
    });

    describe("getOrSetCache", () => {
        it("should return cached data if present (cache hit)", async () => {
            const key = "test-key";
            const cachedData = { foo: "bar" };
            mockRedis.get.mockResolvedValue(cachedData);
            const fetchFn = vi.fn();

            const result = await getOrSetCache(key, fetchFn);

            expect(result).toEqual(cachedData);
            expect(mockRedis.get).toHaveBeenCalledWith(key);
            expect(fetchFn).not.toHaveBeenCalled();
        });

        it("should fetch fresh data if cache miss and set it", async () => {
            const key = "test-key";
            const freshData = { foo: "fresh" };
            mockRedis.get.mockResolvedValue(null);
            const fetchFn = vi.fn().mockResolvedValue(freshData);

            const result = await getOrSetCache(key, fetchFn);

            expect(result).toEqual(freshData);
            expect(fetchFn).toHaveBeenCalled();
            expect(mockRedis.set).toHaveBeenCalledWith(key, freshData, { ex: 300 });
        });

        it("should fallback to fetchFn if Redis fails", async () => {
            const key = "test-key";
            const freshData = { foo: "fallback" };
            mockRedis.get.mockRejectedValue(new Error("Redis down"));
            const fetchFn = vi.fn().mockResolvedValue(freshData);

            const result = await getOrSetCache(key, fetchFn);

            expect(result).toEqual(freshData);
            expect(fetchFn).toHaveBeenCalled();
        });
    });

    describe("invalidateCache", () => {
        it("should delete keys matching the pattern", async () => {
            const pattern = "user:*";
            const keys = ["user:1", "user:2"];
            mockRedis.keys.mockResolvedValue(keys);

            await invalidateCache(pattern);

            expect(mockRedis.keys).toHaveBeenCalledWith(pattern);
            expect(mockRedis.del).toHaveBeenCalledWith(...keys);
        });

        it("should do nothing if no keys match", async () => {
            mockRedis.keys.mockResolvedValue([]);
            await invalidateCache("non-existent:*");
            expect(mockRedis.del).not.toHaveBeenCalled();
        });
    });
});
