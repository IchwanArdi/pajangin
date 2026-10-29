import { ArrowRight } from 'lucide-react';
import TrackedLink from '../analytics/TrackedLink';
import { BUSINESS_TEMPLATES, type BusinessTemplate } from '../../lib/templates';
import { Section, SectionHead } from './primitives';

/** Bar mini: logo, nav, dan CTA — konteks yang sama di semua wireframe. */
function WireHeader({ accent }: { accent: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: accent }} />
      <span className="h-1.5 w-7 rounded-full bg-rule" />
      <span className="ml-auto h-1.5 w-4 rounded-full bg-rule" />
      <span className="h-1.5 w-4 rounded-full bg-rule" />
      <span className="h-3.5 w-8 rounded-full" style={{ background: accent }} />
    </div>
  );
}

function WireHero({ t }: { t: BusinessTemplate }) {
  const accent = t.accentToken;

  if (t.id === 'restaurant') {
    return (
      <div className="relative mt-2.5 h-[74px] overflow-hidden rounded-lg bg-ink">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: `radial-gradient(120% 120% at 15% 0%, color-mix(in oklab, ${accent} 68%, var(--color-ink)), transparent 58%)` }}
        />
        <span className="absolute right-2 top-2 h-4 w-10 rounded-full border border-ink-3 bg-ink-3" />
        <div className="absolute inset-x-2.5 bottom-2 space-y-1">
          <span className="block h-1.5 w-8 rounded-full bg-paper-4" />
          <span className="block h-2.5 w-3/5 rounded-full bg-paper-2" />
          <span className="block h-1.5 w-2/5 rounded-full bg-paper-5" />
        </div>
      </div>
    );
  }

  if (t.id === 'workshop') {
    return (
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <span className="inline-block h-3 w-12 rounded-sm border border-ink-3" />
          <span className="block h-2.5 w-full rounded-sm bg-ink-2" />
          <span className="block h-2.5 w-4/5 rounded-sm bg-ink-2" />
          <span className="block h-1.5 w-3/5 rounded-full bg-rule" />
          <div className="flex gap-1 pt-0.5">
            <span className="h-3.5 w-12 rounded-sm" style={{ background: accent }} />
            <span className="h-3.5 w-9 rounded-sm border border-rule" />
          </div>
        </div>
        <span
          className="rounded-md border-2 border-ink"
          style={{ background: `color-mix(in oklab, ${accent} 20%, white)`, boxShadow: '3px 3px 0 var(--color-ink)' }}
        />
      </div>
    );
  }

  if (t.id === 'salon') {
    return (
      <div className="mt-2.5">
        <div className="flex flex-col items-center space-y-1.5">
          <span className="h-px w-8" style={{ background: accent }} />
          <span className="h-2.5 w-3/5 rounded-full bg-rule" />
          <span className="h-1.5 w-2/5 rounded-full bg-rule" />
          <span className="mt-1 h-3.5 w-14 rounded-full" style={{ background: accent }} />
        </div>
        <div className="relative mt-2 h-14 overflow-hidden rounded-xl border border-rule">
          <div className="h-full w-full" style={{ background: `color-mix(in oklab, ${accent} 16%, white)` }} />
          <span className="absolute bottom-1.5 left-2 h-3 w-16 rounded border border-rule bg-surface" />
        </div>
      </div>
    );
  }

  if (t.id === 'clinic') {
    return (
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <span className="block h-1.5 w-10 rounded-full" style={{ background: accent }} />
          <span className="block h-2.5 w-full rounded-full bg-rule" />
          <span className="block h-1.5 w-4/5 rounded-full bg-rule" />
          <div className="flex gap-1 pt-1">
            <span className="h-3.5 w-11 rounded" style={{ background: accent }} />
            <span className="h-3.5 w-6 rounded border border-rule" />
          </div>
        </div>
        <div className="relative">
          <span className="block h-[56px] rounded-lg border border-rule" style={{ background: `color-mix(in oklab, ${accent} 15%, white)` }} />
          <span className="absolute -bottom-1 left-1 h-6 w-20 rounded border border-rule bg-surface p-1.5">
            <span className="block h-1 w-12 rounded-full bg-rule" />
            <span className="mt-1 block h-1 w-8 rounded-full bg-rule" />
          </span>
        </div>
      </div>
    );
  }

  if (t.id === 'retail') {
    return (
      <div className="mt-2.5 grid h-[66px] grid-cols-3 grid-rows-2 gap-1.5">
        <span
          className="col-span-2 row-span-2 rounded-lg border border-rule"
          style={{ background: `color-mix(in oklab, ${accent} 18%, white)` }}
        />
        <span className="rounded-md border border-rule bg-paper-2" />
        <span className="rounded-md border border-rule" style={{ background: `color-mix(in oklab, ${accent} 10%, white)` }} />
      </div>
    );
  }

  if (t.id === 'education') {
    return (
      <div className="mt-2.5 grid grid-cols-[1fr_0.9fr] items-center gap-2">
        <div className="space-y-1.5">
          <span className="block h-1.5 w-12 rounded-full" style={{ background: accent }} />
          <span className="block h-2.5 w-full rounded-full bg-rule" />
          <span className="block h-1.5 w-3/4 rounded-full bg-rule" />
          <span className="mt-0.5 block h-3.5 w-12 rounded-full" style={{ background: accent }} />
        </div>
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="rounded-md border border-rule bg-paper-2 p-1.5">
              <span className="block h-1 w-4 rounded-full" style={{ background: accent }} />
              <span className="mt-1 block h-1.5 w-8 rounded-full bg-paper-3" />
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2.5 grid grid-cols-2 gap-2">
      <div className="space-y-1.5">
        <span className="block h-2 w-5/6 rounded-full bg-rule" />
        <span className="block h-2 w-3/5 rounded-full bg-rule" />
        <span className="block h-1.5 w-2/3 rounded-full bg-rule" />
        <span className="mt-1 block h-3.5 w-14 rounded-full" style={{ background: accent }} />
      </div>
      <span className="rounded-lg border border-rule" style={{ background: `color-mix(in oklab, ${accent} 16%, white)` }} />
    </div>
  );
}

function WireSections({ t }: { t: BusinessTemplate }) {
  const accent = t.accentToken;

  return (
    <div className="flex flex-1 flex-col">
      {t.id === 'retail' ? (
        <div className="mt-2 grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="h-6 rounded-md border border-rule bg-paper-2" />
          ))}
        </div>
      ) : t.id === 'restaurant' ? (
        <div className="mt-2 space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="h-1 w-10 rounded-full bg-rule" />
              <span className="flex-1 border-b border-dotted border-rule" />
              <span className="h-1 w-4 rounded-full" style={{ background: accent }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-5 rounded-md border border-rule bg-paper-2" />
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-1.5 rounded-md bg-ink px-2 py-1.5">
        <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
        <span className="h-1 w-12 rounded-full bg-paper-5" />
        <span className="ml-auto h-1 w-6 rounded-full bg-ink-3" />
      </div>
    </div>
  );
}

export function TemplateWire({ t }: { t: BusinessTemplate }) {
  return (
    <div className="relative flex aspect-[4/3] flex-col overflow-hidden rounded-xl border border-rule bg-surface p-3">
      <WireHeader accent={t.accentToken} />
      <WireHero t={t} />
      <WireSections t={t} />
    </div>
  );
}

export function Templates() {
  const templates = Object.values(BUSINESS_TEMPLATES);

  return (
    <Section id="template">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHead
          eyebrow="Template kategori"
          title="Tampilan yang menyesuaikan jenis usaha."
          desc="Bengkel tidak harus terlihat seperti restoran. Pilih template yang paling dekat dengan bisnis Anda, lalu sesuaikan warna aksennya."
        />
        <TrackedLink
          href="/contoh"
          eventParams={{ location: 'templates-section', label: 'Lihat galeri template' }}
          className="press group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-rule bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:bg-paper-2"
        >
          Lihat galeri template <ArrowRight className="arrow-nudge h-4 w-4 text-accent" />
        </TrackedLink>
      </div>

      <div className="no-scrollbar -mx-5 mt-12 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8">
        <div className="flex w-max snap-x snap-mandatory gap-5">
          {templates.map((t) => (
            <TrackedLink
              key={t.id}
              href="/contoh"
              event="template_card_clicked"
              eventParams={{ template: t.name, category: t.badge }}
              aria-label={`Lihat contoh template ${t.name}`}
              className="group flex w-[min(82vw,360px)] shrink-0 snap-start flex-col rounded-3xl border border-rule bg-surface p-4 transition duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-window"
            >
              <TemplateWire t={t} />
              <div className="mt-5 flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{t.badge}</span>
                  <span className="flex gap-1" aria-hidden>
                    {t.colorOptions.slice(0, 4).map((c) => (
                      <span key={c} className="h-3 w-3 rounded-full border border-rule" style={{ background: c }} />
                    ))}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold tracking-[-0.02em] text-ink">{t.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{t.tagline}</p>
                <ul className="mt-4 space-y-1.5">
                  {t.features.slice(0, 2).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-ink-3">
                      <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink transition group-hover:text-accent">
                  Lihat contoh
                  <ArrowRight className="arrow-nudge h-4 w-4 text-accent" />
                </span>
              </div>
            </TrackedLink>
          ))}
        </div>
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Geser untuk melihat semua template</p>
    </Section>
  );
}
