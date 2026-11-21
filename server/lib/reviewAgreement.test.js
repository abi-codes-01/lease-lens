import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { reviewAgreement, AiUnavailableError, AiConfigError } from './reviewAgreement.js';
import { costInr } from './cost.js';

describe('reviewAgreement', () => {
  it('defaults to gemini-3.5-flash-lite and falls back to gemini-3.8-flash on 504 DEADLINE_EXCEEDED', async () => {
    const previousModel = process.env.GEMINI_MODEL;
    delete process.env.GEMINI_MODEL;
    const modelsCalled = [];
    const waits = [];

    try {
      const result = await reviewAgreement('sample agreement', {
        wait: async (ms) => {
          waits.push(ms);
        },
        ask: async (_text, model) => {
          modelsCalled.push(model);
          if (modelsCalled.length === 1) {
            const err = new Error('Gateway timeout: DEADLINE_EXCEEDED');
            err.status = 504;
            throw err;
          }
          return {
            review: { keyTerms: { monthlyRent: 22000, deposit: 100000, lockInMonths: 6, noticeDays: 30 }, flags: [] },
            usage: { input_tokens: 140, output_tokens: 45 },
          };
        },
      });

      assert.deepEqual(modelsCalled, ['gemini-3.5-flash-lite', 'gemini-3.8-flash']);
      assert.deepEqual(waits, [2_500]);
      assert.equal(result.model, 'gemini-3.8-flash');
    } finally {
      if (previousModel !== undefined) {
        process.env.GEMINI_MODEL = previousModel;
      }
    }
  });

  it('waits 2500ms and switches from gemini-3.8-flash to gemini-3.5-flash-lite on 503', async () => {
    const modelsCalled = [];
    const waits = [];

    const result = await reviewAgreement('sample agreement', {
      primaryModel: 'gemini-3.8-flash',
      wait: async (ms) => {
        waits.push(ms);
      },
      ask: async (_text, model) => {
        modelsCalled.push(model);
        if (modelsCalled.length === 1) {
          const err = new Error('Model temporarily UNAVAILABLE');
          err.status = 503;
          err.usage = { input_tokens: 100, output_tokens: 0 };
          throw err;
        }
        return {
          review: { keyTerms: { monthlyRent: 20000, deposit: 100000, lockInMonths: 6, noticeDays: 30 }, flags: [] },
          usage: { input_tokens: 120, output_tokens: 40 },
        };
      },
    });

    assert.deepEqual(modelsCalled, ['gemini-3.8-flash', 'gemini-3.5-flash-lite']);
    assert.deepEqual(waits, [2_500]);
    assert.deepEqual(result.usage, { input_tokens: 220, output_tokens: 40 });
    assert.equal(result.model, 'gemini-3.5-flash-lite');
  });

  it('waits 2500ms and falls back on 502 and AbortError / timeout', async () => {
    for (const firstError of [
      Object.assign(new Error('The operation was aborted due to timeout'), { name: 'AbortError' }),
      Object.assign(new Error('Bad Gateway'), { status: 502 }),
    ]) {
      const modelsCalled = [];
      const waits = [];

      const result = await reviewAgreement('sample agreement', {
        primaryModel: 'gemini-3.8-flash',
        wait: async (ms) => {
          waits.push(ms);
        },
        ask: async (_text, model) => {
          modelsCalled.push(model);
          if (modelsCalled.length === 1) {
            throw firstError;
          }
          return {
            review: { keyTerms: { monthlyRent: 25000, deposit: 125000, lockInMonths: 11, noticeDays: 60 }, flags: [] },
            usage: { input_tokens: 150, output_tokens: 50 },
          };
        },
      });

      assert.deepEqual(modelsCalled, ['gemini-3.8-flash', 'gemini-3.5-flash-lite']);
      assert.deepEqual(waits, [2_500]);
      assert.equal(result.model, 'gemini-3.5-flash-lite');
    }
  });

  it('switches from gemini-3.5-flash-lite to gemini-3.8-flash on 429 and throws 503 if both fail', async () => {
    const modelsCalled = [];
    const waits = [];

    await assert.rejects(
      () =>
        reviewAgreement('sample agreement', {
          primaryModel: 'gemini-3.5-flash-lite',
          wait: async (ms) => {
            waits.push(ms);
          },
          ask: async (_text, model) => {
            modelsCalled.push(model);
            const err = new Error('Quota exceeded: RESOURCE_EXHAUSTED');
            err.status = 429;
            throw err;
          },
        }),
      (err) => err instanceof AiUnavailableError && err.status === 503 && err.message === 'Our AI is busy. Please try again in a minute.',
    );

    assert.deepEqual(modelsCalled, ['gemini-3.5-flash-lite', 'gemini-3.8-flash']);
    assert.deepEqual(waits, [2_500]);
  });

  it('does not mask 401/403/404/400 config errors as 503 and fails fast with 502', async () => {
    for (const status of [400, 401, 403, 404]) {
      let calls = 0;
      await assert.rejects(
        () =>
          reviewAgreement('sample agreement', {
            primaryModel: 'gemini-3.5-flash-lite',
            wait: async () => {},
            ask: async () => {
              calls += 1;
              const err = new Error(`HTTP ${status} invalid config`);
              err.status = status;
              throw err;
            },
          }),
        (err) =>
          err instanceof AiConfigError &&
          err.status === 502 &&
          err.message === 'AI configuration error. Check server API key and model.',
      );
      assert.equal(calls, 1);
    }
  });
});

describe('costInr', () => {
  it('safely defaults missing usage fields to 0', () => {
    assert.equal(costInr(undefined), 0);
    assert.equal(costInr(null), 0);
    assert.equal(costInr({}), 0);
    assert.equal(costInr({ input_tokens: 500 }), 0);
  });
});
