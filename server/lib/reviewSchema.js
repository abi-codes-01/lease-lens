import { z } from 'zod';

export const TOPICS = [
  'Deposit',
  'Lock-in',
  'Notice period',
  'Rent increase',
  'Repairs and maintenance',
  'Painting and cleaning',
  'Use and guests',
  'Other',
];

export const ReviewSchema = z.object({
  keyTerms: z.object({
    monthlyRent: z.number().nullable(),
    deposit: z.number().nullable(),
    lockInMonths: z.number().nullable(),
    noticeDays: z.number().nullable(),
  }),
  flags: z.array(
    z.object({
      topic: z.enum(TOPICS),
      severity: z.enum(['high', 'medium', 'low']),
      quote: z.string().describe('Exact words copied from the agreement'),
      meaning: z.string().describe('What this means for the tenant, in one plain sentence'),
      askLandlord: z.string().describe('One question to ask before signing'),
    }),
  ),
});
