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
import { Separator } from '@/components/ui/separator';
import type { AnalyticsSummary } from '@/hooks/useAnalytics';

interface AnalyticsDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: AnalyticsSummary;
  onReset: () => void;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function AnalyticsDashboard({
  open,
  onOpenChange,
  summary,
  onReset,
}: AnalyticsDashboardProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">Analytics</SheetTitle>
          <SheetDescription>Your usage stats</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Generations" value={summary.totalGenerations} />
            <StatCard label="Total Exports" value={summary.totalExports} />
            <StatCard label="Clipboard Copies" value={summary.totalCopies} />
            <StatCard
              label="Most Used Format"
              value={summary.mostUsedFormat ?? 'N/A'}
            />
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-sm font-medium text-foreground">
              Generations per format
            </h3>
            <div className="flex flex-col gap-2">
              {Object.entries(summary.generationsPerFormat).length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                Object.entries(summary.generationsPerFormat).map(
                  ([format, count]) => (
                    <div
                      key={format}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                    >
                      <span className="text-sm capitalize text-foreground">
                        {format}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {count}
                      </span>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-2 text-muted-foreground hover:text-destructive"
            onClick={onReset}
          >
            <Trash2 className="size-3.5" />
            Reset stats
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default memo(AnalyticsDashboard);
