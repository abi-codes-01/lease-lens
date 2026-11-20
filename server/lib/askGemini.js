import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { reviewRules } from './reviewRules.js';
import { ReviewSchema } from './reviewSchema.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { timeout: 30_000 },
});

const responseJsonSchema = z.toJSONSchema(ReviewSchema);

export async function askGemini(text) {
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const response = await ai.models.generateContent({
    model,
    contents: `<agreement>\n${text}\n</agreement>`,
    config: {
      systemInstruction: reviewRules,
      maxOutputTokens: 3000,
      responseMimeType: 'application/json',
      responseJsonSchema,
    },
  });

  const usageMetadata = response.usageMetadata;
  const usage = {
    input_tokens: usageMetadata?.promptTokenCount ?? 0,
    output_tokens: usageMetadata?.candidatesTokenCount ?? 0,
  };

  const finishReason = response.candidates?.[0]?.finishReason;
  if (finishReason !== 'STOP') {
    const error = new Error(`Gemini stopped early with finishReason: ${finishReason ?? 'UNKNOWN'}`);
    error.usage = usage;
    throw error;
  }

  let rawJson;
  try {
    rawJson = JSON.parse(response.text ?? '');
  } catch (cause) {
    const error = new Error(`Gemini returned invalid JSON: ${cause.message}`);
    error.usage = usage;
    throw error;
  }

  const parsed = ReviewSchema.safeParse(rawJson);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const issuePath = firstIssue?.path?.join('.') || 'root';
    const error = new Error(
      `Gemini reply failed validation at ${issuePath}: ${firstIssue?.message ?? 'invalid shape'}`,
    );
    error.usage = usage;
    throw error;
  }

  return { review: parsed.data, usage };
}
