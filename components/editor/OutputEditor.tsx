'use client';

import { memo, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { ExportButton } from '@/components/export/ExportButton';
import { getPlatformMetrics } from '@/lib/metrics';
import { renderMarkdown } from '@/lib/markdown';
import InsightsPanel from '@/components/insights/InsightsPanel';
import type { Format } from '@/types';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading editor...</div>
    </div>
  ),
});

interface OutputEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  onRepurpose: () => void;
  canRepurpose: boolean;
  format: Format;
  sourceTitle: string;
  sourceContent?: string;
  outputs?: Record<Format, string | null>;
  variantBContent?: string | null;
  onVariantGenerate?: () => void;
  onVariantBChange?: (value: string) => void;
}

const OutputEditor = memo(function OutputEditor({
  value,
  onChange,
  isLoading,
  onRepurpose,
  canRepurpose,
  format,
  sourceTitle,
  sourceContent,
  outputs,
  variantBContent,
  onVariantGenerate,
  onVariantBChange,
}: OutputEditorProps) {
  const { resolvedTheme } = useTheme();
  const [previewMode, setPreviewMode] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [diffMode, setDiffMode] = useState(false);
  const [variant, setVariant] = useState<'A' | 'B'>('A');
  const [insightsOpen, setInsightsOpen] = useState(false);

  const handleInsert = useCallback(
    (text: string) => {
      if (variant === 'B') {
        onVariantBChange?.((variantBContent ?? '') + text);
      } else {
        onChange(value + text);
      }
    },
    [variant, variantBContent, onVariantBChange, onChange, value]
  );

  const extensions: Extension[] = [markdown(), EditorView.lineWrapping];

  const displayValue = variant === 'B' && variantBContent ? variantBContent : value;
  const metrics = getPlatformMetrics(format, displayValue);

  // Update preview HTML when content or preview mode changes
  useEffect(() => {
    if (previewMode && displayValue) {
      renderMarkdown(displayValue).then(setPreviewHtml);
    }
  }, [previewMode, displayValue]);

  return (
    <div className="flex h-full flex-col">
      {/* Variant toggle */}
      {variantBContent && (
        <div className="flex items-center gap-1 border-b border-border bg-muted/20 px-4 py-1">
          <span className="mr-2 text-xs text-muted-foreground">Variant:</span>
          <Button
            variant={variant === 'A' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setVariant('A')}
          >
            A
          </Button>
          <Button
            variant={variant === 'B' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setVariant('B')}
          >
            B
          </Button>
        </div>
      )}

      {/* Toolbar */}
      <EditorToolbar
        content={displayValue}
        previewMode={previewMode}
        onPreviewToggle={() => setPreviewMode(!previewMode)}
        diffMode={diffMode}
        onDiffToggle={() => setDiffMode(!diffMode)}
        onRegenerate={onRepurpose}
        canRegenerate={!!value && !isLoading}
        isLoading={isLoading}
        outputs={outputs}
        sourceTitle={sourceTitle}
        onVariantGenerate={() => {
          setVariant('B');
          onVariantGenerate?.();
        }}
        hasContent={!!value}
        insightsOpen={insightsOpen}
        onInsightsToggle={() => setInsightsOpen(!insightsOpen)}
      >
        <ExportButton
          format={format}
          content={displayValue}
          sourceTitle={sourceTitle}
          disabled={isLoading}
          variant={variant}
        />
        <Button
          onClick={onRepurpose}
          disabled={!canRepurpose || isLoading}
          size="sm"
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              <span>Repurpose</span>
            </>
          )}
        </Button>
      </EditorToolbar>

      {/* Editor / Preview / Diff */}
      <div className="flex-1 overflow-hidden">
        {isLoading && !value ? (
          <div className="flex h-full flex-col gap-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ) : previewMode ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none overflow-y-auto p-4"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        ) : diffMode && sourceContent ? (
          <DiffView original={sourceContent} modified={displayValue} />
        ) : (
          <CodeMirror
            value={displayValue}
            onChange={(val) => {
              if (variant === 'B') {
                onVariantBChange?.(val);
              } else {
                onChange(val);
              }
            }}
            extensions={extensions}
            theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
            placeholder="Generated content will appear here..."
            height="100%"
            basicSetup={{
              lineNumbers: false,
              foldGutter: false,
              highlightActiveLine: false,
            }}
            className="h-full text-sm"
          />
        )}
      </div>

      {/* Insights panel (collapsible) */}
      {insightsOpen && (
        <InsightsPanel
          content={displayValue}
          format={format}
          onInsert={handleInsert}
        />
      )}

      {/* Footer with platform-specific metrics */}
      <div className="flex h-10 items-center justify-end gap-3 border-t border-border bg-muted/30 px-4 text-xs text-muted-foreground">
        {metrics.length > 0 ? (
          metrics.map((m, i) => (
            <span key={i}>
              {i > 0 && <span className="mr-3 text-muted-foreground/50">·</span>}
              <span
                className={
                  m.color === 'red'
                    ? 'text-red-500 font-medium'
                    : m.color === 'yellow'
                      ? 'text-yellow-500'
                      : ''
                }
              >
                {m.label}: {m.value}
              </span>
            </span>
          ))
        ) : (
          <span>Ready to generate</span>
        )}
      </div>
    </div>
  );
});

/** Simple inline diff view */
function DiffView({ original, modified }: { original: string; modified: string }) {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');
  const maxLen = Math.max(origLines.length, modLines.length);

  return (
    <div className="h-full overflow-y-auto p-4 font-mono text-sm">
      {Array.from({ length: maxLen }, (_, i) => {
        const origLine = origLines[i] ?? '';
        const modLine = modLines[i] ?? '';
        if (origLine === modLine) {
          return (
            <div key={i} className="text-muted-foreground">
              {modLine || '\u00A0'}
            </div>
          );
        }
        return (
          <div key={i}>
            {origLine && (
              <div className="bg-red-500/10 text-red-400">- {origLine}</div>
            )}
            {modLine && (
              <div className="bg-green-500/10 text-green-400">+ {modLine}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default OutputEditor;
