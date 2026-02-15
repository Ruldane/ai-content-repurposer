'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import SourceEditor from '@/components/editor/SourceEditor';
import OutputEditor from '@/components/editor/OutputEditor';
import SettingsPanel from '@/components/settings/SettingsPanel';
import FormatTabs from '@/components/format/FormatTabs';
import { useRepurpose } from '@/hooks/useRepurpose';
import { useSettings } from '@/hooks/useSettings';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { clearStorage } from '@/lib/storage';
import type { Format } from '@/types';

const EMPTY_OUTPUTS: Record<Format, string | null> = {
  linkedin: null,
  twitter: null,
  email: null,
  docs: null,
};

export default function Home() {
  const [sourceContent, setSourceContent] = useLocalStorage('source', '');
  const [outputsJson, setOutputsJson] = useLocalStorage('outputs', JSON.stringify(EMPTY_OUTPUTS));
  const [activeFormat, setActiveFormat] = useState<Format>('linkedin');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const outputs: Record<Format, string | null> = (() => {
    try {
      return { ...EMPTY_OUTPUTS, ...JSON.parse(outputsJson) };
    } catch {
      return { ...EMPTY_OUTPUTS };
    }
  })();

  const { output, isLoading, error, generate } = useRepurpose();
  const {
    settings,
    setTone,
    setCustomInstructions,
    setTheme,
    setAutoSave,
  } = useSettings();

  // Update output content for active format when streaming
  useEffect(() => {
    if (output) {
      const next = { ...outputs, [activeFormat]: output };
      setOutputsJson(JSON.stringify(next));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output]);

  // Show error toast when API fails
  useEffect(() => {
    if (error) {
      toast.error('Generation failed', {
        description: error,
      });
    }
  }, [error]);

  const handleRepurpose = async () => {
    if (!sourceContent.trim()) return;
    await generate(
      sourceContent,
      activeFormat,
      settings.tones[activeFormat],
      settings.customInstructions || undefined
    );
  };

  const handleOutputChange = useCallback(
    (value: string) => {
      const next = { ...outputs, [activeFormat]: value };
      setOutputsJson(JSON.stringify(next));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeFormat, setOutputsJson]
  );

  const handleClear = useCallback(() => {
    setSourceContent('');
    setOutputsJson(JSON.stringify(EMPTY_OUTPUTS));
    clearStorage('source');
    clearStorage('outputs');
  }, [setSourceContent, setOutputsJson]);

  const canRepurpose = sourceContent.trim().length > 0;
  const currentOutput = outputs[activeFormat] ?? '';

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
        <h1 className="text-lg font-semibold tracking-tight">
          AI Content Repurposer
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </header>

      {/* Split-pane container */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left pane - Source content */}
        <div className="flex w-full flex-col border-b border-border lg:w-1/2 lg:border-b-0 lg:border-r">
          <SourceEditor value={sourceContent} onChange={setSourceContent} onClear={handleClear} />
        </div>

        {/* Right pane - Output */}
        <div className="flex w-full flex-col lg:w-1/2">
          <FormatTabs
            activeFormat={activeFormat}
            onFormatChange={setActiveFormat}
            outputs={outputs}
          />
          <OutputEditor
            value={currentOutput}
            onChange={handleOutputChange}
            isLoading={isLoading}
            onRepurpose={handleRepurpose}
            canRepurpose={canRepurpose}
            format={activeFormat}
            sourceTitle={sourceContent}
          />
        </div>
      </div>

      {/* Settings panel */}
      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onToneChange={setTone}
        onCustomInstructionsChange={setCustomInstructions}
        onThemeChange={setTheme}
        onAutoSaveChange={setAutoSave}
      />
    </div>
  );
}
