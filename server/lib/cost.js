export const PRICES_USD_PER_MILLION = {
  'gemini-3.5-flash-lite': { input: 0, output: 0 },
};

export function costInr({ input_tokens, output_tokens }) {
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const price = PRICES_USD_PER_MILLION[model] ?? { input: 0, output: 0 };
  const usdInr = Number(process.env.USD_INR) || 88;
  const costUsd = (input_tokens * price.input + output_tokens * price.output) / 1_000_000;
  return Number((costUsd * usdInr).toFixed(4));
}
