'use client';

import { useState, useCallback } from 'react';
import { Loader2, Sparkles, Hash, Smile } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { Format } from '@/types';

interface SuggestionsPanelProps {
  content: string;
  format: Format | string;
  onInsert: (text: string) => void;
}

interface Suggestions {
  hashtags: string[];
  emojis: string[];
}

export default function SuggestionsPanel({ content, format, onInsert }: SuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = useCallback(async () => {
    if (!content.trim()) {
      toast.warning('Generate content first before fetching suggestions');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.slice(0, 800), format }),
      });
      if (!res.ok) throw new Error('Request failed');
      const data = (await res.json()) as Suggestions;
      setSuggestions(data);
    } catch {
      toast.error('Failed to fetch suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [content, format]);

  const handleInsert = useCallback(
    (item: string) => {
      onInsert(' ' + item);
      toast.success(`Inserted ${item}`);
    },
    [onInsert]
  );

  if (!content) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Generate content to get hashtag &amp; emoji suggestions
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      {/* Fetch button */}
      {!suggestions && !isLoading && (
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="text-sm text-muted-foreground text-center max-w-xs">
            Get AI-powered hashtags and emojis tailored to your content and platform.
          </div>
          <Button onClick={fetchSuggestions} size="sm" className="gap-2">
            <Sparkles className="size-3.5" />
            Generate Suggestions
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span>Analyzing content…</span>
        </div>
      )}

      {suggestions && !isLoading && (
        <>
          {/* Hashtags */}
          {suggestions.hashtags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Hash className="size-3.5" />
                  Hashtags
                </div>
                <button
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => {
                    const all = suggestions.hashtags.join(' ');
                    onInsert('\n\n' + all);
                    toast.success('All hashtags inserted');
                  }}
                >
                  Insert all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.hashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleInsert(tag)}
                    className="rounded-full border border-[oklch(0.55_0.15_250/40%)] bg-[oklch(0.55_0.15_250/8%)] px-2.5 py-1 text-xs font-medium text-[oklch(0.55_0.15_250)] hover:bg-[oklch(0.55_0.15_250/18%)] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emojis */}
          {suggestions.emojis.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Smile className="size-3.5" />
                Emojis
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleInsert(emoji)}
                    className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/30 text-lg hover:bg-muted transition-colors"
                    title={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Refresh */}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSuggestions}
            className="w-full gap-2 text-xs text-muted-foreground"
          >
            <Sparkles className="size-3" />
            Regenerate suggestions
          </Button>
        </>
      )}
    </div>
  );
}
