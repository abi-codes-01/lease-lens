import { askGemini } from './askGemini.js';

const MAX_ATTEMPTS = 2;

export class AiUnavailableError extends Error {
  constructor(usage) {
    super('Our AI is busy. Please try again in a minute.');
    this.name = 'AiUnavailableError';
    this.status = 503;
    this.usage = usage;
  }
}

export async function reviewAgreement(text) {
  const totalUsage = { input_tokens: 0, output_tokens: 0 };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const { review, usage } = await askGemini(text);
      totalUsage.input_tokens += usage.input_tokens;
      totalUsage.output_tokens += usage.output_tokens;
      return { review, usage: totalUsage };
    } catch (error) {
      if (error?.usage) {
        totalUsage.input_tokens += error.usage.input_tokens ?? 0;
        totalUsage.output_tokens += error.usage.output_tokens ?? 0;
      }
      console.error(`[AI] attempt ${attempt} failed: ${error?.message ?? 'unknown error'}`);
    }
  }

  throw new AiUnavailableError(totalUsage);
}
