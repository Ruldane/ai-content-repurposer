'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import SourceEditor from '@/components/editor/SourceEditor';
import OutputEditor from '@/components/editor/OutputEditor';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { useRepurpose } from '@/hooks/useRepurpose';
import { useSettings } from '@/hooks/useSettings';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { clearStorage } from '@/lib/storage';

export default function Home() {
  const [sourceContent, setSourceContent] = useLocalStorage('source', '');
  const [outputContent, setOutputContent] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { output, isLoading, error, generate } = useRepurpose();
  const {
    settings,
    setTone,
    setCustomInstructions,
    setTheme,
    setAutoSave,
  } = useSettings();

  // Update output content when streaming updates
  useEffect(() => {
    if (output) {
      setOutputContent(output);
    }
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
    if (!sourceContent.trim()) {
      return;
    }

    const format = 'linkedin' as const;
    await generate(
      sourceContent,
      format,
      settings.tones[format],
      settings.customInstructions || undefined
    );
  };

  const handleClear = useCallback(() => {
    setSourceContent('');
    setOutputContent('');
    clearStorage('source');
    clearStorage('outputs');
  }, [setSourceContent]);

  const canRepurpose = sourceContent.trim().length > 0;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
        <h1 className="text-lg font-semibold tracking-tight">
          AI Content Repurposer
        </h1>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="size-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </header>

      {/* Split-pane container */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left pane - Source content */}
        <div className="flex w-full flex-col border-b border-border lg:w-1/2 lg:border-b-0 lg:border-r">
          <SourceEditor value={sourceContent} onChange={setSourceContent} onClear={handleClear} />
        </div>

        {/* Right pane - Output */}
        <div className="flex w-full flex-col lg:w-1/2">
          <OutputEditor
            value={outputContent}
            onChange={setOutputContent}
            isLoading={isLoading}
            onRepurpose={handleRepurpose}
            canRepurpose={canRepurpose}
            format="linkedin"
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
