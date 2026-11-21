import { useEffect, useState } from 'react';

const STAGES = [
  { label: 'Extracting text from your PDF', startsAtMs: 0 },
  { label: 'Checking deposit, lock-in, and hidden fee clauses', startsAtMs: 3_000 },
  { label: 'Verifying exact quotes against the agreement', startsAtMs: 9_000 },
];

const SLOW_NOTICE_DELAY_MS = 15_000;

export default function LoadingState() {
  const [activeStage, setActiveStage] = useState(0);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timers = STAGES.slice(1).map((stage, index) =>
      setTimeout(() => {
        setActiveStage(index + 1);
      }, stage.startsAtMs),
    );

    const slowTimer = setTimeout(() => {
      setIsSlow(true);
    }, SLOW_NOTICE_DELAY_MS);

    return () => {
      timers.forEach((timerId) => clearTimeout(timerId));
      clearTimeout(slowTimer);
    };
  }, []);

  return (
    <section
      role="status"
      aria-live="polite"
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/90 sm:p-7"
    >
      <div className="flex items-center gap-3.5">
        <div
          aria-hidden="true"
          className="h-9 w-9 shrink-0 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-900"
        />
        <div>
          <p className="text-base font-semibold text-slate-900">
            Reading every clause. This takes about 20 seconds...
          </p>
          {isSlow && (
            <p className="mt-0.5 text-sm font-medium text-amber-700">
              Long agreement, still reading...
            </p>
          )}
        </div>
      </div>

      <ol className="mt-6 space-y-3.5 border-t border-slate-100 pt-5">
        {STAGES.map((stage, index) => {
          const isCompleted = index < activeStage;
          const isCurrent = index === activeStage;

          return (
            <li key={stage.label} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                      ? 'border-2 border-slate-900 bg-white'
                      : 'border-2 border-slate-200 bg-slate-50'
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m4.5 10.5 3.5 3.5 7.5-8" />
                  </svg>
                ) : isCurrent ? (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-slate-900" />
                ) : null}
              </span>

              <span
                className={`text-sm leading-snug transition ${
                  isCompleted
                    ? 'font-medium text-slate-500'
                    : isCurrent
                      ? 'font-semibold text-slate-900'
                      : 'text-slate-400'
                }`}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
