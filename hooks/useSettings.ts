'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import type { Format, Tone } from '@/types';

const SETTINGS_KEY = 'settings';

export interface Settings {
  tones: Record<Format, Tone>;
  customInstructions: string;
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  tones: {
    linkedin: 'professional',
    twitter: 'casual',
    email: 'professional',
    docs: 'technical',
  },
  customInstructions: '',
  theme: 'dark',
  autoSave: true,
};

function loadSettings(): Settings {
  try {
    const stored = loadFromStorage(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      tones: { ...DEFAULT_SETTINGS.tones, ...parsed.tones },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function persistSettings(settings: Settings): void {
  saveToStorage(SETTINGS_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const isInitialized = useRef(false);

  // Load from localStorage after mount
  useEffect(() => {
    setSettings(loadSettings());
    isInitialized.current = true;
  }, []);

  // Persist to localStorage on every change (skip initial)
  useEffect(() => {
    if (!isInitialized.current) return;
    persistSettings(settings);
  }, [settings]);

  const setTone = useCallback((format: Format, tone: Tone) => {
    setSettings(prev => ({
      ...prev,
      tones: { ...prev.tones, [format]: tone },
    }));
  }, []);

  const setCustomInstructions = useCallback((instructions: string) => {
    setSettings(prev => ({ ...prev, customInstructions: instructions }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme }));
  }, []);

  const setAutoSave = useCallback((autoSave: boolean) => {
    setSettings(prev => ({ ...prev, autoSave }));
  }, []);

  return {
    settings,
    setTone,
    setCustomInstructions,
    setTheme,
    setAutoSave,
  };
}
