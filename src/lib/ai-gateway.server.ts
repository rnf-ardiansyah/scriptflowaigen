import { createGoogleGenerativeAI } from "@ai-sdk/google";

/**
 * Direct connection to Google's Gemini API (no third-party gateway).
 * Get an API key at https://aistudio.google.com/apikey and put it in
 * GOOGLE_API_KEY in your .env file.
 */
export function createAiProvider(apiKey: string) {
  return createGoogleGenerativeAI({ apiKey });
}
