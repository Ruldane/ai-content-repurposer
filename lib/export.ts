import type { Format } from '@/types';
import { getWordCount, getCharCount } from '@/lib/metrics';

function buildFrontmatter(meta: Record<string, string | number>): string {
  const lines = Object.entries(meta).map(([key, value]) =>
    typeof value === 'string' ? `${key}: "${value}"` : `${key}: ${value}`
  );
  return `---\n${lines.join('\n')}\n---\n\n`;
}

function getFilename(format: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${format}-${date}.md`;
}

function buildMarkdownFile(
  format: string,
  content: string,
  sourceTitle: string,
  variant?: 'A' | 'B'
): string {
  const source = sourceTitle.slice(0, 50);
  const meta: Record<string, string | number> = {
    source,
    format,
    generated: new Date().toISOString(),
    word_count: getWordCount(content),
    character_count: getCharCount(content),
    tool: 'AI Content Repurposer',
  };
  if (variant) {
    meta.variant = variant;
  }
  const frontmatter = buildFrontmatter(meta);
  return frontmatter + content;
}

export function exportSingleFormat(
  format: Format | string,
  content: string,
  sourceTitle: string,
  variant?: 'A' | 'B'
): void {
  const fileContent = buildMarkdownFile(format, content, sourceTitle, variant);
  const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = getFilename(format);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportAllFormats(
  outputs: Record<string, string | null>,
  sourceTitle: string
): Promise<void> {
  const [JSZip, { saveAs }] = await Promise.all([
    import('jszip').then((m) => m.default),
    import('file-saver'),
  ]);

  const zip = new JSZip();

  for (const [format, content] of Object.entries(outputs)) {
    if (!content) continue;
    const fileContent = buildMarkdownFile(format, content, sourceTitle);
    zip.file(getFilename(format), fileContent);
  }

  const date = new Date().toISOString().slice(0, 10);
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `content-repurposed-${date}.zip`);
}
