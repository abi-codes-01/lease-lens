import { Router } from 'express';
import multer from 'multer';
import { readPdf } from '../lib/readPdf.js';
import { reviewAgreement, AiUnavailableError } from '../lib/reviewAgreement.js';
import { verifyQuotes } from '../lib/verifyQuotes.js';
import { costInr } from '../lib/cost.js';
import { isDailyCapReached, recordSpendInr } from '../lib/budget.js';
import { reviewRateLimit } from '../middleware/rateLimit.js';

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const MIN_TEXT_LENGTH = 200;
const MAX_TEXT_LENGTH = 60_000;
const MAX_FLAGS = 8;
const SEVERITY_RANK = { high: 0, medium: 1, low: 2 };

const uploadAgreement = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

const reviewRouter = Router();

reviewRouter.post(
  '/api/review',
  reviewRateLimit,
  uploadAgreement.single('agreement'),
  async (req, res) => {
    if (!req.file || req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Upload the agreement as a PDF.' });
    }

    let text;
    try {
      text = await readPdf(req.file.buffer);
    } catch {
      return res.status(400).json({ error: 'This PDF could not be read. Try exporting it again.' });
    }

    if (text.length < MIN_TEXT_LENGTH) {
      return res.status(422).json({
        error: 'We could not find text in this PDF. Is it a scanned photo?',
      });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(413).json({
        error: 'This agreement is too long for version one. Keep it under 20 pages.',
      });
    }

    if (isDailyCapReached()) {
      console.log('[Cost] daily cap reached');
      return res.status(503).json({
        error: "We've hit today's AI budget. Please try again tomorrow.",
      });
    }

    const startedAt = Date.now();
    let review;
    let usage;
    try {
      ({ review, usage } = await reviewAgreement(text));
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        recordSpendInr(costInr(error.usage));
        return res.status(503).json({ error: error.message });
      }
      throw error;
    }

    const cost = costInr(usage);
    recordSpendInr(cost);

    const verifiedFlags = verifyQuotes(review.flags, text);
    const flags = [...verifiedFlags]
      .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
      .slice(0, MAX_FLAGS);

    const elapsedMs = Date.now() - startedAt;
    console.log(`[AI] reviewed ${text.length} chars in ${elapsedMs} ms, ${flags.length} flags, ₹${cost}`);

    return res.status(200).json({
      keyTerms: review.keyTerms,
      flags,
    });
  },
);

export default reviewRouter;
