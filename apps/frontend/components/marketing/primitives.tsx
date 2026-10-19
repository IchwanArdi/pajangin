import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

/* Hallmark · component: marketing primitives · genre: modern-minimal · theme: Clean White
 * Semua warna via token; tanpa nilai mentah. Bentuk: kartu 12–16px, pil 999px, input 10px. */

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Section({
  id,
  children,
  className = '',
  bordered = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={`${id ? 'scroll-mt-24' : ''} ${bordered ? 'border-t border-rule' : ''} bg-surface py-16 sm:py-24 ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={`flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-2 ${className}`}
    >
      <span aria-hidden className="h-px w-5 bg-accent" />
      {children}
    </p>
  );
}

export function SectionHead({
  eyebrow,
  title,
  desc,
  align = 'left',
  className = '',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  desc?: ReactNode;
  align?: 'left' | 'center';
  className?: string;
}) {
  const centered = align === 'center';
  return (
    <div className={`${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'} ${className}`}>
      {eyebrow ? <Eyebrow className={centered ? 'justify-center' : ''}>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.022em] text-ink [overflow-wrap:anywhere] sm:text-4xl">
        {title}
      </h2>
      {desc ? <p className="mt-4 text-[15px] leading-relaxed text-ink-2">{desc}</p> : null}
    </div>
  );
}

export function Pill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-rule bg-surface px-3 py-1 text-xs font-medium text-ink-2 ${className}`}
    >
      {children}
    </span>
  );
}

/* Rangka pratinjau produk. Tanpa meniru chrome browser/ponsel — hanya bingkai tipis + caption. */
export function MockupFrame({
  label,
  meta,
  children,
  className = '',
  bodyClassName = '',
}: {
  label: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <figure className={`overflow-hidden rounded-2xl border border-rule bg-surface shadow-pop ${className}`}>
      <figcaption className="flex items-center justify-between gap-3 border-b border-rule bg-surface px-4 py-2.5">
        <span className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-3">{label}</span>
        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
          {meta ?? <Search className="h-3 w-3" />}
          pratinjau
        </span>
      </figcaption>
      <div className={bodyClassName}>{children}</div>
    </figure>
  );
}

