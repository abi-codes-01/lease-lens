export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-rose-200"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200/80">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-rose-900">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 w-full cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] sm:w-auto"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
