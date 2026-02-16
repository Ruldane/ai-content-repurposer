'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, History, BarChart3, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import SourceEditor from '@/components/editor/SourceEditor';
import OutputEditor from '@/components/editor/OutputEditor';
import SettingsPanel from '@/components/settings/SettingsPanel';
import FormatTabs from '@/components/format/FormatTabs';
import HistoryPanel from '@/components/history/HistoryPanel';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { useRepurpose } from '@/hooks/useRepurpose';
import { useSettings } from '@/hooks/useSettings';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useHistory } from '@/hooks/useHistory';
import { useAnalytics } from '@/hooks/useAnalytics';
import { clearStorage, loadFromStorage, saveToStorage } from '@/lib/storage';
import { getWordCount } from '@/lib/metrics';
import type { Format } from '@/types';
import type { CustomFormat } from '@/components/format/CustomFormatDialog';

const FORMATS: Format[] = ['linkedin', 'twitter', 'email', 'docs'];
const EMPTY_OUTPUTS: Record<string, string | null> = {
  linkedin: null,
  twitter: null,
  email: null,
  docs: null,
};

function loadCustomFormats(): CustomFormat[] {
  try {
    const stored = loadFromStorage('customFormats');
    if (!stored) return [];
    return JSON.parse(stored) as CustomFormat[];
  } catch {
    return [];
  }
}

export default function Home() {
  const [sourceContent, setSourceContent] = useLocalStorage('source', '');
  const [outputsJson, setOutputsJson] = useLocalStorage('outputs', JSON.stringify(EMPTY_OUTPUTS));
  const [activeFormat, setActiveFormat] = useState<string>('linkedin');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generatingFormat, setGeneratingFormat] = useState<string | null>(null);
  const [customFormats, setCustomFormats] = useState<CustomFormat[]>(() => loadCustomFormats());
  const [variantBOutputs, setVariantBOutputs] = useState<Record<string, string | null>>(EMPTY_OUTPUTS);
  const [isVariantGen, setIsVariantGen] = useState(false);

  const outputs: Record<string, string | null> = (() => {
    try {
      return { ...EMPTY_OUTPUTS, ...JSON.parse(outputsJson) };
    } catch {
      return { ...EMPTY_OUTPUTS };
    }
  })();

  const { output, isLoading, error, generate } = useRepurpose();
  const { settings, setTone, setCustomInstructions, setTheme, setAutoSave } = useSettings();
  const { entries, addEntry, clearHistory } = useHistory();
  const { track, getSummary, resetStats } = useAnalytics();

  // Session restore banner (US-022)
  useEffect(() => {
    const stored = loadFromStorage('source');
    if (stored && stored.trim()) {
      setShowRestoreBanner(true);
    }
  }, []);

  // Update output content for active format when streaming
  useEffect(() => {
    if (output) {
      if (isVariantGen) {
        setVariantBOutputs(prev => ({ ...prev, [activeFormat]: output }));
      } else {
        const next = { ...outputs, [activeFormat]: output };
        setOutputsJson(JSON.stringify(next));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [output]);

  // Show error toast when API fails
  useEffect(() => {
    if (error) {
      toast.error('Generation failed', {
        description: error,
        action: {
          label: 'Retry',
          onClick: () => handleRepurpose(),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Persist custom formats
  useEffect(() => {
    saveToStorage('customFormats', JSON.stringify(customFormats));
  }, [customFormats]);

  const handleRepurpose = async () => {
    if (!sourceContent.trim()) return;

    const wordCount = getWordCount(sourceContent);
    // US-023: Edge case warnings
    if (wordCount < 100) {
      toast.warning('Content is short — output quality may be limited');
    } else if (wordCount > 5000) {
      toast.info('Long content detected — this may take longer');
    }

    // Find custom format prompt if this is a custom format
    const customFormat = customFormats.find(cf => cf.id === activeFormat);
    await generate(
      sourceContent,
      activeFormat as Format,
      settings.tones[activeFormat as Format],
      settings.customInstructions || undefined,
      customFormat?.systemPrompt
    );

    // Track analytics
    track('format_generated', activeFormat);

    // Save to history
    const updatedOutputs = { ...outputs, [activeFormat]: output ?? outputs[activeFormat] };
    addEntry(sourceContent, updatedOutputs as Record<Format, string | null>);
  };

  // US-029: Generate A/B variant
  const handleVariantGenerate = async () => {
    if (!sourceContent.trim()) return;
    setIsVariantGen(true);

    const customFormat = customFormats.find(cf => cf.id === activeFormat);
    await generate(
      sourceContent,
      activeFormat as Format,
      settings.tones[activeFormat as Format],
      'Generate an alternative version with a different angle or hook. ' + (settings.customInstructions || ''),
      customFormat?.systemPrompt
    );

    setIsVariantGen(false);
    track('format_generated', activeFormat);
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

  const handleStartFresh = useCallback(() => {
    handleClear();
    setShowRestoreBanner(false);
  }, [handleClear]);

  // US-018: Batch generate all formats
  const handleGenerateAll = async () => {
    if (!sourceContent.trim()) return;
    setIsGeneratingAll(true);

    for (const format of FORMATS) {
      setGeneratingFormat(format);
      setActiveFormat(format);
      try {
        await generate(
          sourceContent,
          format,
          settings.tones[format],
          settings.customInstructions || undefined
        );
        track('format_generated', format);
      } catch {
        toast.error(`Failed to generate ${format}`);
      }
    }

    setGeneratingFormat(null);
    setIsGeneratingAll(false);
    addEntry(sourceContent, outputs as Record<Format, string | null>);
    toast.success('All formats generated!');
  };

  // US-025: Restore history entry
  const handleRestoreHistory = useCallback(
    (source: string, restoredOutputs: Record<Format, string | null>) => {
      setSourceContent(source);
      setOutputsJson(JSON.stringify(restoredOutputs));
    },
    [setSourceContent, setOutputsJson]
  );

  // US-026: Custom format management
  const handleAddCustomFormat = useCallback((cf: CustomFormat) => {
    setCustomFormats((prev) => [...prev, cf]);
  }, []);

  const handleEditCustomFormat = useCallback((cf: CustomFormat) => {
    setCustomFormats((prev) =>
      prev.map((f) => (f.id === cf.id ? cf : f))
    );
  }, []);

  const handleDeleteCustomFormat = useCallback((id: string) => {
    setCustomFormats((prev) => prev.filter((f) => f.id !== id));
    if (activeFormat === id) setActiveFormat('linkedin');
  }, [activeFormat]);

  const canRepurpose = sourceContent.trim().length > 0;
  const currentOutput = outputs[activeFormat] ?? '';

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Session restore banner (US-022) */}
      {showRestoreBanner && (
        <div className="flex items-center justify-between bg-[oklch(0.55_0.15_250/8%)] px-4 py-2.5 text-sm border-b border-[oklch(0.55_0.15_250/15%)]">
          <span className="text-foreground">
            Welcome back! Your previous session has been restored.{' '}
            <button
              onClick={handleStartFresh}
              className="underline text-[oklch(0.65_0.15_250)] hover:text-[oklch(0.75_0.15_250)] font-medium"
            >
              Start fresh
            </button>
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowRestoreBanner(false)}
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.55_0.15_250)] to-[oklch(0.45_0.2_280)]">
            <Sparkles className="size-3.5 text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            AI Content Repurposer
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setHistoryOpen(true)}
            aria-label="History"
          >
            <History className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setAnalyticsOpen(true)}
            aria-label="Analytics"
          >
            <BarChart3 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            <Settings className="size-4" />
          </Button>
        </div>
      </header>

      {/* Split-pane container */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left pane - Source content */}
        <div className="flex w-full flex-col border-b border-border lg:w-1/2 lg:border-b-0 lg:border-r">
          <SourceEditor
            value={sourceContent}
            onChange={setSourceContent}
            onClear={handleClear}
            collapsed={sourceCollapsed}
            onToggleCollapse={() => setSourceCollapsed(!sourceCollapsed)}
          />
        </div>

        {/* Right pane - Output */}
        <div className="flex w-full flex-col lg:w-1/2">
          <FormatTabs
            activeFormat={activeFormat}
            onFormatChange={(f) => {
              if (f !== '__add__') setActiveFormat(f);
            }}
            outputs={outputs}
            customFormats={customFormats}
            onAddCustomFormat={handleAddCustomFormat}
            onEditCustomFormat={handleEditCustomFormat}
            onDeleteCustomFormat={handleDeleteCustomFormat}
            onGenerateAll={handleGenerateAll}
            isGeneratingAll={isGeneratingAll}
            generatingFormat={generatingFormat}
          />
          <OutputEditor
            value={currentOutput}
            onChange={handleOutputChange}
            isLoading={isLoading}
            onRepurpose={handleRepurpose}
            canRepurpose={canRepurpose}
            format={activeFormat as Format}
            sourceTitle={sourceContent}
            sourceContent={sourceContent}
            outputs={outputs as Record<Format, string | null>}
            variantBContent={variantBOutputs[activeFormat] ?? null}
            onVariantGenerate={handleVariantGenerate}
            onVariantBChange={(val: string) => setVariantBOutputs(prev => ({ ...prev, [activeFormat]: val }))}
          />
        </div>
      </div>

      {/* Mobile sticky bottom bar (US-016) */}
      <div className="flex h-12 items-center justify-center gap-3 border-t border-border bg-card px-4 lg:hidden">
        <Button
          onClick={handleRepurpose}
          disabled={!canRepurpose || isLoading}
          size="sm"
          className="min-h-[44px] flex-1 gap-2"
        >
          Repurpose
        </Button>
      </div>

      {/* Panels */}
      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onToneChange={setTone}
        onCustomInstructionsChange={setCustomInstructions}
        onThemeChange={setTheme}
        onAutoSaveChange={setAutoSave}
      />

      <HistoryPanel
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        entries={entries}
        onRestore={handleRestoreHistory}
        onClear={clearHistory}
      />

      <AnalyticsDashboard
        open={analyticsOpen}
        onOpenChange={setAnalyticsOpen}
        summary={getSummary()}
        onReset={resetStats}
      />
    </div>
  );
}
