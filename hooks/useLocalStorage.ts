import { useState, useEffect, useRef, useCallback } from 'react';
import { saveToStorage, loadFromStorage } from '@/lib/storage';

/**
 * React hook that syncs state with localStorage.
 * Reads from localStorage on mount (lazy init) and debounce-writes on change.
 *
 * @param key - storage key (auto-prefixed with version by storage.ts)
 * @param defaultValue - fallback when nothing is stored
 * @param debounceMs - write debounce delay in ms (default 500)
 */
export function useLocalStorage(
  key: string,
  defaultValue: string,
  debounceMs = 500,
): [string, (value: string) => void] {
  // Lazy init: read from localStorage only on first render
  const [value, setValue] = useState(() => {
    return loadFromStorage(key) ?? defaultValue;
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced write to localStorage whenever value changes
  useEffect(() => {
    timerRef.current = setTimeout(() => {
      saveToStorage(key, value);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [key, value, debounceMs]);

  // Flush pending writes before the page unloads
  useEffect(() => {
    const flush = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      saveToStorage(key, value);
    };

    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, [key, value]);

  const set = useCallback((next: string) => {
    setValue(next);
  }, []);

  return [value, set];
}
