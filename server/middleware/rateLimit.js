import rateLimit from 'express-rate-limit';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export const reviewRateLimit = rateLimit({
  windowMs: TEN_MINUTES_MS,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipFailedRequests: true,
  message: { error: 'Five reviews per 10 minutes. Please try again soon.' },
});
