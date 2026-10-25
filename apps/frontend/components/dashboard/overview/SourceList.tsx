import type { DashboardOverview } from '../../../lib/api';
import { formatNumber, sourceMeta } from '../../../lib/format';

/* Daftar berperingkat gaya Plausible: bar tipis di balik baris, angka rata kanan (tabular). */
export function SourceList({ sources }: { sources: DashboardOverview['trafficSources'] }) {
  if (sources.length === 0) {
    return <p className="px-5 pb-5 text-sm text-ink-2">Belum ada kunjungan di periode ini.</p>;
  }
  const max = Math.max(...sources.map((s) => s.count), 1);

  return (
    <>
      <ul className="space-y-1 px-3 pb-3">
        {sources.slice(0, 6).map((s) => {
          const meta = sourceMeta(s.key);
          const Icon = meta.icon;
          return (
            <li key={s.key} className="relative flex items-center gap-3 overflow-hidden rounded-lg px-2.5 py-2">
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-full origin-left rounded-lg bg-paper-2 transition-transform duration-500"
                style={{ transform: `scaleX(${s.count / max})`, transitionTimingFunction: 'var(--ease-out)' }}
              />
              <Icon className="relative h-4 w-4 shrink-0 text-ink-2" strokeWidth={1.75} />
              <span className="relative min-w-0 flex-1 truncate text-sm font-medium text-ink">{meta.label}</span>
              <span className="relative text-sm font-semibold tabular-nums text-ink">{formatNumber(s.count)}</span>
              <span className="relative w-10 text-right text-xs tabular-nums text-ink-2">{s.percentage}%</span>
            </li>
          );
        })}
      </ul>
      <p className="px-5 pb-4 text-xs leading-relaxed text-ink-2">
        “Langsung / link” berarti pengunjung datang dari link yang dibagikan atau mengetik alamat, tanpa sumber yang terdeteksi.
      </p>
    </>
  );
}
