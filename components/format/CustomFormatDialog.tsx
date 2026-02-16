'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface CustomFormat {
  id: string;
  name: string;
  icon: string;
  systemPrompt: string;
  charLimit?: number;
}

interface CustomFormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (format: CustomFormat) => void;
  editingFormat?: CustomFormat | null;
}

export function CustomFormatDialog({
  open,
  onOpenChange,
  onSave,
  editingFormat,
}: CustomFormatDialogProps) {
  const [name, setName] = useState(editingFormat?.name ?? '');
  const [icon, setIcon] = useState(editingFormat?.icon ?? '');
  const [systemPrompt, setSystemPrompt] = useState(
    editingFormat?.systemPrompt ?? ''
  );
  const [charLimit, setCharLimit] = useState(
    editingFormat?.charLimit?.toString() ?? ''
  );

  const handleSave = () => {
    if (!name.trim() || !systemPrompt.trim()) return;
    onSave({
      id: editingFormat?.id ?? crypto.randomUUID(),
      name: name.trim(),
      icon: icon.trim() || name.charAt(0).toUpperCase(),
      systemPrompt: systemPrompt.trim(),
      charLimit: charLimit ? parseInt(charLimit, 10) : undefined,
    });
    onOpenChange(false);
    setName('');
    setIcon('');
    setSystemPrompt('');
    setCharLimit('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingFormat ? 'Edit Custom Format' : 'Create Custom Format'}
          </DialogTitle>
          <DialogDescription>
            Define a custom output format with its own prompt and limits.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-foreground">
                Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Instagram Caption"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
            <div className="w-20">
              <label className="mb-1 block text-sm font-medium text-foreground">
                Icon
              </label>
              <input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="emoji"
                maxLength={2}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-center text-sm text-foreground outline-none transition-colors hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are an expert... Transform the content into..."
              rows={5}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              Character Limit (optional)
            </label>
            <input
              type="number"
              value={charLimit}
              onChange={(e) => setCharLimit(e.target.value)}
              placeholder="e.g. 2200"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors hover:border-ring focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || !systemPrompt.trim()}
          >
            {editingFormat ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
