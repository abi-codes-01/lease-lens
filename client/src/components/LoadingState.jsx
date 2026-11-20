import { useEffect, useState } from 'react';

const SLOW_NOTICE_DELAY_MS = 15_000;

export default function LoadingState() {
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setIsSlow(true);
    }, SLOW_NOTICE_DELAY_MS);
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-slate-200"
    >
      <div
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"
      />
      <p className="mt-4 text-base font-medium text-slate-800">
        Reading every clause. This takes about 20 seconds...
      </p>
      {isSlow && (
        <p className="mt-2 text-sm text-slate-500">
          Long agreement, still reading...
        </p>
      )}
    </div>
  );
}
