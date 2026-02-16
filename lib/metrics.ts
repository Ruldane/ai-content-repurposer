import type { Format } from '@/types';

/**
 * Get word count from text
 */
export function getWordCount(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * Get character count from text (including spaces)
 */
export function getCharCount(text: string): number {
  return text.length;
}

/**
 * Get estimated reading time
 */
export function getReadingTime(text: string): string {
  const wordCount = getWordCount(text);
  if (wordCount === 0) return '0 min read';
  const minutes = Math.ceil(wordCount / 225);
  return `${minutes} min read`;
}

export interface PlatformMetric {
  label: string;
  value: string | number;
  color: 'default' | 'yellow' | 'red';
}

/**
 * Get platform-specific metrics with color-coded warnings
 */
export function getPlatformMetrics(format: Format, content: string): PlatformMetric[] {
  if (!content) return [];

  switch (format) {
    case 'linkedin': {
      const chars = getCharCount(content);
      let color: PlatformMetric['color'] = 'default';
      if (chars > 3000) color = 'red';
      else if (chars > 1300) color = 'yellow';
      return [
        { label: 'Chars', value: chars.toLocaleString(), color },
        { label: 'Words', value: getWordCount(content).toLocaleString(), color: 'default' },
      ];
    }

    case 'twitter': {
      const tweets = content.split(/\n?\d+\/\s*\n?/).filter(Boolean);
      const tweetCount = Math.max(tweets.length, 1);
      const overLimit = tweets.some((t) => t.trim().length > 280);
      return [
        { label: 'Tweets', value: tweetCount, color: 'default' },
        {
          label: 'Status',
          value: overLimit ? 'Over 280 chars!' : 'Within limits',
          color: overLimit ? 'red' : 'default',
        },
      ];
    }

    case 'email': {
      const lines = content.split('\n');
      const subjectLine = lines.find((l) => l.toLowerCase().startsWith('subject:'));
      const previewLine = lines.find((l) => l.toLowerCase().startsWith('preview:'));
      const metrics: PlatformMetric[] = [];

      if (subjectLine) {
        const subjectLen = subjectLine.replace(/^subject:\s*/i, '').length;
        metrics.push({
          label: 'Subject',
          value: `${subjectLen} chars`,
          color: subjectLen > 50 ? 'red' : 'default',
        });
      }
      if (previewLine) {
        const previewLen = previewLine.replace(/^preview:\s*/i, '').length;
        metrics.push({
          label: 'Preview',
          value: `${previewLen} chars`,
          color: previewLen > 90 ? 'red' : 'default',
        });
      }
      metrics.push({
        label: 'Words',
        value: getWordCount(content).toLocaleString(),
        color: 'default',
      });
      return metrics;
    }

    case 'docs': {
      const headers = content.match(/^#{2,3}\s/gm);
      const sectionCount = headers ? headers.length : 0;
      return [
        { label: 'Sections', value: sectionCount, color: 'default' },
        { label: 'Reading', value: getReadingTime(content), color: 'default' },
        { label: 'Words', value: getWordCount(content).toLocaleString(), color: 'default' },
      ];
    }

    default:
      return [
        { label: 'Words', value: getWordCount(content).toLocaleString(), color: 'default' },
        { label: 'Chars', value: getCharCount(content).toLocaleString(), color: 'default' },
      ];
  }
}
