import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

// Perubahan vs periode sebelumnya. unit "pt" = selisih poin persen (untuk rasio).
export function Delta({
  value,
  unit = '%',
  size = 'sm',
  periodLabel,
}: {
  value: number | null;
  unit?: '%' | 'pt';
  size?: 'sm' | 'md';
  periodLabel?: string;
}) {
  const text = size === 'md' ? 'text-sm' : 'text-xs';
  const icon = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  // periode sebelumnya kosong → tidak ada pembanding (jangan tampilkan +∞%)
  if (value === null) {
    return (
      <span className={`${text} text-ink-2`}>
        {size === 'md' ? 'Belum ada data periode sebelumnya' : 'Belum ada pembanding'}
      </span>
    );
  }

  const abs = Math.abs(value).toLocaleString('id-ID', { maximumFractionDigits: 1 });
  const suffix = unit === 'pt' ? ' poin' : '%';

  if (value === 0) {
    return (
      <span className={`inline-flex items-center gap-0.5 ${text} font-medium text-ink-2`}>
        <Minus className={icon} strokeWidth={2} /> Sama{periodLabel ? ` ${periodLabel}` : ''}
      </span>
    );
  }

  const up = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${text} font-medium tabular-nums ${up ? 'text-positive' : 'text-negative'}`}
      aria-label={`${up ? 'Naik' : 'Turun'} ${abs}${suffix}${periodLabel ? ` ${periodLabel}` : ''}`}
    >
      {up ? <ArrowUpRight className={icon} strokeWidth={2} /> : <ArrowDownRight className={icon} strokeWidth={2} />}
      {abs}
      {suffix}
      {periodLabel && <span className="ml-1 font-normal text-ink-2">{periodLabel}</span>}
    </span>
  );
}
