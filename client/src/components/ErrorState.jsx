export default function ErrorState({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-red-200"
    >
      <p className="text-base font-medium text-red-800">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 w-full cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
      >
        Try again
      </button>
    </div>
  );
}
