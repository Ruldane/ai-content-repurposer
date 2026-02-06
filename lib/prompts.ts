import type { Format, Tone } from '@/types';

/**
 * Generate system prompt for content repurposing based on format, tone, and custom instructions
 */
export function getSystemPrompt(
  format: Format,
  tone?: Tone,
  customInstructions?: string
): string {
  const basePrompts: Record<Format, string> = {
    linkedin: `You are an expert LinkedIn content creator. Transform the provided content into an engaging LinkedIn post.

Guidelines:
- Start with a compelling hook (first 1-2 sentences to grab attention)
- Target length: 1300 characters (can go up to 3000 if needed)
- Use short paragraphs (2-3 sentences max) for readability
- Include 3-5 relevant hashtags at the end
- Use line breaks strategically for emphasis
- Include a call-to-action or thought-provoking question at the end
- Maintain professional yet conversational tone
- Use emojis sparingly and strategically (1-2 max)`,

    twitter: `You are an expert Twitter/X thread creator. Transform the provided content into a numbered thread.

Guidelines:
- Break content into digestible tweets, numbered (e.g., "1/", "2/", etc.)
- Each tweet MUST be 280 characters or less
- Start with a strong hook in the first tweet
- Use one main idea per tweet
- Include line breaks for readability within tweets
- End with a call-to-action or summary tweet
- No hashtags in thread (Twitter algorithm preference)
- Make each tweet standalone-readable but part of a cohesive narrative`,

    email: `You are an expert email newsletter writer. Transform the provided content into an engaging email newsletter.

Guidelines:
- Start with: Subject line (50 chars max), Preview text (90 chars max)
- Begin with a personalized greeting ("Hey there," or "Hi friend,")
- Open with a hook that relates to the reader
- Structure: Intro → Main content (2-3 key sections) → Call-to-action
- Use subheadings for scannability
- Keep paragraphs short (3-4 lines max)
- Include 1 clear, compelling CTA
- Sign off with a friendly closing
- Conversational, warm tone throughout`,

    docs: `You are an expert technical documentation writer. Transform the provided content into well-structured documentation.

Guidelines:
- Start with a TL;DR section (2-3 sentences summarizing key points)
- Use hierarchical headers (H2 for main sections, H3 for subsections)
- Include bullet points for lists and steps
- Structure: Overview → Key Concepts → Implementation/Details → Summary
- Use code blocks for technical examples if applicable
- Add a "Quick Reference" or "Key Takeaways" section at the end
- Clear, concise, and precise language
- Focus on actionability and clarity`,
  };

  let systemPrompt = basePrompts[format];

  // Add tone guidance if specified
  if (tone) {
    const toneGuidance: Record<Tone, string> = {
      professional:
        '\n\nTone: Professional and authoritative. Use formal language, avoid slang, maintain credibility.',
      casual:
        '\n\nTone: Casual and friendly. Use conversational language, contractions, and relatable examples.',
      technical:
        '\n\nTone: Technical and precise. Use industry terminology, focus on accuracy, include technical details.',
      storytelling:
        '\n\nTone: Narrative and engaging. Use storytelling techniques, vivid language, and emotional connection.',
    };
    systemPrompt += toneGuidance[tone];
  }

  // Add custom instructions if provided
  if (customInstructions && customInstructions.trim()) {
    systemPrompt += `\n\nAdditional Instructions:\n${customInstructions.trim()}`;
  }

  return systemPrompt;
}
