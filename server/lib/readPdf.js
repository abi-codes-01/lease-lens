const PAGE_MARKER_LINE = /^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gm;

class MinimalDOMMatrix {
  constructor(init = [1, 0, 0, 1, 0, 0]) {
    const values = Array.isArray(init) && init.length >= 6 ? init : [1, 0, 0, 1, 0, 0];
    [this.a, this.b, this.c, this.d, this.e, this.f] = values;
    this.m11 = this.a;
    this.m12 = this.b;
    this.m21 = this.c;
    this.m22 = this.d;
    this.m41 = this.e;
    this.m42 = this.f;
    this.is2D = true;
  }
}

function ensurePdfGlobals() {
  if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = MinimalDOMMatrix;
  }
}

function cleanPdfText(rawText) {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(PAGE_MARKER_LINE, '')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function readPdf(buffer) {
  ensurePdfGlobals();
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  try {
    const { text } = await parser.getText();
    return cleanPdfText(text ?? '');
  } finally {
    await parser.destroy();
  }
}
