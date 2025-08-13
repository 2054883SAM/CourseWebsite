import { createClient } from '@deepgram/sdk';

/**
 * Creates a Deepgram SDK client using the DEEPGRAM_API_KEY environment variable.
 * Throws a clear error if the key is not configured.
 */
export function getDeepgramClient() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPGRAM_API_KEY environment variable is not set');
  }
  return createClient(apiKey);
}


