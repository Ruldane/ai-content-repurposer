const STORAGE_VERSION = 'v1';

/** In-memory cache to avoid repeated synchronous localStorage reads */
const cache = new Map<string, string | null>();

function prefixKey(key: string): string {
  return `repurposer:${key}:${STORAGE_VERSION}`;
}

/**
 * Save a value to localStorage with versioned key prefix.
 * Silently fails in incognito/private browsing or when quota exceeded.
 */
export function saveToStorage(key: string, value: string): void {
  const prefixed = prefixKey(key);
  try {
    localStorage.setItem(prefixed, value);
    cache.set(prefixed, value);
  } catch {
    // localStorage unavailable or quota exceeded
  }
}

/**
 * Load a value from localStorage with versioned key prefix.
 * Returns null if key doesn't exist or localStorage is unavailable.
 */
export function loadFromStorage(key: string): string | null {
  const prefixed = prefixKey(key);
  if (cache.has(prefixed)) {
    return cache.get(prefixed) ?? null;
  }
  try {
    const value = localStorage.getItem(prefixed);
    cache.set(prefixed, value);
    return value;
  } catch {
    return null;
  }
}

/**
 * Remove a value from localStorage and clear its cache entry.
 */
export function clearStorage(key: string): void {
  const prefixed = prefixKey(key);
  try {
    localStorage.removeItem(prefixed);
  } catch {
    // localStorage unavailable
  }
  cache.delete(prefixed);
}

/** Invalidate cache when storage changes in another tab */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key) {
      cache.delete(e.key);
    }
  });
}
