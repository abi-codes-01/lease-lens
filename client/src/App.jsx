import { useEffect, useRef, useState } from 'react';
import { reviewAgreement } from './lib/api.js';
import { copyText } from './lib/clipboard.js';
import UploadForm from './components/UploadForm.jsx';
import LoadingState from './components/LoadingState.jsx';
import RiskSummary from './components/RiskSummary.jsx';
import KeyTerms from './components/KeyTerms.jsx';
import SeverityFilters from './components/SeverityFilters.jsx';
import FlagCard from './components/FlagCard.jsx';
import ErrorState from './components/ErrorState.jsx';

const COPY_ALL_FEEDBACK_MS = 2_500;

function formatQuestionsForWhatsApp(flags) {
  const lines = flags.map((flag, index) => `${index + 1}. [${flag.topic}] ${flag.askLandlord}`);
  return [
    'Hi, I read through the rental agreement and had a few questions before signing:',
    '',
    ...lines,
  ].join('\n');
}

export default function App() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [copiedAll, setCopiedAll] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  async function handleReview(file) {
    setStatus('loading');
    setResult(null);
    setErrorMessage('');
    setSeverityFilter('all');
    setCopiedAll(false);

    try {
      const review = await reviewAgreement(file);
      setResult(review);
      setStatus('done');
    } catch (error) {
      setErrorMessage(
        error?.message || 'Could not reach the server. Check your connection and try again.',
      );
      setStatus('error');
    }
  }

  function handleReset() {
    setStatus('idle');
    setResult(null);
    setErrorMessage('');
    setSeverityFilter('all');
    setCopiedAll(false);
  }

  async function handleCopyAllQuestions() {
    if (!result?.flags?.length) {
      return;
    }
    try {
      await copyText(formatQuestionsForWhatsApp(result.flags));
      setCopiedAll(true);
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = setTimeout(() => {
        setCopiedAll(false);
      }, COPY_ALL_FEEDBACK_MS);
    } catch {
      setCopiedAll(false);
    }
  }

  const allFlags = result?.flags ?? [];
  const visibleFlags =
    severityFilter === 'all'
      ? allFlags
      : allFlags.filter((flag) => flag.severity === severityFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[680px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3 5 6v5.5c0 4.6 3 8.8 7 10 4-1.2 7-5.4 7-10V6l-7-3Z" />
                <path d="m9.5 12 1.8 1.8 3.7-3.8" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">Lease Lens</h1>
          </div>

          {status === 'done' && (
            <button
              type="button"
              onClick={handleReset}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-xs transition hover:bg-slate-100 active:scale-[0.98]"
            >
              New review
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[680px] space-y-5 px-4 py-7 sm:px-6 sm:py-9">
        {status !== 'done' && (
          <section className="space-y-1.5">
            <p className="text-base leading-relaxed text-slate-600">
              Spot rental agreement clauses that could cost you your deposit, lock-in, or extra fees before you sign.
            </p>
          </section>
        )}

        {status === 'idle' && <UploadForm onSubmit={handleReview} />}

        {status === 'loading' && <LoadingState />}

        {status === 'error' && <ErrorState message={errorMessage} onRetry={handleReset} />}

        {status === 'done' && result && (
          <div className="space-y-5">
            <div
              role="note"
              className="rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
            >
              This is not legal advice. For anything serious, talk to a lawyer.
            </div>

            <RiskSummary flags={allFlags} />

            <KeyTerms keyTerms={result.keyTerms} />

            {allFlags.length === 0 ? (
              <div className="rounded-2xl bg-white p-5 text-base text-slate-700 shadow-sm ring-1 ring-slate-200/90">
                Nothing risky stood out. Still read it yourself before you sign.
              </div>
            ) : (
              <section aria-label="Flagged clauses" className="space-y-4">
                <SeverityFilters
                  flags={allFlags}
                  selected={severityFilter}
                  onSelect={setSeverityFilter}
                />

                {visibleFlags.length === 0 ? (
                  <div className="rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200/90">
                    No {severityFilter}-severity clauses were flagged.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleFlags.map((flag, index) => (
                      <FlagCard key={`${flag.topic}-${flag.severity}-${index}`} flag={flag} />
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCopyAllQuestions}
                  className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-semibold shadow-xs transition active:scale-[0.99] ${
                    copiedAll
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {copiedAll ? (
                    <>
                      <svg
                        className="h-5 w-5"
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
                      <span>Copied questions for WhatsApp!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Copy all questions for WhatsApp</span>
                    </>
                  )}
                </button>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
