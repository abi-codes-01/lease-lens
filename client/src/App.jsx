import { useState } from 'react';
import { reviewAgreement } from './lib/api.js';
import UploadForm from './components/UploadForm.jsx';
import LoadingState from './components/LoadingState.jsx';
import KeyTerms from './components/KeyTerms.jsx';
import FlagCard from './components/FlagCard.jsx';
import ErrorState from './components/ErrorState.jsx';

export default function App() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleReview(file) {
    setStatus('loading');
    setResult(null);
    setErrorMessage('');

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
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <main className="mx-auto max-w-[680px] space-y-5">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Lease Lens</h1>
          <p className="text-base text-slate-600">
            Spot rental agreement clauses that could cost you money before you sign.
          </p>
        </header>

        {status === 'idle' && <UploadForm onSubmit={handleReview} />}

        {status === 'loading' && <LoadingState />}

        {status === 'error' && <ErrorState message={errorMessage} onRetry={handleReset} />}

        {status === 'done' && result && (
          <div className="space-y-5">
            <div
              role="note"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
            >
              This is not legal advice. For anything serious, talk to a lawyer.
            </div>

            <KeyTerms keyTerms={result.keyTerms} />

            {result.flags.length === 0 ? (
              <div className="rounded-2xl bg-white p-5 text-base text-slate-700 shadow-sm ring-1 ring-slate-200">
                Nothing risky stood out. Still read it yourself before you sign.
              </div>
            ) : (
              <section aria-label="Flagged clauses" className="space-y-4">
                {result.flags.map((flag, index) => (
                  <FlagCard key={`${flag.topic}-${index}`} flag={flag} />
                ))}
              </section>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-5 py-3 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Check another agreement
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
