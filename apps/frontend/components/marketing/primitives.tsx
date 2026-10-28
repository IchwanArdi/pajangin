import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

/* Hallmark · component: marketing primitives · genre: modern-minimal · theme: Clean White
 * Semua warna via token; tanpa nilai mentah. Bentuk: kartu 16–24px, pil 999px, input 10px. */

export type SectionTone = 'surface' | 'warm' | 'ink';

const sectionToneClass: Record<SectionTone, string> = {
  surface: 'bg-surface text-ink',
  warm: 'bg-paper-2 text-ink',
  ink: 'bg-ink text-paper',
};

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function Section({
  id,
  children,
  className = '',
  bordered = false,
  tone = 'surface',
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  bordered?: boolean;
  tone?: SectionTone;
}) {
  const borderClass = bordered
    ? tone === 'ink'
      ? 'border-t border-ink-3'
      : 'border-t border-rule'
    : '';

  return (
    <section
      id={id}
      className={`${id ? 'scroll-mt-24' : ''} ${borderClass} ${sectionToneClass[tone]} py-20 sm:py-28 ${className}`}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({
  children,
  className = '',
  tone = 'default',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'default' | 'inverse';
}) {
  return (
    <p
      className={`flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] ${
        tone === 'inverse' ? 'text-paper-4' : 'text-ink-3'
      } ${className}`}
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
  tone = 'surface',
  className = '',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  desc?: ReactNode;
  align?: 'left' | 'center';
  tone?: SectionTone;
  className?: string;
}) {
  const centered = align === 'center';
  const inverted = tone === 'ink';

  return (
    <div className={`${centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} ${className}`}>
      {eyebrow ? (
        <Eyebrow tone={inverted ? 'inverse' : 'default'} className={centered ? 'justify-center' : ''}>
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2
        className={`mt-5 font-display text-[clamp(2rem,3.8vw,3.4rem)] font-semibold leading-[1.03] tracking-[-0.035em] [text-wrap:balance] [overflow-wrap:anywhere] ${
          inverted ? 'text-paper' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      {desc ? (
        <p
          className={`mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${
            inverted ? 'text-paper-4' : 'text-ink-2'
          }`}
        >
          {desc}
        </p>
      ) : null}
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
    <figure className={`min-w-0 overflow-hidden rounded-3xl border border-rule bg-surface shadow-window ${className}`}>
      <figcaption className="flex items-center justify-between gap-3 border-b border-rule bg-paper-2 px-4 py-3 sm:px-5">
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
