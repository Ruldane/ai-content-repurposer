'use client';

import { useCompletion } from '@ai-sdk/react';
import type { Format, Tone } from '@/types';

/**
 * Hook for streaming AI content repurposing
 */
export function useRepurpose() {
  const {
    completion,
    isLoading,
    error: completionError,
    complete,
  } = useCompletion({
    api: '/api/repurpose',
    streamProtocol: 'text',
  });

  const generate = async (
    content: string,
    format: Format | string,
    tone?: Tone,
    customInstructions?: string,
    customSystemPrompt?: string
  ) => {
    await complete(content, {
      body: {
        format,
        tone,
        customInstructions,
        customSystemPrompt,
      },
    });
  };

  return {
    output: completion,
    isLoading,
    error: completionError?.message ?? null,
    generate,
  };
}
