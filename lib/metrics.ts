/**
 * Text metrics utilities for content analysis
 */

/**
 * Get word count from text
 */
export function getWordCount(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  // Split by whitespace and filter out empty strings
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
 * Average reading speed: 200-250 words per minute (using 225)
 */
export function getReadingTime(text: string): string {
  const wordCount = getWordCount(text);
  if (wordCount === 0) return '0 min read';

  const minutes = Math.ceil(wordCount / 225);
  return `${minutes} min read`;
}

// TODO: Implement getPlatformMetrics(format, content) in US-014
