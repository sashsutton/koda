import { getOrSetCache, invalidateCache } from "../lib/cache-utils";

async function testCache() {
    console.log("🚀 Starting Cache Test...");

    const key = "test:product-list";
    let dbHitCount = 0;

    const mockDbFetch = async () => {
        console.log("--> database hit!");
        dbHitCount++;
        return ["Product A", "Product B"];
    };

    // 1. First Call (Should be MISS -> DB HIT)
    console.log("1. Fetching first time...");
    await getOrSetCache(key, mockDbFetch);

    // 2. Second Call (Should be HIT -> NO DB HIT)
    console.log("2. Fetching second time...");
    await getOrSetCache(key, mockDbFetch);

    if (dbHitCount === 1) {
        console.log("✅ CACHE WORKING: DB hit only once.");
    } else {
        console.error("❌ CACHE FAILED: DB hit count is " + dbHitCount);
    }

    // 3. Invalidate
    console.log("3. Invalidating key...");
    await invalidateCache(key);

    // 4. Third Call (Should be MISS -> DB HIT)
    console.log("4. Fetching after invalidation...");
    await getOrSetCache(key, mockDbFetch);

    if (dbHitCount === 2) {
        console.log("✅ INVALIDATION WORKING: DB hit again.");
    } else {
        console.error("❌ INVALIDATION FAILED: DB hit count is " + dbHitCount);
    }
}

testCache().catch(console.error);
