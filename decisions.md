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

## 3. Grounding every flag in verbatim quotes

- **Decision:** Require Gemini to include a word-for-word quote from the agreement for every flag, and drop any flag whose normalised quote is not found in the extracted PDF text.
- **Options considered:**
  1. Trust the AI's plain-English summary without checking whether the clause exists verbatim in the agreement.
  2. Require verbatim quotes in the JSON schema and verify every quote in server code (`verifyQuotes`) before returning flags to the tenant.
- **Chosen:** Option 2 — require verbatim quotes and verify them in code.
- **Why:** A hallucinated warning can cause unnecessary conflict with a landlord and destroy trust in the tool. Verifying quotes programmatically catches invented or paraphrased clauses and lets the tenant verify every flag directly with Ctrl+F in their PDF.
- **Revisit when:** Valid flags are frequently dropped because of PDF line-break quirks or hyphenation, at which point fuzzy/token-based matching can be evaluated without relaxing the grounding guarantee.

## 4. Text-based PDFs only

- **Decision:** Accept only text-based PDFs parsed with `pdf-parse`, and reject scanned or photographed agreements with a `422` message.
- **Options considered:**
  1. Send page images of scanned or photographed agreements to a multimodal model or OCR pipeline.
  2. Extract embedded text locally with `pdf-parse` and reject documents with fewer than 200 extracted characters.
- **Chosen:** Option 2 — text-based PDFs only for version one.
- **Why:** Sending page images dramatically increases payload sizes (fighting Vercel's 4.5 MB body limit), token cost, latency, and OCR errors that break verbatim quote verification. Most broker-drafted Indian rental agreements are exported from Word or Google Docs as text PDFs.
- **Revisit when:** Real users consistently upload phone photos or scanned stamp-paper PDFs and hit the `422` error.

## 5. Store nothing

- **Decision:** Process uploaded PDFs strictly in memory (`multer.memoryStorage()`) and discard both the agreement text and review results immediately after responding.
- **Options considered:**
  1. Save uploaded agreements and review results in a database so users can log in and revisit past reviews.
  2. Stateless request-response processing with zero database, zero file storage, and no logging of agreement text.
- **Chosen:** Option 2 — store nothing.
- **Why:** Rental agreements contain sensitive personal data (full names, Aadhaar/PAN references, home addresses, and financial terms). Storing nothing eliminates data-breach liability, removes the need for login or retention policies, and makes first-time tenants much more comfortable uploading their lease.
- **Revisit when:** Users strongly ask for shareable review links or side-by-side comparisons across lease drafts, and proper encryption, retention windows, and privacy controls are ready.

## 6. Model choice: Gemini 3.5 Flash-Lite free tier

- **Decision:** Run reviews on `gemini-3.5-flash-lite` (free tier) configured through `GEMINI_MODEL`.
- **Options considered:**
  1. Use a larger, paid model for deeper reasoning on long, dense, or unusual agreements.
  2. Start with `gemini-3.5-flash-lite` on the free tier and keep the model swappable via `GEMINI_MODEL`.
- **Chosen:** Option 2 — `gemini-3.5-flash-lite` free tier for version one.
- **Why:** Zero per-request cost lets us share Lease Lens publicly without immediate billing risk, while structured JSON output + Zod validation + quote verification enforce quality guardrails on a fast, lightweight model.
- **Revisit when:** We run a structured comparison testing `gemini-3.5-flash-lite` against a bigger/paid model on the same 5 real Indian rental agreements and see meaningful misses on risky clauses or frequent quote-drop failures.
