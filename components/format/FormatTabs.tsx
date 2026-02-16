'use client';

import { memo, useState } from 'react';
import { Linkedin, Twitter, Mail, FileText, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomFormatDialog, type CustomFormat } from '@/components/format/CustomFormatDialog';
import type { Format } from '@/types';

const BUILT_IN_FORMATS: { key: Format; label: string; icon: typeof Linkedin }[] = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'twitter', label: 'Twitter/X', icon: Twitter },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'docs', label: 'Docs', icon: FileText },
];

interface FormatTabsProps {
  activeFormat: string;
  onFormatChange: (format: string) => void;
  outputs: Record<string, string | null>;
  customFormats?: CustomFormat[];
  onAddCustomFormat?: (format: CustomFormat) => void;
  onEditCustomFormat?: (format: CustomFormat) => void;
  onDeleteCustomFormat?: (id: string) => void;
  onGenerateAll?: () => void;
  isGeneratingAll?: boolean;
  generatingFormat?: string | null;
  children?: React.ReactNode;
}

function FormatTabs({
  activeFormat,
  onFormatChange,
  outputs,
  customFormats = [],
  onAddCustomFormat,
  onEditCustomFormat,
  onDeleteCustomFormat,
  onGenerateAll,
  isGeneratingAll,
  generatingFormat,
  children,
}: FormatTabsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFormat, setEditingFormat] = useState<CustomFormat | null>(null);

  return (
    <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
      <Tabs
        value={activeFormat}
        onValueChange={onFormatChange}
        className="flex-1 overflow-x-auto"
      >
        <TabsList variant="line" className="h-8 w-fit justify-start">
          {BUILT_IN_FORMATS.map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key} className="gap-1.5 text-xs">
              <Icon className="size-3.5" />
              <span>{label}</span>
              {generatingFormat === key && (
                <Loader2 className="ml-1 size-3 animate-spin" />
              )}
              {outputs[key] && !generatingFormat ? (
                <Badge
                  variant="default"
                  className="ml-1 h-4 px-1 text-[10px] leading-none bg-emerald-600 text-white"
                >
                  done
                </Badge>
              ) : null}
            </TabsTrigger>
          ))}

          {/* Custom format tabs */}
          {customFormats.map((cf) => (
            <TabsTrigger key={cf.id} value={cf.id} className="group gap-1.5 text-xs">
              <span>{cf.icon}</span>
              <span>{cf.name}</span>
              {outputs[cf.id] ? (
                <Badge
                  variant="default"
                  className="ml-1 h-4 px-1 text-[10px] leading-none bg-emerald-600 text-white"
                >
                  done
                </Badge>
              ) : null}
              {activeFormat === cf.id && onEditCustomFormat && (
                <span className="ml-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFormat(cf);
                      setDialogOpen(true);
                    }}
                    className="p-0.5 hover:text-foreground"
                    aria-label={`Edit ${cf.name}`}
                  >
                    <Pencil className="size-2.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomFormat?.(cf.id);
                    }}
                    className="p-0.5 hover:text-destructive"
                    aria-label={`Delete ${cf.name}`}
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </span>
              )}
            </TabsTrigger>
          ))}

          {/* Add custom format tab */}
          {onAddCustomFormat && customFormats.length < 5 && (
            <TabsTrigger
              value="__add__"
              className="gap-1 text-xs text-muted-foreground"
              onClick={(e) => {
                e.preventDefault();
                setEditingFormat(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-3" />
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {/* Generate All button */}
      {onGenerateAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={onGenerateAll}
          disabled={isGeneratingAll}
          className="shrink-0 gap-1.5 text-xs"
        >
          {isGeneratingAll ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <span>Generate All</span>
          )}
        </Button>
      )}

      {children}

      {/* Custom format dialog */}
      <CustomFormatDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={(cf) => {
          if (editingFormat) {
            onEditCustomFormat?.(cf);
          } else {
            onAddCustomFormat?.(cf);
          }
        }}
        editingFormat={editingFormat}
      />
    </div>
  );
}

export default memo(FormatTabs);
