import { useEffect, useRef, useState } from 'react';
import { copyText } from '../lib/clipboard.js';

const QUOTE_COLLAPSE_LIMIT = 220;
const COPY_FEEDBACK_MS = 2_000;

const SEVERITY_THEMES = {
  high: {
    border: 'border-l-rose-500',
    badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    label: 'High',
  },
  medium: {
    border: 'border-l-amber-500',
    badge: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    label: 'Medium',
  },
  low: {
    border: 'border-l-sky-500',
    badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    label: 'Low',
  },
};

export default function FlagCard({ flag }) {
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const theme = SEVERITY_THEMES[flag.severity] ?? SEVERITY_THEMES.low;
  const isLongQuote = flag.quote.length > QUOTE_COLLAPSE_LIMIT;
  const displayedQuote =
    isLongQuote && !isQuoteExpanded
      ? `${flag.quote.slice(0, QUOTE_COLLAPSE_LIMIT).trimEnd()}…`
      : flag.quote;

  async function handleCopyQuestion() {
    try {
      await copyText(flag.askLandlord);
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, COPY_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      className={`rounded-2xl border-l-4 bg-white p-5 shadow-sm ring-1 ring-slate-200/90 transition ${theme.border}`}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${theme.badge}`}>
          {theme.label}
        </span>
        <h3 className="text-base font-semibold text-slate-950">{flag.topic}</h3>
      </div>

      <div className="mt-3.5 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3">
        <p className="text-[11px] font-medium tracking-wide text-slate-400 uppercase">
          Exact wording in agreement
        </p>
        <blockquote className="mt-1.5 font-serif text-[15px] leading-relaxed text-slate-700">
          “{displayedQuote}”
        </blockquote>
        {isLongQuote && (
          <button
            type="button"
            aria-expanded={isQuoteExpanded}
            onClick={() => setIsQuoteExpanded((prev) => !prev)}
            className="mt-2 cursor-pointer text-xs font-semibold text-slate-700 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-950"
          >
            {isQuoteExpanded ? 'Show less' : 'Show full quote'}
          </button>
        )}
      </div>

      <p className="mt-3.5 text-base leading-relaxed text-slate-800">{flag.meaning}</p>

      <div className="mt-4 rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            What to ask the landlord
          </p>
          <button
            type="button"
            onClick={handleCopyQuestion}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition active:scale-[0.98] ${
              copied
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            {copied ? (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m4.5 10.5 3.5 3.5 7.5-8" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy question</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-2 text-base leading-relaxed font-semibold text-slate-950">
          {flag.askLandlord}
        </p>
      </div>
    </article>
  );
}
