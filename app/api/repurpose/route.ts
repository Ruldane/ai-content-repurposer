import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import { model } from '@/lib/ai';
import { getSystemPrompt } from '@/lib/prompts';
import type { Format, Tone } from '@/types';

/**
 * POST /api/repurpose
 * Streams AI-generated content repurposed for a specific format
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { content, format, tone, customInstructions } = body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return Response.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Validate format
    const validFormats: Format[] = ['linkedin', 'twitter', 'email', 'docs'];
    if (!format || !validFormats.includes(format as Format)) {
      return Response.json(
        { error: 'Invalid format' },
        { status: 400 }
      );
    }

    // Get system prompt with optional tone and custom instructions
    const systemPrompt = getSystemPrompt(
      format as Format,
      tone as Tone | undefined,
      customInstructions as string | undefined
    );

    // Stream AI response
    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `Repurpose the following content:\n\n${content}`,
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('AI generation failed:', error);
    return Response.json(
      { error: 'AI generation failed' },
      { status: 500 }
    );
  }
}
