/**
 * API Cache Layer
 * Caches API responses to reduce duplicate calls
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

/**
 * Get data from cache or fetch if expired/missing
 */
export async function getCached(key, fetchFn, options = {}) {
  const { ttl = CACHE_DURATION, forceRefresh = false } = options;

  // Check cache
  if (!forceRefresh && cache.has(key)) {
    const cached = cache.get(key);
    const now = Date.now();

    if (now - cached.timestamp < ttl) {
      console.log(`[Cache HIT] ${key}`);
      return cached.data;
    } else {
      console.log(`[Cache EXPIRED] ${key}`);
      cache.delete(key);
    }
  }

  // Fetch fresh data
  console.log(`[Cache MISS] ${key} - Fetching...`);
  const data = await fetchFn();

  // Store in cache
  cache.set(key, {
    data,
    timestamp: Date.now()
  });

  return data;
}

/**
 * Clear specific cache key
 */
export function clearCache(key) {
  cache.delete(key);
  console.log(`[Cache CLEARED] ${key}`);
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  cache.clear();
  console.log('[Cache CLEARED] All entries');
}

/**
 * Preload data into cache
 */
export function preloadCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`[Cache PRELOAD] ${key}`);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys())
  };
}

