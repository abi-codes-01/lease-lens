# Decision document

## 1. Scope of version one

- **Decision:** Define the exact boundaries of what Lease Lens version one does and does not do before building any features.
- **Options considered:**
  1. Broad first release supporting scanned PDFs, saved review history, user accounts, Tamil translation, and legality verdicts.
  2. Focused single-session review for one text-based PDF that extracts key terms and flags up to 8 risky clauses backed by verbatim quotes from the document, with a clear disclaimer.
- **Chosen:** Option 2 — focused single-session review for text-based PDFs.
  - **Does:**
    - Upload one text-based PDF rental agreement.
    - Show key terms: rent, deposit, lock-in, notice period.
    - Flag up to 8 risky clauses, each with the exact quote from the agreement, a plain meaning, and a question for the landlord.
    - Drop any flag whose quote is not found in the agreement.
    - Show "not legal advice" on every review.
  - **Does not yet:**
    - Legal advice or "this is illegal" verdicts.
    - Scanned or photographed agreements (OCR).
    - Saving the agreement or any review result.
    - User login or accounts.
    - Tamil output.
- **Why:** First-time tenants need a fast, trustworthy check against hidden costs without hallucinated clauses or unlicensed legal claims. Limiting v1 to text-based PDFs, quote-verified flags, and stateless reviews keeps accuracy high, avoids storing sensitive personal documents, and keeps the first milestone small enough to ship and validate quickly.
- **Revisit when:** Version one is working end-to-end on real Indian rental agreements and users consistently ask for scanned PDF support (OCR), Tamil output, or saved reviews.

## 2. In-memory daily AI budget cap

- **Decision:** Track today's AI spend in server memory keyed by today's IST date (`UTC+5:30`) and stop calling Gemini once `DAILY_CAP_INR` is reached.
- **Options considered:**
  1. External persistent counter (Redis, Vercel KV, or Postgres) shared across every serverless instance.
  2. In-memory map keyed by today's IST date (`YYYY-MM-DD`), requiring zero external infrastructure.
- **Chosen:** Option 2 — in-memory IST daily counter as a speed bump for version one.
- **Why:** Version one has no database or external cache. Keeping spend in memory keyed by IST avoids extra infrastructure and stops runaway loops on a warm instance. Because Vercel resets memory whenever a new serverless instance cold-starts or scales horizontally, this cap is explicitly a speed bump rather than a hard billing guarantee; Google Cloud billing alerts/quotas remain the real ceiling.
- **Revisit when:** Traffic grows enough that multiple concurrent instances regularly run on Vercel, or once a shared store (Redis/KV/DB) is introduced for another feature.
