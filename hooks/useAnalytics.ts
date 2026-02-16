'use client';

import { useState, useCallback } from 'react';
import { saveToStorage, loadFromStorage, clearStorage } from '@/lib/storage';

const ANALYTICS_KEY = 'analytics';

export interface AnalyticsEvent {
  event: string;
  format?: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalGenerations: number;
  generationsPerFormat: Record<string, number>;
  totalExports: number;
  totalCopies: number;
  mostUsedFormat: string | null;
}

function loadEvents(): AnalyticsEvent[] {
  try {
    const stored = loadFromStorage(ANALYTICS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as AnalyticsEvent[];
  } catch {
    return [];
  }
}

function persistEvents(events: AnalyticsEvent[]): void {
  saveToStorage(ANALYTICS_KEY, JSON.stringify(events));
}

export function useAnalytics() {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => loadEvents());

  const track = useCallback((event: string, format?: string) => {
    setEvents((prev) => {
      const next = [
        ...prev,
        { event, format, timestamp: new Date().toISOString() },
      ];
      persistEvents(next);
      return next;
    });
  }, []);

  const getSummary = useCallback((): AnalyticsSummary => {
    const generations = events.filter((e) => e.event === 'format_generated');
    const perFormat: Record<string, number> = {};
    for (const e of generations) {
      if (e.format) {
        perFormat[e.format] = (perFormat[e.format] || 0) + 1;
      }
    }

    const mostUsed = Object.entries(perFormat).sort((a, b) => b[1] - a[1]);

    return {
      totalGenerations: generations.length,
      generationsPerFormat: perFormat,
      totalExports: events.filter(
        (e) => e.event === 'export_single' || e.event === 'export_all'
      ).length,
      totalCopies: events.filter((e) => e.event === 'copy_clipboard').length,
      mostUsedFormat: mostUsed.length > 0 ? mostUsed[0][0] : null,
    };
  }, [events]);

  const resetStats = useCallback(() => {
    setEvents([]);
    clearStorage(ANALYTICS_KEY);
  }, []);

  return { track, getSummary, resetStats };
}
