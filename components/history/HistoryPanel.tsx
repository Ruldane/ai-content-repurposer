'use client';

import { memo } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import type { HistoryEntry } from '@/hooks/useHistory';
import type { Format } from '@/types';

interface HistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: HistoryEntry[];
  onRestore: (sourceContent: string, outputs: Record<Format, string | null>) => void;
  onClear: () => void;
}

function HistoryPanel({
  open,
  onOpenChange,
  entries,
  onRestore,
  onClear,
}: HistoryPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Content History</SheetTitle>
          <SheetDescription>Last {entries.length} items</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No history yet. Generate some content to see it here.
            </p>
          ) : (
            entries.map((entry) => {
              const date = new Date(entry.timestamp);
              const formatsGenerated = (
                Object.entries(entry.outputs) as [Format, string | null][]
              )
                .filter(([, v]) => v)
                .map(([k]) => k);

              return (
                <button
                  key={entry.id}
                  onClick={() => {
                    onRestore(entry.sourceContent, entry.outputs);
                    onOpenChange(false);
                  }}
                  className="flex flex-col gap-1 rounded-md border border-border p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <span className="text-sm font-medium text-foreground line-clamp-1">
                    {entry.sourceTitle || 'Untitled'}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {formatsGenerated.length > 0 && (
                      <>
                        <span className="text-muted-foreground/50">·</span>
                        <span>{formatsGenerated.join(', ')}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {entries.length > 0 && (
          <div className="border-t border-border px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground hover:text-destructive"
              onClick={onClear}
            >
              <Trash2 className="size-3.5" />
              Clear history
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default memo(HistoryPanel);
