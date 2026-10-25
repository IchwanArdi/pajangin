import Link from 'next/link';
import { Star } from 'lucide-react';
import type { DashboardOverview } from '../../../lib/api';
import { formatNumber, formatPercent } from '../../../lib/format';
import { Badge } from '../ui';

/* Tabel gaya Stripe: angka rata kanan & tabular, status sebagai badge bermakna. */
export function ServiceRanking({ services }: { services: DashboardOverview['topServices'] }) {
  if (services.length === 0) {
    return (
      <div className="px-5 pb-5 text-sm text-ink-2">
        Belum ada layanan.{' '}
        <Link href="/dashboard/layanan" className="font-semibold text-accent hover:underline">
          Tambah layanan
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto pb-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-ink-2">
              <th scope="col" className="px-5 pb-2 font-medium">Layanan</th>
              <th scope="col" className="px-2 pb-2 text-right font-medium">Buka layanan</th>
              <th scope="col" className="px-5 pb-2 text-right font-medium sm:px-2">Klik WA</th>
              <th scope="col" className="hidden px-5 pb-2 text-right font-medium sm:table-cell">Rasio klik WA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule border-t border-rule">
            {services.slice(0, 6).map((s) => {
              const friction = s.views >= 10 && s.conversionRate < 3;
              return (
                <tr key={s.id} className="transition-colors hover:bg-paper-2/60">
                  <td className="max-w-0 px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      {s.isFeatured && <Star className="h-3.5 w-3.5 shrink-0 fill-accent text-accent" aria-label="Andalan" />}
                      <span className="truncate font-medium text-ink">{s.name}</span>
                      {friction && <Badge tone="warning" className="shrink-0">Klik rendah</Badge>}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-ink-2">{formatNumber(s.views)}</td>
                  <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-ink sm:px-2">{formatNumber(s.clicks)}</td>
                  <td className="hidden px-5 py-2.5 text-right tabular-nums text-ink-2 sm:table-cell">{s.views > 0 ? formatPercent(s.conversionRate) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="px-5 pb-4 text-xs leading-relaxed text-ink-2">
        Angka klik menghitung tombol yang ditekan, bukan chat yang benar-benar terkirim.
      </p>
    </>
  );
}
