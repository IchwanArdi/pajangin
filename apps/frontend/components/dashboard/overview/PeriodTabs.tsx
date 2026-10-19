'use client';

export const PERIODS = [
  { days: 7, label: '7 hari', short: '7H' },
  { days: 30, label: '30 hari', short: '30H' },
  { days: 90, label: '90 hari', short: '90H' },
] as const;

export type PeriodDays = (typeof PERIODS)[number]['days'];

// Segmented control pilihan periode (radiogroup, navigasi panah kiri/kanan)
export function PeriodTabs({ value, onChange }: { value: PeriodDays; onChange: (v: PeriodDays) => void }) {
  const idx = PERIODS.findIndex((p) => p.days === value);

  return (
    <div
      role="radiogroup"
      aria-label="Periode data"
      className="inline-flex rounded-full border border-rule bg-surface p-0.5"
      onKeyDown={(e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const next = (idx + (e.key === 'ArrowRight' ? 1 : PERIODS.length - 1)) % PERIODS.length;
        onChange(PERIODS[next].days);
        (e.currentTarget.children[next] as HTMLElement | undefined)?.focus();
      }}
    >
      {PERIODS.map((p) => {
        const active = p.days === value;
        return (
          <button
            key={p.days}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(p.days)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
              active ? 'bg-ink text-paper' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
