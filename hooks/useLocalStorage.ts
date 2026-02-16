import { useState, useEffect, useRef, useCallback } from 'react';
import { saveToStorage, loadFromStorage } from '@/lib/storage';

/**
 * React hook that syncs state with localStorage.
 * Uses defaultValue on initial render (avoids hydration mismatch),
 * then loads from localStorage on mount and debounce-writes on change.
 */
export function useLocalStorage(
  key: string,
  defaultValue: string,
  debounceMs = 500,
): [string, (value: string) => void] {
  const [value, setValue] = useState(defaultValue);
  const isInitialized = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    const stored = loadFromStorage(key);
    if (stored !== null) {
      setValue(stored);
    }
    isInitialized.current = true;
  }, [key]);

  // Debounced write to localStorage whenever value changes (skip initial load)
  useEffect(() => {
    if (!isInitialized.current) return;

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
