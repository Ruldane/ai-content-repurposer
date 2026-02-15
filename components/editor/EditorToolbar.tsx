'use client';

import { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface EditorToolbarProps {
  content: string;
  children?: React.ReactNode;
}

export function EditorToolbar({ content, children }: EditorToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy', {
        description: 'Could not access clipboard. Please copy manually.',
      });
    }
  }, [content]);

  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-muted/30 px-4">
      <div className="text-sm font-medium text-foreground">Output</div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleCopy}
          disabled={!content}
          variant="outline"
          size="sm"
          className="gap-1.5"
          aria-label="Copy output to clipboard"
        >
          {copied ? (
            <>
              <Check className="size-4" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-4" />
              <span>Copy</span>
            </>
          )}
        </Button>
        {children}
      </div>
    </div>
  );
}
