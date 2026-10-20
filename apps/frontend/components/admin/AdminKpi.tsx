import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '../dashboard/ui';
import { Delta } from '../dashboard/overview/Delta';
import { formatNumber } from '../../lib/format';

const TONES = {
  accent: 'bg-accent-soft text-accent',
  positive: 'bg-positive-soft text-positive',
  warning: 'bg-warning-soft text-warning',
  neutral: 'bg-paper-2 text-ink-2',
} as const;

export function AdminKpi({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  delta?: number | null;
  hint?: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-ink-2">{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONES[tone]}`}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink tabular-nums">
        {formatNumber(value)}
      </p>
      <div className="mt-1.5 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {delta !== undefined && delta !== null && <Delta value={delta} />}
        {hint && <span className="text-ink-2">{hint}</span>}
      </div>
    </Card>
  );
}
