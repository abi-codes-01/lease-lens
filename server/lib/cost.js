export const PRICES_USD_PER_MILLION = {
  'gemini-3.5-flash-lite': { input: 0, output: 0 },
  'gemini-3.8-flash': { input: 0, output: 0 },
};

export function costInr(usage = {}, model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite') {
  const inputTokens = Number(usage?.input_tokens) || 0;
  const outputTokens = Number(usage?.output_tokens) || 0;
  const price = PRICES_USD_PER_MILLION[model] ?? { input: 0, output: 0 };
  const usdInr = Number(process.env.USD_INR) || 88;
  const costUsd = (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
  return Number((costUsd * usdInr).toFixed(4));
}
