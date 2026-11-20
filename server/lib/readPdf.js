import { PDFParse } from 'pdf-parse';

const PAGE_MARKER_LINE = /^\s*--\s*\d+\s+of\s+\d+\s*--\s*$/gm;

function cleanPdfText(rawText) {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(PAGE_MARKER_LINE, '')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function readPdf(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    const { text } = await parser.getText();
    return cleanPdfText(text ?? '');
  } finally {
    await parser.destroy();
  }
}
