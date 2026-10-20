import type { ReactNode } from 'react';

/** Palet latar seksi halaman bisnis. `ink` & `accent` dipakai untuk blok karakter. */
export type SiteTone = 'plain' | 'soft' | 'ink' | 'accent';
export type SiteSpace = 'sm' | 'md' | 'lg';

const TONE_CLASS: Record<SiteTone, string> = {
  plain: 'bg-paper',
  soft: 'bg-paper-2',
  ink: 'bg-ink text-paper',
  accent: 'bg-accent text-accent-ink',
};

const SPACE_CLASS: Record<SiteSpace, string> = {
  sm: 'py-10 md:py-14',
  md: 'py-14 md:py-20',
  lg: 'py-16 md:py-28',
};

/** Seksi standar halaman bisnis: lebar konsisten + ritme vertikal.
 * Tanpa garis pemisah — seksi dibedakan oleh latar & jarak, bukan border. */
export function SiteSection({
  id,
  tone = 'plain',
  space = 'md',
  bleed = false,
  className = '',
  children,
}: {
  id?: string;
  tone?: SiteTone;
  space?: SiteSpace;
  bleed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={[TONE_CLASS[tone], SPACE_CLASS[space], id ? 'scroll-mt-20' : '', className].filter(Boolean).join(' ')}
    >
      {bleed ? children : <div className="mx-auto w-full max-w-6xl px-5">{children}</div>}
    </section>
  );
}

/** Judul + subjudul seksi dengan kicker bergaris aksen. */
export function SectionIntro({
  eyebrow,
  title,
  sub,
  align = 'left',
  dark = false,
  className = '',
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  align?: 'left' | 'center';
  dark?: boolean;
  className?: string;
}) {
  const centered = align === 'center';
  return (
    <div className={[centered ? 'text-center' : '', className].filter(Boolean).join(' ')}>
      {eyebrow ? (
        <p
          className={[
            'flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em]',
            dark ? 'text-paper/60' : 'text-ink-2',
            centered ? 'justify-center' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span aria-hidden className="h-px w-5 bg-accent" />
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={[
          'font-display mt-4 text-[1.65rem] font-semibold leading-[1.12] tracking-[-0.022em] [overflow-wrap:anywhere] md:text-[2.1rem]',
          dark ? 'text-paper' : 'text-ink',
        ].join(' ')}
      >
        {title}
      </h2>
      {sub ? (
        <p
          className={[
            'mt-3 max-w-2xl text-sm leading-relaxed md:text-[15px]',
            dark ? 'text-paper/70' : 'text-ink-2',
            centered ? 'mx-auto' : '',
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
