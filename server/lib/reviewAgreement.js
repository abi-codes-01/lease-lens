import { askGemini } from './askGemini.js';

const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 2_500;
const DEFAULT_PRIMARY_MODEL = 'gemini-3.5-flash-lite';
const ALTERNATE_FLASH_MODEL = 'gemini-3.8-flash';
const CONFIG_ERROR_STATUSES = new Set([400, 401, 403, 404]);
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

export class AiUnavailableError extends Error {
  constructor(usage) {
    super('Our AI is busy. Please try again in a minute.');
    this.name = 'AiUnavailableError';
    this.status = 503;
    this.usage = usage;
  }
}

export class AiConfigError extends Error {
  constructor(usage) {
    super('AI configuration error. Check server API key and model.');
    this.name = 'AiConfigError';
    this.status = 502;
    this.usage = usage;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractErrorStatus(error) {
  const numericStatus = Number(error?.status ?? error?.code);
  if (Number.isInteger(numericStatus) && numericStatus >= 100) {
    return numericStatus;
  }
  const message = String(error?.message ?? '');
  const codeMatch = message.match(/"code"\s*:\s*(\d{3})/);
  if (codeMatch) {
    return Number(codeMatch[1]);
  }
  if (message.includes('DEADLINE_EXCEEDED')) {
    return 504;
  }
  if (message.includes('UNAVAILABLE')) {
    return 503;
  }
  if (message.includes('RESOURCE_EXHAUSTED')) {
    return 429;
  }
  return null;
}

function isRetryableError(error) {
  const status = extractErrorStatus(error);
  const message = String(error?.message ?? '');
  return (
    (status !== null && RETRYABLE_STATUSES.has(status)) ||
    error?.name === 'AbortError' ||
    error?.cause?.name === 'AbortError' ||
    /aborted|timeout|UNAVAILABLE|RESOURCE_EXHAUSTED|DEADLINE_EXCEEDED/i.test(message)
  );
}

function isConfigError(error) {
  const status = extractErrorStatus(error);
  if (status && CONFIG_ERROR_STATUSES.has(status)) {
    return true;
  }
  const message = String(error?.message ?? '');
  return (
    message.includes('API_KEY_INVALID') ||
    message.includes('INVALID_ARGUMENT') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('UNAUTHENTICATED') ||
    message.includes('NOT_FOUND')
  );
}

function getAlternateModel(primaryModel) {
  return primaryModel === ALTERNATE_FLASH_MODEL ? DEFAULT_PRIMARY_MODEL : ALTERNATE_FLASH_MODEL;
}

function formatAttemptError(error, model) {
  const status = extractErrorStatus(error);
  const parts = [
    `model=${model}`,
    `name=${error?.name ?? 'Error'}`,
    `status=${status ?? 'none'}`,
    `message=${error?.message ?? 'unknown error'}`,
  ];
  if (Array.isArray(error?.zodIssues) && error.zodIssues.length > 0) {
    parts.push(`zodIssues=${JSON.stringify(error.zodIssues)}`);
  }
  return parts.join(' | ');
}

export async function reviewAgreement(
  text,
  { ask = askGemini, wait = sleep, primaryModel = process.env.GEMINI_MODEL || DEFAULT_PRIMARY_MODEL } = {},
) {
  const totalUsage = { input_tokens: 0, output_tokens: 0 };
  let currentModel = primaryModel;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const { review, usage } = await ask(text, currentModel);
      totalUsage.input_tokens += usage?.input_tokens ?? 0;
      totalUsage.output_tokens += usage?.output_tokens ?? 0;
      return { review, usage: totalUsage, model: currentModel };
    } catch (error) {
      lastError = error;
      if (error?.usage) {
        totalUsage.input_tokens += error.usage.input_tokens ?? 0;
        totalUsage.output_tokens += error.usage.output_tokens ?? 0;
      }

      console.error(`[AI] attempt ${attempt} failed: ${formatAttemptError(error, currentModel)}`);

      if (isConfigError(error)) {
        throw new AiConfigError(totalUsage);
      }

      if (attempt < MAX_ATTEMPTS && isRetryableError(error)) {
        const fallbackModel = getAlternateModel(primaryModel);
        console.log(
          `[AI] retrying in ${RETRY_DELAY_MS}ms with fallback model ${fallbackModel}`,
        );
        await wait(RETRY_DELAY_MS);
        currentModel = fallbackModel;
      }
    }
  }

  if (isConfigError(lastError)) {
    throw new AiConfigError(totalUsage);
  }

  throw new AiUnavailableError(totalUsage);
}
