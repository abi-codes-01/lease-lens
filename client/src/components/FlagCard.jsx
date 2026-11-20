const SEVERITY_STYLES = {
  high: 'bg-red-100 text-red-800 ring-1 ring-red-200',
  medium: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  low: 'bg-slate-200 text-slate-700 ring-1 ring-slate-300',
};

const SEVERITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export default function FlagCard({ flag }) {
  const chipStyle = SEVERITY_STYLES[flag.severity] ?? SEVERITY_STYLES.low;
  const chipLabel = SEVERITY_LABELS[flag.severity] ?? flag.severity;

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${chipStyle}`}>
          {chipLabel}
        </span>
        <h3 className="text-base font-semibold text-slate-900">{flag.topic}</h3>
      </div>

      <blockquote className="mt-3 rounded-r-lg border-l-4 border-slate-400 bg-slate-100 px-3.5 py-2.5 text-sm leading-relaxed text-slate-700">
        {flag.quote}
      </blockquote>

      <p className="mt-3 text-base leading-relaxed text-slate-800">{flag.meaning}</p>

      <p className="mt-3 text-base leading-relaxed text-slate-800">
        Ask your landlord: <strong className="font-semibold text-slate-950">{flag.askLandlord}</strong>
      </p>
    </article>
  );
}
