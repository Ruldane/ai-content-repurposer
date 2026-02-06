'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { getWordCount, getCharCount, getReadingTime } from '@/lib/metrics';

// Dynamically import CodeMirror with SSR disabled
const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading editor...</div>
    </div>
  ),
});

interface SourceEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const SourceEditor = memo(function SourceEditor({
  value,
  onChange,
}: SourceEditorProps) {
  const wordCount = getWordCount(value);
  const charCount = getCharCount(value);
  const readingTime = getReadingTime(value);

  // CodeMirror extensions
  const extensions: Extension[] = [
    markdown(),
    EditorView.lineWrapping,
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={value}
          onChange={onChange}
          extensions={extensions}
          placeholder="Paste or type your blog post here..."
          height="100%"
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
          }}
          className="h-full text-sm"
        />
      </div>

      {/* Footer with metrics */}
      <div className="flex h-10 items-center justify-end gap-3 border-t border-border bg-muted/30 px-4 text-xs text-muted-foreground">
        <span>
          {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
        </span>
        <span className="text-muted-foreground/50">·</span>
        <span>{charCount.toLocaleString()} chars</span>
        <span className="text-muted-foreground/50">·</span>
        <span>{readingTime}</span>
      </div>
    </div>
  );
});

export default SourceEditor;
