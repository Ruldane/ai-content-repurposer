'use client';

import { memo } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Linkedin,
  Twitter,
  Mail,
  FileText,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Format, Tone } from '@/types';
import type { Settings } from '@/hooks/useSettings';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onToneChange: (format: Format, tone: Tone) => void;
  onCustomInstructionsChange: (instructions: string) => void;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onAutoSaveChange: (autoSave: boolean) => void;
}

const FORMATS: { key: Format; label: string; icon: typeof Linkedin }[] = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'docs', label: 'Documentation', icon: FileText },
];

const TONES: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'technical', label: 'Technical' },
  { value: 'storytelling', label: 'Storytelling' },
];

const THEMES: { value: 'light' | 'dark' | 'system'; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

function ToneSelector({
  format,
  currentTone,
  onToneChange,
}: {
  format: (typeof FORMATS)[number];
  currentTone: Tone;
  onToneChange: (format: Format, tone: Tone) => void;
}) {
  const Icon = format.icon;
  return (
    <div className="flex items-center gap-3">
      <div className="flex w-[110px] shrink-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-3.5" />
        <span>{format.label}</span>
      </div>
      <select
        value={currentTone}
        onChange={e => onToneChange(format.key, e.target.value as Tone)}
        className="h-8 w-full cursor-pointer rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20"
        aria-label={`Tone for ${format.label}`}
      >
        {TONES.map(tone => (
          <option key={tone.value} value={tone.value}>
            {tone.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingsPanel({
  open,
  onOpenChange,
  settings,
  onToneChange,
  onCustomInstructionsChange,
  onThemeChange,
  onAutoSaveChange,
}: SettingsPanelProps) {
  const { setTheme: setNextTheme } = useTheme();

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    onThemeChange(theme);
    setNextTheme(theme);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Settings</SheetTitle>
          <SheetDescription>
            Configure tone, instructions, and appearance.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 px-4 pb-6">
          {/* Tone per format */}
          <section>
            <h3 className="mb-3 text-sm font-medium text-foreground">
              Tone per format
            </h3>
            <div className="flex flex-col gap-2.5">
              {FORMATS.map(format => (
                <ToneSelector
                  key={format.key}
                  format={format}
                  currentTone={settings.tones[format.key]}
                  onToneChange={onToneChange}
                />
              ))}
            </div>
          </section>

          <Separator />

          {/* Custom instructions */}
          <section>
            <label
              htmlFor="custom-instructions"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Custom instructions
            </label>
            <p className="mb-2 text-xs text-muted-foreground">
              Rules applied to every generation.
            </p>
            <textarea
              id="custom-instructions"
              value={settings.customInstructions}
              onChange={e => onCustomInstructionsChange(e.target.value)}
              placeholder="e.g. Always use British English. Avoid jargon."
              rows={4}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </section>

          <Separator />

          {/* Theme toggle */}
          <section>
            <h3 className="mb-3 text-sm font-medium text-foreground">Theme</h3>
            <div className="flex gap-1.5">
              {THEMES.map(theme => {
                const Icon = theme.icon;
                const isActive = settings.theme === theme.value;
                return (
                  <Button
                    key={theme.value}
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleThemeChange(theme.value)}
                    className={
                      isActive
                        ? 'flex-1 border border-ring/30 font-medium'
                        : 'flex-1 text-muted-foreground'
                    }
                    aria-pressed={isActive}
                  >
                    <Icon className="size-3.5" />
                    {theme.label}
                  </Button>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Auto-save toggle */}
          <section>
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div>
                <span className="text-sm font-medium text-foreground">
                  Auto-save
                </span>
                <p className="text-xs text-muted-foreground">
                  Persist editor content across sessions.
                </p>
              </div>
              <button
                role="switch"
                type="button"
                aria-checked={settings.autoSave}
                onClick={() => onAutoSaveChange(!settings.autoSave)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  settings.autoSave ? 'bg-primary' : 'bg-input'
                }`}
              >
                <span
                  className={`pointer-events-none block size-4 rounded-full bg-background shadow-sm ring-0 transition-transform ${
                    settings.autoSave ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default memo(SettingsPanel);
