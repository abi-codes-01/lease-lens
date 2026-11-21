function formatRupees(amount) {
  if (amount === null || amount === undefined) {
    return 'Not found';
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDuration(value, singular, plural) {
  if (value === null || value === undefined) {
    return 'Not found';
  }
  return `${value} ${value === 1 ? singular : plural}`;
}

export default function KeyTerms({ keyTerms }) {
  const tiles = [
    { label: 'Monthly rent', value: formatRupees(keyTerms?.monthlyRent) },
    { label: 'Deposit', value: formatRupees(keyTerms?.deposit) },
    { label: 'Lock-in', value: formatDuration(keyTerms?.lockInMonths, 'month', 'months') },
    { label: 'Notice period', value: formatDuration(keyTerms?.noticeDays, 'day', 'days') },
  ];

  return (
    <section aria-label="Key terms" className="grid grid-cols-2 gap-3 sm:gap-4">
      {tiles.map((tile) => {
        const isMissing = tile.value === 'Not found';

        return (
          <div
            key={tile.label}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/90 sm:p-5"
          >
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              {tile.label}
            </p>
            <p
              className={`mt-1.5 break-words text-xl font-bold tracking-tight ${
                isMissing ? 'font-medium text-slate-400' : 'text-slate-950'
              }`}
            >
              {tile.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}
