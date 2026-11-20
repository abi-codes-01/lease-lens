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
