import Link from 'next/link';
import type { ReactNode } from 'react';

// Kerangka halaman auth: wordmark + judul + kartu form + footer link
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center bg-paper px-4 py-12 text-ink sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <Link href="/" className="inline-block text-xl font-extrabold tracking-tight">
            Pajang<span className="text-accent">in</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm leading-relaxed text-ink-2">{subtitle}</p>}
        </div>

        <div className="space-y-5 rounded-3xl border border-rule bg-white p-6 sm:p-8">{children}</div>

        {footer && <div className="space-y-2 text-center text-sm text-ink-2">{footer}</div>}
      </div>
    </div>
  );
}

export function FormAlert({ tone = 'error', children }: { tone?: 'error' | 'success' | 'info'; children: ReactNode }) {
  const styles =
    tone === 'error'
      ? 'border-accent/40 text-ink'
      : 'border-rule text-ink';
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-2xl border bg-paper-2 p-3.5 text-sm leading-relaxed ${styles}`}>
      {children}
    </div>
  );
}

export const inputClass =
  'w-full rounded-xl border border-rule bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-ink-2/60 focus:outline-none focus:ring-2 focus:ring-focus';

export const labelClass = 'mb-1.5 block text-xs font-medium text-ink-2';

export const primaryButtonClass =
  'w-full rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-ink transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export const secondaryButtonClass =
  'w-full rounded-full border border-rule bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50';
