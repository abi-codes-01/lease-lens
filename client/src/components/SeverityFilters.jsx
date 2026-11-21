const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

const ACTIVE_PILL_STYLES = {
  all: 'bg-slate-900 text-white ring-slate-900',
  high: 'bg-rose-600 text-white ring-rose-600',
  medium: 'bg-amber-500 text-white ring-amber-500',
  low: 'bg-sky-600 text-white ring-sky-600',
};

export default function SeverityFilters({ flags, selected, onSelect }) {
  const counts = {
    all: flags.length,
    high: flags.filter((flag) => flag.severity === 'high').length,
    medium: flags.filter((flag) => flag.severity === 'medium').length,
    low: flags.filter((flag) => flag.severity === 'low').length,
  };

  return (
    <div role="group" aria-label="Filter clauses by severity" className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((option) => {
        const isActive = selected === option.key;
        const count = counts[option.key];

        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(option.key)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 transition active:scale-[0.98] ${
              isActive
                ? ACTIVE_PILL_STYLES[option.key]
                : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{option.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
