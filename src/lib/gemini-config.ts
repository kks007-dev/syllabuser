/**
 * Utility for handling Gemini API key configuration
 * Supports both GEMINI_API_KEY and NEXT_PUBLIC_GEMINI_API_KEY environment variables
 */

export function getGeminiApiKey(): string | undefined {
  // Try server-side environment variable first
  if (typeof process !== 'undefined' && process.env) {
    return process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
  
  // Fallback for client-side (Next.js public env vars)
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
  
  return undefined;
}

export function validateGeminiApiKey(): void {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'Gemini API key not found. Please set either GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY environment variable.'
    );
  }
}
