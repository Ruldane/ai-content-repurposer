'use client';

import { useState, useCallback } from 'react';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import type { Format } from '@/types';

const HISTORY_KEY = 'history';
const MAX_ENTRIES = 10;

export interface HistoryEntry {
  id: string;
  sourceTitle: string;
  sourceContent: string;
  outputs: Record<Format, string | null>;
  timestamp: string;
}

function loadHistory(): HistoryEntry[] {
  try {
    const stored = loadFromStorage(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as HistoryEntry[];
  } catch {
    return [];
  }
}

function persistHistory(entries: HistoryEntry[]): void {
  saveToStorage(HISTORY_KEY, JSON.stringify(entries));
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => loadHistory());

  const addEntry = useCallback(
    (sourceContent: string, outputs: Record<Format, string | null>) => {
      setEntries((prev) => {
        const sourceTitle = sourceContent.slice(0, 50).replace(/\n/g, ' ');
        // Update existing entry if same source content
        const existingIdx = prev.findIndex(
          (e) => e.sourceContent === sourceContent
        );

        let next: HistoryEntry[];
        if (existingIdx >= 0) {
          next = [...prev];
          next[existingIdx] = {
            ...next[existingIdx],
            outputs,
            timestamp: new Date().toISOString(),
          };
        } else {
          const entry: HistoryEntry = {
            id: crypto.randomUUID(),
            sourceTitle,
            sourceContent,
            outputs,
            timestamp: new Date().toISOString(),
          };
          next = [entry, ...prev].slice(0, MAX_ENTRIES);
        }

        persistHistory(next);
        return next;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setEntries([]);
    persistHistory([]);
  }, []);

  return { entries, addEntry, clearHistory };
}
