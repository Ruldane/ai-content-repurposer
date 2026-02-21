'use client';

import { useCallback, useState } from 'react';
import {
  Check,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  GitCompare,
  PackageOpen,
  CopyPlus,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { exportAllFormats } from '@/lib/export';
import type { Format } from '@/types';

interface EditorToolbarProps {
  content: string;
  children?: React.ReactNode;
  previewMode?: boolean;
  onPreviewToggle?: () => void;
  diffMode?: boolean;
  onDiffToggle?: () => void;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
  isLoading?: boolean;
  outputs?: Record<Format, string | null>;
  sourceTitle?: string;
  onVariantGenerate?: () => void;
  hasContent?: boolean;
  insightsOpen?: boolean;
  onInsightsToggle?: () => void;
}

export function EditorToolbar({
  content,
  children,
  previewMode,
  onPreviewToggle,
  diffMode,
  onDiffToggle,
  onRegenerate,
  canRegenerate,
  isLoading,
  outputs,
  sourceTitle,
  onVariantGenerate,
  hasContent,
  insightsOpen,
  onInsightsToggle,
}: EditorToolbarProps) {
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

  const handleExportAll = useCallback(async () => {
    if (!outputs || !sourceTitle) return;
    try {
      await exportAllFormats(outputs, sourceTitle);
      toast.success('Export complete', {
        description: 'Downloaded all formats as .zip',
      });
    } catch {
      toast.error('Export failed');
    }
  }, [outputs, sourceTitle]);

  const hasAnyOutput = outputs
    ? Object.values(outputs).some((v) => v !== null && v !== '')
    : false;

  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-muted/30 px-4">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-foreground">Output</span>

        {/* Copy button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleCopy}
              disabled={!content}
              variant="ghost"
              size="icon-sm"
              aria-label="Copy to clipboard"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </TooltipContent>
        </Tooltip>

        {/* Regenerate button */}
        {onRegenerate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onRegenerate}
                disabled={!canRegenerate || isLoading}
                variant="ghost"
                size="icon-sm"
                aria-label="Regenerate"
              >
                <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Regenerate</TooltipContent>
          </Tooltip>
        )}

        {/* Preview toggle */}
        {onPreviewToggle && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onPreviewToggle}
                disabled={!content}
                variant={previewMode ? 'secondary' : 'ghost'}
                size="icon-sm"
                aria-label={previewMode ? 'Exit preview' : 'Preview'}
              >
                {previewMode ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {previewMode ? 'Exit preview' : 'Preview'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Diff toggle */}
        {onDiffToggle && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onDiffToggle}
                disabled={!content}
                variant={diffMode ? 'secondary' : 'ghost'}
                size="icon-sm"
                aria-label={diffMode ? 'Exit diff' : 'Diff view'}
              >
                <GitCompare className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {diffMode ? 'Exit diff' : 'Diff view'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* Generate Variant button */}
        {onVariantGenerate && hasContent && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onVariantGenerate}
                disabled={isLoading}
                variant="ghost"
                size="icon-sm"
                aria-label="Generate variant"
              >
                <CopyPlus className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Generate A/B variant</TooltipContent>
          </Tooltip>
        )}

        {/* Export All button */}
        {outputs && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleExportAll}
                disabled={!hasAnyOutput}
                variant="ghost"
                size="icon-sm"
                aria-label="Export all as zip"
              >
                <PackageOpen className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Export all as .zip</TooltipContent>
          </Tooltip>
        )}

        {/* Insights toggle */}
        {onInsightsToggle && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onInsightsToggle}
                disabled={!content}
                variant={insightsOpen ? 'secondary' : 'ghost'}
                size="icon-sm"
                aria-label={insightsOpen ? 'Hide insights' : 'Show insights'}
              >
                <Lightbulb className="size-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {insightsOpen ? 'Hide insights' : 'Insights'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
