import type { Format } from '@/types';
import { getWordCount, getCharCount } from '@/lib/metrics';

/**
 * Build YAML frontmatter string from metadata
 */
function buildFrontmatter(meta: Record<string, string | number>): string {
  const lines = Object.entries(meta).map(([key, value]) =>
    typeof value === 'string' ? `${key}: "${value}"` : `${key}: ${value}`
  );
  return `---\n${lines.join('\n')}\n---\n\n`;
}

/**
 * Generate a safe filename for the export
 * Pattern: {format}-{YYYY-MM-DD}.md
 */
function getFilename(format: Format): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${format}-${date}.md`;
}

/**
 * Build a complete .md file string with YAML frontmatter for a given format.
 */
function buildMarkdownFile(
  format: Format,
  content: string,
  sourceTitle: string
): string {
  const source = sourceTitle.slice(0, 50);
  const frontmatter = buildFrontmatter({
    source,
    format,
    generated: new Date().toISOString(),
    word_count: getWordCount(content),
    character_count: getCharCount(content),
    tool: 'AI Content Repurposer',
  });
  return frontmatter + content;
}

/**
 * Export a single format as a .md file with YAML frontmatter.
 * Triggers a browser file download.
 */
export function exportSingleFormat(
  format: Format,
  content: string,
  sourceTitle: string
): void {
  const fileContent = buildMarkdownFile(format, content, sourceTitle);
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

/**
 * Export all generated formats as a .zip archive.
 * Skips formats with null/empty content.
 * Uses dynamic imports to avoid bundling jszip/file-saver upfront.
 */
export async function exportAllFormats(
  outputs: Record<Format, string | null>,
  sourceTitle: string
): Promise<void> {
  const [JSZip, { saveAs }] = await Promise.all([
    import('jszip').then((m) => m.default),
    import('file-saver'),
  ]);

  const zip = new JSZip();

  const formats = Object.entries(outputs) as [Format, string | null][];
  for (const [format, content] of formats) {
    if (!content) continue;
    const fileContent = buildMarkdownFile(format, content, sourceTitle);
    zip.file(getFilename(format), fileContent);
  }

  const date = new Date().toISOString().slice(0, 10);
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `content-repurposed-${date}.zip`);
}
