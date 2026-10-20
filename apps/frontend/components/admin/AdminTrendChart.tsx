'use client';

import { useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';
import type { AdminSeriesPoint } from '../../lib/api';
import { formatLongDate, formatNumber, formatShortDate } from '../../lib/format';

const SERIES = {
  users: { label: 'Akun baru', color: 'var(--color-chart-visitors)' },
  businesses: { label: 'Bisnis baru', color: 'var(--color-chart-contacts)' },
} as const;

type SeriesKey = keyof typeof SERIES;

function ChartTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as AdminSeriesPoint | undefined;
  if (!point) return null;

  return (
    <div className="min-w-[11rem] rounded-(--radius-input) border border-rule bg-surface px-3 py-2.5 shadow-lg">
      <p className="text-xs font-medium text-ink-2">{formatLongDate(point.date)}</p>
      <div className="mt-2 space-y-1.5">
        {(Object.keys(SERIES) as SeriesKey[]).map((key) => (
          <div key={key} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SERIES[key].color }} />
              {SERIES[key].label}
            </span>
            <span className="font-semibold tabular-nums text-ink">{formatNumber(point[key])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminTrendChart({ points }: { points: AdminSeriesPoint[] }) {
  const reducedMotion = useReducedMotion();
  const [hidden, setHidden] = useState<SeriesKey | null>(null);

  const totals = points.reduce(
    (acc, point) => ({
      users: acc.users + point.users,
      businesses: acc.businesses + point.businesses,
    }),
    { users: 0, businesses: 0 },
  );

  const tickEvery = points.length > 31 ? 14 : points.length > 10 ? 6 : 1;

  return (
    <div className="px-3 pb-4 pt-4 sm:px-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(Object.keys(SERIES) as SeriesKey[]).map((key) => {
          const active = hidden !== key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              onClick={() => setHidden((current) => (current === key ? null : key))}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'border-rule bg-surface text-ink'
                  : 'border-transparent bg-paper-2 text-ink-2 opacity-60'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: active ? SERIES[key].color : 'var(--color-ink-3)' }}
              />
              {SERIES[key].label}
              <span className="tabular-nums text-ink-2">{formatNumber(totals[key])}</span>
            </button>
          );
        })}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
            <defs>
              {(Object.keys(SERIES) as SeriesKey[]).map((key) => (
                <linearGradient key={key} id={`admin-${key}-fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SERIES[key].color} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={SERIES[key].color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--color-grid)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              interval={tickEvery}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-ink-2)' }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-ink-2)' }}
              width={44}
            />
            <Tooltip content={ChartTooltip} cursor={{ stroke: 'var(--color-rule)' }} />
            {(Object.keys(SERIES) as SeriesKey[]).map((key) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                hide={hidden === key}
                stroke={SERIES[key].color}
                strokeWidth={2}
                fill={`url(#admin-${key}-fill)`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
                isAnimationActive={!reducedMotion}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
