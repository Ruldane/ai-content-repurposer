/**
 * Content scoring utilities: readability (Flesch-Kincaid) + sentiment
 */

export interface ContentScore {
  readability: number; // 0–100 Flesch Reading Ease
  readabilityLabel: string;
  readabilityColor: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1 to +1
  avgSentenceLength: number;
  avgWordLength: number;
  sentenceCount: number;
  wordCount: number;
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

function getReadabilityLabel(score: number): string {
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Complex';
}

function getReadabilityColor(score: number): string {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

const POSITIVE_WORDS = new Set([
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best',
  'happy', 'excited', 'thrilled', 'delighted', 'brilliant', 'outstanding', 'perfect',
  'beautiful', 'awesome', 'superb', 'impressive', 'successful', 'achieve', 'growth',
  'improve', 'win', 'benefit', 'valuable', 'innovative', 'creative', 'powerful', 'strong',
  'effective', 'efficient', 'helpful', 'positive', 'success', 'opportunity', 'proud',
  'confident', 'excited', 'inspiring', 'motivated', 'passionate', 'enthusiastic',
]);

const NEGATIVE_WORDS = new Set([
  'bad', 'terrible', 'awful', 'horrible', 'poor', 'fail', 'failure', 'disappointing',
  'worse', 'worst', 'problem', 'issue', 'difficult', 'hard', 'struggle', 'unfortunately',
  'sorry', 'mistake', 'error', 'broken', 'lacking', 'missing', 'weak', 'slow', 'boring',
  'dull', 'frustrating', 'complicated', 'confusing', 'negative', 'risk', 'danger',
  'concern', 'difficult', 'challenge', 'obstacle', 'barrier', 'limit', 'fail',
]);

export function analyzeContent(text: string): ContentScore {
  const empty: ContentScore = {
    readability: 0,
    readabilityLabel: 'N/A',
    readabilityColor: 'yellow',
    sentiment: 'neutral',
    sentimentScore: 0,
    avgSentenceLength: 0,
    avgWordLength: 0,
    sentenceCount: 0,
    wordCount: 0,
  };

  if (!text || text.trim().length === 0) return empty;

  // Strip markdown syntax
  const plain = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/[#*_~\[\]()>|]/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = plain.split(/[.!?]+/).filter((s) => s.trim().split(/\s+/).length >= 3);
  const words = plain.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) return empty;

  const sentenceCount = Math.max(sentences.length, 1);
  const syllableCount = words.reduce((acc, w) => acc + countSyllables(w), 0);
  const wordsPerSentence = words.length / sentenceCount;
  const syllablesPerWord = syllableCount / words.length;

  const readability = Math.max(
    0,
    Math.min(100, Math.round(206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord))
  );

  let posCount = 0;
  let negCount = 0;
  for (const word of words) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (POSITIVE_WORDS.has(clean)) posCount++;
    if (NEGATIVE_WORDS.has(clean)) negCount++;
  }
  const total = posCount + negCount;
  const sentimentScore = total > 0 ? (posCount - negCount) / total : 0;
  const sentiment =
    sentimentScore > 0.15 ? 'positive' : sentimentScore < -0.15 ? 'negative' : 'neutral';

  const avgWordLength =
    Math.round(
      (words.reduce((acc, w) => acc + w.replace(/[^a-z]/gi, '').length, 0) / words.length) * 10
    ) / 10;

  return {
    readability,
    readabilityLabel: getReadabilityLabel(readability),
    readabilityColor: getReadabilityColor(readability),
    sentiment,
    sentimentScore,
    avgSentenceLength: Math.round(wordsPerSentence),
    avgWordLength,
    sentenceCount,
    wordCount: words.length,
  };
}
