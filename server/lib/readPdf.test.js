import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readPdf } from './readPdf.js';

const SAMPLE_PDF = Buffer.from(
  [
    '%PDF-1.4',
    '1 0 obj',
    '<< /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj',
    '<< /Type /Pages /Kids [4 0 R 6 0 R] /Count 2 >>',
    'endobj',
    '3 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    'endobj',
    '4 0 obj',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>',
    'endobj',
    '5 0 obj',
    '<< /Length 49 >>',
    'stream',
    'BT /F1 12 Tf 50 750 Td (Monthly Rent Rs 28000) Tj ET',
    'endstream',
    'endobj',
    '6 0 obj',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 7 0 R >>',
    'endobj',
    '7 0 obj',
    '<< /Length 50 >>',
    'stream',
    'BT /F1 12 Tf 50 750 Td (Lock-in Period 11 Months) Tj ET',
    'endstream',
    'endobj',
    'xref',
    '0 8',
    '0000000000 65535 f ',
    '0000000009 00000 n ',
    '0000000058 00000 n ',
    '0000000120 00000 n ',
    '0000000190 00000 n ',
    '0000000321 00000 n ',
    '0000000420 00000 n ',
    '0000000551 00000 n ',
    'trailer',
    '<< /Size 8 /Root 1 0 R >>',
    'startxref',
    '651',
    '%%EOF',
  ].join('\n'),
  'utf8',
);

describe('readPdf', () => {
  it('polyfills missing globals, extracts text from a sample PDF, and strips page markers', async () => {
    delete globalThis.DOMMatrix;
    delete globalThis.Path2D;
    delete globalThis.ImageData;

    const text = await readPdf(SAMPLE_PDF);

    assert.equal(typeof globalThis.DOMMatrix, 'function');
    assert.equal(typeof globalThis.Path2D, 'function');
    assert.equal(typeof globalThis.ImageData, 'function');
    assert.equal(text, 'Monthly Rent Rs 28000\n\nLock-in Period 11 Months');
  });

  it('throws the friendly error when given invalid PDF bytes', async () => {
    await assert.rejects(
      () => readPdf(Buffer.from('not a valid pdf')),
      { message: 'This PDF could not be read. Try exporting it again.' },
    );
  });
});
