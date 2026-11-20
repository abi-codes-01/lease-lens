import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { verifyQuotes } from './verifyQuotes.js';

describe('verifyQuotes', () => {
  it('keeps a quote with different spacing, case, and curly quotes and drops an invented quote', () => {
    const agreementText = [
      '4. Security Deposit:',
      'The Tenant\'s "security deposit" of Rs. 1,00,000 shall be',
      'refunded   only after deducting painting charges.',
    ].join('\n');

    const matchingFlag = {
      topic: 'Deposit',
      severity: 'high',
      quote: 'the tenant\u2019s \u201Csecurity deposit\u201D of rs. 1,00,000   shall be refunded only after deducting painting charges.',
      meaning: 'The landlord can cut painting costs from your deposit.',
      askLandlord: 'Can you cap painting deductions to actual receipts?',
    };

    const inventedFlag = {
      topic: 'Use and guests',
      severity: 'medium',
      quote: 'No visitors are permitted on the premises after 9 PM.',
      meaning: 'You cannot have guests over late at night.',
      askLandlord: 'Are family members allowed to stay overnight?',
    };

    const verified = verifyQuotes([matchingFlag, inventedFlag], agreementText);

    assert.equal(verified.length, 1);
    assert.deepEqual(verified[0], matchingFlag);
  });
});
