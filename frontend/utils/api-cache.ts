// Memory cache to store API responses
const memoryCache: Record<string, { timestamp: number; data: any }> = {};

/**
 * Fetch helper that caches GET request responses in memory and sessionStorage.
 * Default TTL is 10 minutes.
 */
export async function fetchWithCache(url: string, options?: RequestInit, ttlMs: number = 10 * 60 * 1000): Promise<any> {
  const method = options?.method || 'GET';
  if (method.toUpperCase() !== 'GET') {
    return fetch(url, options).then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    });
  }

  // Check memory cache
  const cached = memoryCache[url];
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data;
  }

  // Check sessionStorage for tab-level persistence
  if (typeof window !== 'undefined') {
    try {
      const sessionKey = `api_cache:${url}`;
      const sessionDataStr = sessionStorage.getItem(sessionKey);
      if (sessionDataStr) {
        const sessionData = JSON.parse(sessionDataStr);
        if (Date.now() - sessionData.timestamp < ttlMs) {
          memoryCache[url] = sessionData;
          return sessionData.data;
        }
      }
    } catch (e) {
      console.warn("SessionStorage cache read failed:", e);
    }
  }

  // Fetch from network
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  // Save to cache
  const cacheEntry = {
    timestamp: Date.now(),
    data
  };
  memoryCache[url] = cacheEntry;

  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`api_cache:${url}`, JSON.stringify(cacheEntry));
    } catch (e) {
      // Ignore sessionStorage quota errors
    }
  }

  return data;
}
