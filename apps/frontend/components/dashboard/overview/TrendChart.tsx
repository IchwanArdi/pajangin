'use client';

import { useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';
import type { TimeseriesPoint } from '../../../lib/api';
import { formatLongDate, formatNumber, formatShortDate } from '../../../lib/format';

/* Satu-satunya grafik di Ringkasan (pelajaran Plausible): tren adalah hal yang memang butuh bentuk.
 * Pengunjung = area netral, Kontak = garis coral (aksi utama). */

const SERIES = {
  visitors: { label: 'Pengunjung', color: 'var(--color-chart-visitors)' },
  contacts: { label: 'Kontak', color: 'var(--color-chart-contacts)' },
} as const;
type SeriesKey = keyof typeof SERIES;

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as TimeseriesPoint | undefined;
  if (!point) return null;
  return (
    <div className="min-w-[11rem] rounded-(--radius-input) border border-rule bg-surface px-3 py-2.5 shadow-pop">
      <p className="mb-1.5 text-xs font-medium capitalize text-ink-2">{formatLongDate(String(label))}</p>
      {(Object.keys(SERIES) as SeriesKey[]).map((k) => (
        <div key={k} className="flex items-center justify-between gap-4 text-sm">
          <span className="inline-flex items-center gap-2 text-ink-2">
            <span className="h-2 w-2 rounded-full" style={{ background: SERIES[k].color }} />
            {SERIES[k].label}
          </span>
          <span className="font-semibold tabular-nums text-ink">{formatNumber(point[k])}</span>
        </div>
      ))}
    </div>
  );
}

export function TrendChart({ points }: { points: TimeseriesPoint[] }) {
  const reduceMotion = useReducedMotion();
  const [hidden, setHidden] = useState<Record<SeriesKey, boolean>>({ visitors: false, contacts: false });
  const totals = {
    visitors: points.reduce((a, p) => a + p.visitors, 0),
    contacts: points.reduce((a, p) => a + p.contacts, 0),
  };
  const tickEvery = points.length > 31 ? 14 : points.length > 10 ? 6 : 1;

  return (
    <div>
      {/* legend = toggle (interaksi nyata, bukan hiasan) */}
      <div className="flex flex-wrap gap-2 px-5" role="group" aria-label="Tampilkan seri grafik">
        {(Object.keys(SERIES) as SeriesKey[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={!hidden[k]}
            onClick={() => setHidden((h) => ({ ...h, [k]: !h[k] }))}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
              hidden[k] ? 'border-rule text-ink-2/60' : 'border-rule bg-surface text-ink hover:bg-paper-2'
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: hidden[k] ? 'var(--color-paper-3)' : SERIES[k].color }} />
            {SERIES[k].label}
            <span className="tabular-nums text-ink-2">{formatNumber(totals[k])}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 h-64 w-full sm:h-72" role="img" aria-label={`Grafik ${points.length} hari: ${totals.visitors} pengunjung, ${totals.contacts} kontak`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 20, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="fill-visitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-visitors)" stopOpacity={0.14} />
                <stop offset="100%" stopColor="var(--color-chart-visitors)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fill-contacts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-contacts)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--color-chart-contacts)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-rule)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              interval={tickEvery - 1}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: 'var(--color-ink-2)', fontSize: 12 }}
            />
            <YAxis
              allowDecimals={false}
              width={44}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--color-ink-2)', fontSize: 12 }}
              tickFormatter={(v: number) => formatNumber(v)}
            />
            <Tooltip content={ChartTooltip} cursor={{ stroke: 'var(--color-ink-2)', strokeOpacity: 0.3, strokeDasharray: '3 3' }} />
            {!hidden.visitors && (
              <Area
                type="monotone"
                dataKey="visitors"
                stroke="var(--color-chart-visitors)"
                strokeWidth={1.75}
                fill="url(#fill-visitors)"
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={!reduceMotion}
                animationDuration={500}
              />
            )}
            {!hidden.contacts && (
              <Area
                type="monotone"
                dataKey="contacts"
                stroke="var(--color-chart-contacts)"
                strokeWidth={2.25}
                fill="url(#fill-contacts)"
                activeDot={{ r: 4.5, strokeWidth: 0 }}
                isAnimationActive={!reduceMotion}
                animationDuration={500}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
