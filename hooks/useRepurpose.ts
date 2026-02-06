'use client';

import { useCompletion } from '@ai-sdk/react';
import type { Format, Tone } from '@/types';

/**
 * Hook for streaming AI content repurposing
 *
 * @returns Hook interface with streaming state and generate function
 */
export function useRepurpose() {
  const {
    completion,
    isLoading,
    error: completionError,
    complete,
  } = useCompletion({
    api: '/api/repurpose',
  });

  /**
   * Generate repurposed content for a specific format
   *
   * @param content - Source content to repurpose
   * @param format - Target platform format
   * @param tone - Optional writing tone
   * @param customInstructions - Optional custom instructions
   */
  const generate = async (
    content: string,
    format: Format,
    tone?: Tone,
    customInstructions?: string
  ) => {
    // Send request with format, tone, and customInstructions in the body
    await complete(content, {
      body: {
        format,
        tone,
        customInstructions,
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
