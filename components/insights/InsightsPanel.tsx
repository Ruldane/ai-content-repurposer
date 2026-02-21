'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, BarChart2, Hash } from 'lucide-react';
import PlatformPreview from './PlatformPreview';
import ContentScore from './ContentScore';
import SuggestionsPanel from './SuggestionsPanel';
import type { Format } from '@/types';

interface InsightsPanelProps {
  content: string;
  format: Format | string;
  onInsert: (text: string) => void;
}

export default function InsightsPanel({ content, format, onInsert }: InsightsPanelProps) {
  return (
    <div className="border-t border-border bg-card/50">
      <Tabs defaultValue="preview" className="h-full flex flex-col">
        {/* Tab bar */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Insights
          </span>
          <TabsList className="h-7 gap-0.5 bg-transparent p-0">
            <TabsTrigger
              value="preview"
              className="h-7 gap-1.5 rounded px-2.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              <Monitor className="size-3" />
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="score"
              className="h-7 gap-1.5 rounded px-2.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              <BarChart2 className="size-3" />
              Score
            </TabsTrigger>
            <TabsTrigger
              value="suggestions"
              className="h-7 gap-1.5 rounded px-2.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              <Hash className="size-3" />
              Suggestions
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab content */}
        <div className="h-[260px] overflow-y-auto px-4 py-3">
          <TabsContent value="preview" className="mt-0">
            <PlatformPreview content={content} format={format} />
          </TabsContent>
          <TabsContent value="score" className="mt-0">
            <ContentScore content={content} format={format} />
          </TabsContent>
          <TabsContent value="suggestions" className="mt-0">
            <SuggestionsPanel content={content} format={format} onInsert={onInsert} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
