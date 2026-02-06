/**
 * Supported output formats for content repurposing
 */
export type Format = 'linkedin' | 'twitter' | 'email' | 'docs';

/**
 * Writing tone options
 */
export type Tone = 'professional' | 'casual' | 'technical' | 'storytelling';

/**
 * Request payload for content repurposing
 */
export interface RepurposeRequest {
  content: string;
  format: Format;
  tone?: Tone;
  customInstructions?: string;
}

/**
 * Application state structure
 */
export interface AppState {
  sourceContent: string;
  outputs: Record<Format, string | null>;
  settings: {
    tones: Record<Format, Tone>;
    customInstructions: string;
    theme: 'light' | 'dark' | 'system';
    autoSave: boolean;
  };
  lastUpdated: string;
}
