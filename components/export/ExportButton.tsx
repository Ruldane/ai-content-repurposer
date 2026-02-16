'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { exportSingleFormat } from '@/lib/export';
import type { Format } from '@/types';

interface ExportButtonProps {
  format: Format;
  content: string;
  sourceTitle: string;
  disabled?: boolean;
  variant?: 'A' | 'B';
}

export function ExportButton({
  format,
  content,
  sourceTitle,
  disabled = false,
  variant,
}: ExportButtonProps) {
  const handleExport = () => {
    try {
      exportSingleFormat(format, content, sourceTitle, variant);
      toast.success('Export complete', {
        description: `Downloaded ${format} content as .md file`,
      });
    } catch {
      toast.error('Export failed', {
        description: 'Could not download the file. Please try again.',
      });
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || !content}
      variant="outline"
      size="sm"
      className="gap-2"
      aria-label={`Export ${format} as markdown`}
    >
      <Download className="size-4" />
      <span>Export .md</span>
    </Button>
  );
}
