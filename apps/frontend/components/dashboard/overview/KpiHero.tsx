import { MessageCircle, Phone } from 'lucide-react';
import type { DashboardOverview } from '../../../lib/api';
import { formatNumber, formatPercent } from '../../../lib/format';
import { HelpTip } from '../HelpTip';
import { Delta } from './Delta';

/* KPI hierarchy (Stripe/Mercury): SATU angka utama — "Klik kontak" — karena itu sinyal
 * intent terkuat yang bisa diukur tanpa integrasi WhatsApp. Pesan form ditampilkan terpisah
 * supaya tidak tercampur dengan klik chat. */
export function KpiHero({ data, periodLabel }: { data: DashboardOverview; periodLabel: string }) {
  const { overview: o, deltas: d } = data;

  const secondary = [
    { label: 'Pengunjung', value: formatNumber(o.visitors), delta: d.visitors, unit: '%' as const },
    { label: 'Pesan form', value: formatNumber(o.leads), delta: d.leads, unit: '%' as const },
    { label: 'Rasio klik kontak', value: formatPercent(o.conversionRate), delta: d.conversionRate, unit: 'pt' as const },
    { label: 'Halaman dilihat', value: formatNumber(o.pageViews), delta: d.pageViews, unit: '%' as const },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-end">
      <div>
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium text-ink-2">Klik kontak</p>
          <HelpTip
            label="Apa arti angka di Ringkasan?"
            title="Arti angka di Ringkasan"
            align="start"
          >
            <dl className="space-y-2.5">
              <div>
                <dt className="font-medium text-ink">Klik kontak</dt>
                <dd className="mt-0.5">Klik tombol WhatsApp atau telepon. Bukan jumlah chat atau panggilan yang terkirim.</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Pesan form</dt>
                <dd className="mt-0.5">Jumlah orang yang mengisi form kontak di halaman publik.</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Rasio klik kontak</dt>
                <dd className="mt-0.5">Dari 100 pengunjung, berapa yang menekan tombol kontak.</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Halaman dilihat</dt>
                <dd className="mt-0.5">Total halaman yang dibuka. Satu pengunjung bisa membuka lebih dari sekali.</dd>
              </div>
            </dl>
          </HelpTip>
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-5xl font-semibold tabular-nums tracking-[-0.035em] text-ink sm:text-6xl">
            {formatNumber(o.contacts)}
          </span>
          <Delta value={d.contacts} size="md" periodLabel={`vs ${periodLabel} sebelumnya`} />
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} /> {formatNumber(o.whatsappClicks)} klik WhatsApp
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" strokeWidth={1.75} /> {formatNumber(o.phoneClicks)} klik telepon
          </span>
        </p>
      </div>

      <dl className="grid grid-cols-2 divide-x divide-y divide-rule rounded-(--radius-card) border border-rule bg-surface sm:grid-cols-4 sm:divide-y-0">
        {secondary.map((s) => (
          <div key={s.label} className="min-w-0 px-3 py-3.5 sm:px-5">
            <dt className="truncate text-xs font-medium text-ink-2 sm:text-sm">{s.label}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums tracking-[-0.02em] text-ink sm:text-2xl">{s.value}</dd>
            <dd className="mt-0.5">
              <Delta value={s.delta} unit={s.unit} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
