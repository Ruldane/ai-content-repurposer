'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { ExportButton } from '@/components/export/ExportButton';
import { getWordCount, getCharCount } from '@/lib/metrics';
import type { Format } from '@/types';

// Dynamically import CodeMirror with SSR disabled
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
}

const OutputEditor = memo(function OutputEditor({
  value,
  onChange,
  isLoading,
  onRepurpose,
  canRepurpose,
  format,
  sourceTitle,
}: OutputEditorProps) {
  const wordCount = getWordCount(value);
  const charCount = getCharCount(value);

  // CodeMirror extensions
  const extensions: Extension[] = [markdown(), EditorView.lineWrapping];

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar with Copy, Export, and Repurpose buttons */}
      <EditorToolbar content={value}>
        <ExportButton
          format={format}
          content={value}
          sourceTitle={sourceTitle}
          disabled={isLoading}
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

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {isLoading && !value ? (
          // Skeleton loading state
          <div className="flex h-full flex-col gap-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <CodeMirror
            value={value}
            onChange={onChange}
            extensions={extensions}
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

      {/* Footer with metrics */}
      <div className="flex h-10 items-center justify-end gap-3 border-t border-border bg-muted/30 px-4 text-xs text-muted-foreground">
        {value ? (
          <>
            <span>
              {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
            </span>
            <span className="text-muted-foreground/50">·</span>
            <span>{charCount.toLocaleString()} chars</span>
          </>
        ) : (
          <span>Ready to generate</span>
        )}
      </div>
    </div>
  );
});

export default OutputEditor;
