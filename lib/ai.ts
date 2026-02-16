import { createAnthropic } from '@ai-sdk/anthropic';

/**
 * Configure the Anthropic-compatible AI provider (Z AI)
 * Uses environment variables for API key, base URL, and model configuration
 */
const provider = createAnthropic({
  baseURL: process.env.Z_AI_BASE_URL?.replace(/\/messages\/?$/, '') || process.env.Z_AI_BASE_URL,
  apiKey: process.env.Z_AI_API_KEY,
});

/**
 * Export the configured model instance
 * Defaults to 'glm-4.7' if Z_AI_MODEL is not set
 */
export const model = provider(process.env.Z_AI_MODEL || 'glm-4.7');
