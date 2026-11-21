import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const PAGE_MARKER_LINE = /^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gm;
let workerConfigured = false;

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

class MinimalPath2D {
  addPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  bezierCurveTo() {}
  quadraticCurveTo() {}
  arc() {}
  arcTo() {}
  ellipse() {}
  rect() {}
}

class MinimalImageData {
  constructor(dataOrWidth, widthOrHeight, maybeHeight) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = dataOrWidth;
      this.width = widthOrHeight;
      this.height = maybeHeight ?? Math.floor(dataOrWidth.length / (widthOrHeight * 4));
    }
  }
}

function ensurePdfGlobals() {
  if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = MinimalDOMMatrix;
  }
  if (typeof globalThis.Path2D === 'undefined') {
    globalThis.Path2D = MinimalPath2D;
  }
  if (typeof globalThis.ImageData === 'undefined') {
    globalThis.ImageData = MinimalImageData;
  }
}

function resolvePdfWorkerUrl() {
  const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
  return pathToFileURL(workerPath).href;
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
  let parser;
  try {
    ensurePdfGlobals();
    const { PDFParse } = await import('pdf-parse');
    if (!workerConfigured) {
      PDFParse.setWorker(resolvePdfWorkerUrl());
      workerConfigured = true;
    }
    parser = new PDFParse({ data: buffer });
    const { text } = await parser.getText();
    return cleanPdfText(text ?? '');
  } catch (err) {
    console.error('[PDF] read failed:', err);
    throw new Error('This PDF could not be read. Try exporting it again.');
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
}
