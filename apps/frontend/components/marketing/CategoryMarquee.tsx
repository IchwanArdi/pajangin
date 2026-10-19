import { CATEGORY_MARQUEE } from '../../lib/marketing-content';

export function CategoryMarquee() {
  const items = [...CATEGORY_MARQUEE, ...CATEGORY_MARQUEE];
  return (
    <section className="border-b border-rule bg-surface" aria-label="Kategori usaha yang didukung">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:gap-8 sm:px-8">
        <p className="shrink-0 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3">
          Cocok untuk
        </p>
        <div className="marquee min-w-0 flex-1 overflow-hidden">
          <div className="marquee__track gap-2.5">
            {items.map((c, i) => (
              <span
                key={`${c}-${i}`}
                aria-hidden={i >= CATEGORY_MARQUEE.length}
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-rule bg-surface px-4 py-1.5 text-sm text-ink-2"
              >
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
