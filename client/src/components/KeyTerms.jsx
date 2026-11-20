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
    <section aria-label="Key terms" className="grid grid-cols-2 gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
        >
          <p className="text-sm text-slate-500">{tile.label}</p>
          <p
            className={`mt-1 break-words text-lg font-semibold ${
              tile.value === 'Not found' ? 'text-slate-400' : 'text-slate-900'
            }`}
          >
            {tile.value}
          </p>
        </div>
      ))}
    </section>
  );
}
