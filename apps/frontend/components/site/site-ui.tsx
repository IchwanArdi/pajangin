import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Seksi standar halaman bisnis: lebar konsisten, hairline atas, ritme vertikal. */
export function SiteSection({
  id,
  tone = 'paper',
  className = '',
  children,
}: {
  id?: string;
  tone?: 'paper' | 'alt';
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={[
        'border-t border-rule py-14 md:py-20',
        tone === 'alt' ? 'bg-paper-2' : 'bg-paper',
        id ? 'scroll-mt-20' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mx-auto w-full max-w-6xl px-5">{children}</div>
    </section>
  );
}

/** Judul + subjudul seksi dengan label kecil di atasnya. */
export function SectionIntro({
  icon: Icon,
  eyebrow,
  title,
  sub,
  align = 'left',
  className = '',
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={[align === 'center' ? 'text-center' : '', className].filter(Boolean).join(' ')}>
      {eyebrow ? (
        <p
          className={[
            'inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-accent',
            align === 'center' ? 'justify-center' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">{title}</h2>
      {sub ? (
        <p
          className={[
            'mt-2 max-w-2xl text-sm leading-relaxed text-ink-2 md:text-base',
            align === 'center' ? 'mx-auto' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}
