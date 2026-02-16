'use client';

import { memo, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getWordCount, getCharCount, getReadingTime } from '@/lib/metrics';
import { ClearButton } from '@/components/editor/ClearButton';

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
  onClear?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SourceEditor = memo(function SourceEditor({
  value,
  onChange,
  onClear,
  collapsed,
  onToggleCollapse,
}: SourceEditorProps) {
  const { resolvedTheme } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [pendingContent, setPendingContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = getWordCount(value);
  const charCount = getCharCount(value);
  const readingTime = getReadingTime(value);

  const extensions: Extension[] = [markdown(), EditorView.lineWrapping];

  const loadFileContent = useCallback(
    (content: string) => {
      if (value.trim()) {
        setPendingContent(content);
        setConfirmReplace(true);
      } else {
        onChange(content);
      }
    },
    [value, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
        return;
      }
      file.text().then(loadFileContent);
    },
    [loadFileContent]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      file.text().then(loadFileContent);
      e.target.value = '';
    },
    [loadFileContent]
  );

  const handleConfirmReplace = useCallback(() => {
    onChange(pendingContent);
    setPendingContent('');
    setConfirmReplace(false);
  }, [onChange, pendingContent]);

  return (
    <div className="flex h-full flex-col">
      {/* Collapsible header for mobile */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className="flex h-10 items-center justify-between border-b border-border bg-muted/30 px-4 text-sm font-medium text-foreground lg:hidden"
        >
          <span>Source Content</span>
          {collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </button>
      )}

      {/* Editor (collapsible on mobile) */}
      <div
        className={`flex-1 overflow-hidden relative ${collapsed ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-primary bg-primary/5">
            <div className="text-sm font-medium text-primary">Drop .md or .txt file here</div>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <CodeMirror
            value={value}
            onChange={onChange}
            extensions={extensions}
            theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
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
      </div>

      {/* Footer */}
      <div className="flex h-10 items-center justify-between border-t border-border bg-muted/30 px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {onClear && <ClearButton onConfirm={onClear} disabled={!value} />}
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload .md file"
          >
            <Upload className="size-3.5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        <div className="flex items-center gap-3">
          <span>{wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{charCount.toLocaleString()} chars</span>
          <span className="text-muted-foreground/50">·</span>
          <span>{readingTime}</span>
        </div>
      </div>

      {/* Replace confirmation dialog */}
      <Dialog open={confirmReplace} onOpenChange={setConfirmReplace}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Replace current content?</DialogTitle>
            <DialogDescription>
              The editor already has content. Uploading will replace it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmReplace(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReplace}>Replace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default SourceEditor;
