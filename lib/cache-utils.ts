import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

type FetchFunction<T> = () => Promise<T>;

/**
 * Wraps a fetch function with Redis caching.
 * @param key The unique cache key.
 * @param fetchFn The function to fetch data if cache misses.
 * @param ttlSeconds Time to live in seconds (default 300s = 5m).
 */
export async function getOrSetCache<T>(
    key: string,
    fetchFn: FetchFunction<T>,
    ttlSeconds: number = 300
): Promise<T> {
    try {
        // 1. Try to get data from Redis
        const cachedData = await redis.get<T>(key);

        if (cachedData) {
            console.log(`[CACHE HIT] ${key}`);
            return cachedData;
        }

        // 2. Fetch fresh data
        console.log(`[CACHE MISS] ${key}`);
        const freshData = await fetchFn();

        // 3. Save to Redis (fire and forget for performance)
        if (freshData) {
            redis.set(key, freshData, { ex: ttlSeconds });
        }

        return freshData;
    } catch (error) {
        console.error(`[CACHE ERROR] ${key}:`, error);
        // Fallback: If Redis fails, just return fresh data directly
        return await fetchFn();
    }
}

/**
 * Invalidates a cache key.
 */
export async function invalidateCache(keyPattern: string) {
    try {
        // Note: Free Redis tier might not support SCAN/KEYS effectively for large datasets,
        // but for specific keys it works.
        const keys = await redis.keys(keyPattern);
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`[CACHE INVALIDATED] ${keys.length} keys`);
        }
    } catch (error) {
        console.error("Error invalidating cache:", error);
    }
}
