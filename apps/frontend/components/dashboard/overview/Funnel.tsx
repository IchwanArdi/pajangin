import { ChevronRight, TriangleAlert } from 'lucide-react';
import type { DashboardOverview } from '../../../lib/api';
import { formatNumber, formatPercent } from '../../../lib/format';

/* Funnel sengaja hanya 2 langkah: pengunjung → klik kontak.
 * service_view adalah klik kartu layanan (bukan impression), jadi tidak dipaksa
 * menjadi langkah antara yang selalu menurun. Angka klik layanan ditampilkan
 * sebagai konteks terpisah agar tidak menyesatkan. */
export function Funnel({ funnel }: { funnel: DashboardOverview['funnel'] }) {
  const steps = [
    { label: 'Membuka halaman', value: funnel.visitors },
    { label: 'Klik WhatsApp / telepon', value: funnel.contacted },
  ];
  const max = Math.max(funnel.visitors, 1);
  const rate = funnel.visitors > 0 ? (funnel.contacted / funnel.visitors) * 100 : 0;
  const showHint = funnel.visitors >= 10 && rate < 10;

  return (
    <div className="px-5 pb-5">
      <ol className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
        {steps.map((step, i) => (
          <li key={step.label} className="contents">
            <div className="min-w-0 rounded-(--radius-input) bg-paper-2 p-3.5">
              <p className="truncate text-sm text-ink-2">{step.label}</p>
              <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-ink">{formatNumber(step.value)}</p>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-paper-3" aria-hidden="true">
                <div
                  className={`h-full w-full origin-left rounded-full transition-transform duration-500 ${i === 1 ? 'bg-accent' : 'bg-ink-2'}`}
                  style={{ transform: `scaleX(${Math.max(step.value / max, step.value > 0 ? 0.03 : 0)})`, transitionTimingFunction: 'var(--ease-out)' }}
                />
              </div>
            </div>
            {i === 0 && (
              <div className="flex items-center justify-center gap-1 text-xs font-semibold tabular-nums text-ink-2 sm:flex-col">
                <ChevronRight className="h-4 w-4 rotate-90 sm:rotate-0" strokeWidth={2} />
                {formatPercent(rate, 0)}
              </div>
            )}
          </li>
        ))}
      </ol>

      <p className="mt-3 text-xs leading-relaxed text-ink-2">
        {formatNumber(funnel.viewedService)} pengunjung mengklik kartu layanan. Klik kontak bisa terjadi langsung dari tombol utama, jadi
        angka ini tidak selalu menjadi langkah antara.
      </p>

      {showHint && (
        <p className="mt-3 flex items-start gap-2 rounded-(--radius-input) bg-warning-soft px-3.5 py-2.5 text-sm text-ink">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" strokeWidth={1.75} />
          <span>Banyak yang membuka halaman tapi belum menghubungi. Pastikan tombol WhatsApp terlihat tanpa perlu scroll dan harga layanan jelas.</span>
        </p>
      )}
    </div>
  );
}
