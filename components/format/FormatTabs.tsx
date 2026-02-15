'use client';

import { memo } from 'react';
import { Linkedin, Twitter, Mail, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { Format } from '@/types';

const FORMATS: { key: Format; label: string; icon: typeof Linkedin }[] = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'twitter', label: 'Twitter/X', icon: Twitter },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'docs', label: 'Docs', icon: FileText },
];

interface FormatTabsProps {
  activeFormat: Format;
  onFormatChange: (format: Format) => void;
  outputs: Record<Format, string | null>;
  children?: React.ReactNode;
}

function FormatTabs({
  activeFormat,
  onFormatChange,
  outputs,
  children,
}: FormatTabsProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
      <Tabs
        value={activeFormat}
        onValueChange={(v) => onFormatChange(v as Format)}
        className="flex-1"
      >
        <TabsList variant="line" className="h-8 w-full justify-start">
          {FORMATS.map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key} className="gap-1.5 text-xs">
              <Icon className="size-3.5" />
              <span>{label}</span>
              {outputs[key] ? (
                <Badge
                  variant="default"
                  className="ml-1 h-4 px-1 text-[10px] leading-none bg-emerald-600 text-white"
                >
                  done
                </Badge>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}

export default memo(FormatTabs);
