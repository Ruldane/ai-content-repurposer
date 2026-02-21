import { generateText } from 'ai';
import { NextRequest } from 'next/server';
import { model } from '@/lib/ai';

/**
 * POST /api/suggestions
 * Returns AI-generated hashtag and emoji suggestions for the given content and format.
 */
export async function POST(req: NextRequest) {
  try {
    const { content, format } = await req.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    const result = await generateText({
      model,
      system: `You are a social media expert. Analyze content and return ONLY a valid JSON object — no prose, no markdown.
Format: {"hashtags":["#Tag1","#Tag2",...],"emojis":["🚀","💡",...]}
Rules:
- Provide 6–8 hashtags relevant to the topic, using CamelCase
- Provide 6–8 emojis that match the tone and subject
- Hashtags must start with #
- No explanation, no extra text`,
      prompt: `Suggest hashtags and emojis for this ${format} post:\n\n${content.slice(0, 800)}`,
    });

    const text = result.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ hashtags: [], emojis: [] });
    }

    const suggestions = JSON.parse(jsonMatch[0]) as { hashtags: string[]; emojis: string[] };
    return Response.json({
      hashtags: Array.isArray(suggestions.hashtags) ? suggestions.hashtags.slice(0, 10) : [],
      emojis: Array.isArray(suggestions.emojis) ? suggestions.emojis.slice(0, 10) : [],
    });
  } catch (error) {
    console.error('Suggestions failed:', error);
    return Response.json({ hashtags: [], emojis: [] });
  }
}
