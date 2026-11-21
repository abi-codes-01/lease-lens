export default function RiskSummary({ flags }) {
  const totalCount = flags.length;
  const highCount = flags.filter((flag) => flag.severity === 'high').length;

  let badgeText = 'Moderate review';
  let badgeStyle = 'bg-amber-50 text-amber-800 ring-1 ring-amber-200';
  let headline = `${totalCount} ${totalCount === 1 ? 'clause' : 'clauses'} worth checking`;

  if (totalCount === 0) {
    badgeText = 'No major flags';
    badgeStyle = 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
    headline = '0 risky clauses flagged';
  } else if (highCount > 0) {
    badgeText = 'High attention needed';
    badgeStyle = 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
  }

  return (
    <section
      aria-label="Risk summary"
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/90"
    >
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Risk summary</p>
        <p className="mt-0.5 text-lg font-bold text-slate-950">{headline}</p>
      </div>

      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
        {badgeText}
      </span>
    </section>
  );
}
