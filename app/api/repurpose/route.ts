import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { model } from '@/lib/ai';
import { getSystemPrompt } from '@/lib/prompts';
import type { Format, Tone } from '@/types';

const VALID_FORMATS: Format[] = ['linkedin', 'twitter', 'email', 'docs'];

/**
 * POST /api/repurpose
 * Streams AI-generated content repurposed for a specific format
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt: content, format, tone, customInstructions, customSystemPrompt } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    if (!format || typeof format !== 'string') {
      return Response.json({ error: 'Invalid format' }, { status: 400 });
    }

    // Build system prompt: use custom prompt for custom formats, otherwise use built-in
    let systemPrompt: string;
    if (VALID_FORMATS.includes(format as Format)) {
      systemPrompt = getSystemPrompt(
        format as Format,
        tone as Tone | undefined,
        customInstructions as string | undefined
      );
    } else if (customSystemPrompt && typeof customSystemPrompt === 'string') {
      systemPrompt = customSystemPrompt;
      if (tone) {
        const toneMap: Record<string, string> = {
          professional: '\n\nTone: Professional and authoritative.',
          casual: '\n\nTone: Casual and friendly.',
          technical: '\n\nTone: Technical and precise.',
          storytelling: '\n\nTone: Narrative and engaging.',
        };
        systemPrompt += toneMap[tone] || '';
      }
      if (customInstructions) {
        systemPrompt += `\n\nAdditional Instructions:\n${customInstructions}`;
      }
    } else {
      return Response.json({ error: 'Invalid format' }, { status: 400 });
    }

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `Repurpose the following content:\n\n${content}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI generation failed:', error);
    return Response.json({ error: 'AI generation failed' }, { status: 500 });
  }
}
