'use client';

import type { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { PAGE_HELP, type PageHelpKey } from '../../lib/dashboard-help';
import { Popover } from './Popover';

/*
 * Bantuan kontekstual: satu ikon kecil, panel yang bisa diketuk (bukan hover-only),
 * dan tetap bisa ditutup dengan Escape. Dipakai hanya untuk istilah yang benar-benar
 * membingungkan, bukan di setiap kolom.
 */
export function HelpTip({
  label,
  title,
  children,
  align = 'start',
  className = '',
}: {
  label: string;
  title: string;
  children: ReactNode;
  align?: 'start' | 'end';
  className?: string;
}) {
  return (
    <Popover
      align={align}
      className={`w-[min(22rem,calc(100vw-2rem))] ${className}`}
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={toggle}
          aria-label={label}
          aria-expanded={open}
          aria-controls={id}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:h-9 sm:w-9"
        >
          <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
        </button>
      )}
    >
      {() => (
        <div role="note" className="p-2.5">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <div className="mt-2 text-sm leading-relaxed text-ink-2">{children}</div>
        </div>
      )}
    </Popover>
  );
}

// Panduan satu halaman: satu tombol di dekat judul, bukan ikon di setiap section.
export function PageHelp({ helpKey }: { helpKey: PageHelpKey }) {
  const help = PAGE_HELP[helpKey];

  return (
    <HelpTip label={`Buka ${help.title}`} title={help.title}>
      <p>{help.intro}</p>
      <dl className="mt-3 space-y-2.5">
        {help.items.map((item) => (
          <div key={item.label}>
            <dt className="font-medium text-ink">{item.label}</dt>
            <dd className="mt-0.5">{item.text}</dd>
          </div>
        ))}
      </dl>
    </HelpTip>
  );
}
