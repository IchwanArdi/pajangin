import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { PageHelp } from './HelpTip';
import type { PageHelpKey } from '../../lib/dashboard-help';

/* Hallmark · app primitives · genre: modern-minimal · theme: Coral (design.md)
 * Shape lock: card 12px · button pill · input 10px. Colour only via tokens. */

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-(--radius-card) border border-rule bg-surface ${className}`}>{children}</section>;
}

export function CardHeader({
  title,
  description,
  action,
  className = '',
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 px-5 pt-5 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-2">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-paper-3 motion-reduce:animate-none ${className}`} />;
}

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:translate-y-px disabled:pointer-events-none disabled:opacity-50';

export const btn = {
  primary: `${base} h-9 bg-accent px-4 text-accent-ink hover:bg-[color-mix(in_oklch,var(--color-accent)_88%,black)]`,
  secondary: `${base} h-9 border border-rule bg-surface px-4 text-ink hover:bg-paper-2`,
  ghost: `${base} h-9 px-3 text-ink-2 hover:bg-paper-2 hover:text-ink`,
  danger: `${base} h-9 bg-negative px-4 text-accent-ink hover:opacity-90`,
  icon: `${base} h-9 w-9 text-ink-2 hover:bg-paper-2 hover:text-ink`,
  sm: 'h-8 px-3 text-[13px]',
};

export const field = {
  input:
    'h-10 w-full rounded-(--radius-input) border border-rule bg-surface px-3 text-sm text-ink placeholder:text-ink-2/60 transition-colors hover:border-paper-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
  textarea:
    'w-full rounded-(--radius-input) border border-rule bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-2/60 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
  label: 'mb-1.5 block text-sm font-medium text-ink',
  hint: 'mt-1.5 text-xs text-ink-2',
};

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: 'neutral' | 'positive' | 'warning' | 'negative' | 'accent';
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    neutral: 'bg-paper-2 text-ink-2',
    positive: 'bg-positive-soft text-positive',
    warning: 'bg-warning-soft text-warning',
    negative: 'bg-negative-soft text-negative',
    accent: 'bg-accent-soft text-accent',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function InfoNote({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'warning' | 'positive';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-paper-2 text-ink-2',
    warning: 'bg-warning-soft text-ink',
    positive: 'bg-positive-soft text-positive',
  };
  return (
    <div role="note" className={`flex items-start gap-2.5 rounded-(--radius-input) px-4 py-3 text-sm leading-relaxed ${tones[tone]} ${className}`}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  helpKey,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  helpKey?: PageHelpKey;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <h1 className="text-2xl font-semibold tracking-[-0.025em] text-ink">{title}</h1>
          {helpKey && <PageHelp helpKey={helpKey} />}
        </div>
        {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
