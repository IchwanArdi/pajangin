import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BUSINESS_TEMPLATES, type BusinessTemplate } from '../../lib/templates';
import { Reveal } from '../../app/reveal';
import { Section, SectionHead } from './primitives';

export function TemplateWire({ t }: { t: BusinessTemplate }) {
  const accent = t.accentToken;
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-rule bg-paper p-3">
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-8 rounded-full" style={{ background: accent }} />
        <span className="ml-auto h-1.5 w-5 rounded-full bg-rule" />
        <span className="h-1.5 w-5 rounded-full bg-rule" />
        <span className="h-4 w-9 rounded-full" style={{ background: accent }} />
      </div>

      {t.heroStyle === 'split' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <span className="block h-2 w-4/5 rounded-full bg-ink/15" />
            <span className="block h-2 w-3/5 rounded-full bg-rule" />
            <span className="mt-1.5 block h-4 w-16 rounded-full" style={{ background: accent }} />
          </div>
          <span className="rounded-lg" style={{ background: accent, opacity: 0.14 }} />
        </div>
      ) : t.heroStyle === 'banner' ? (
        <div className="mt-3 space-y-1.5">
          <span className="block h-10 rounded-lg" style={{ background: accent, opacity: 0.16 }} />
          <span className="block h-2 w-2/5 rounded-full bg-ink/15" />
        </div>
      ) : t.heroStyle === 'centered' ? (
        <div className="mt-3 flex flex-col items-center space-y-1.5">
          <span className="block h-2 w-2/3 rounded-full bg-ink/15" />
          <span className="block h-2 w-2/5 rounded-full bg-rule" />
          <span className="mt-1 block h-4 w-16 rounded-full" style={{ background: accent }} />
        </div>
      ) : (
        <div className="mt-3 space-y-1.5">
          <span className="block h-2 w-1/2 rounded-full bg-ink/15" />
          <span className="block h-2 w-1/3 rounded-full bg-rule" />
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-7 rounded-md border border-rule bg-paper-2" />
        ))}
      </div>
    </div>
  );
}

export function Templates() {
  const templates = Object.values(BUSINESS_TEMPLATES);

  return (
    <Section id="template" bordered tone="paper-2">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHead
          eyebrow="Template kategori"
          title="Tampilan yang menyesuaikan jenis usaha."
          desc="Bengkel tidak harus terlihat seperti restoran. Pilih template yang paling dekat dengan bisnis Anda, lalu sesuaikan warna aksennya."
        />
        <Link
          href="/contoh"
          className="press group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-rule bg-surface px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper"
        >
          Lihat galeri template <ArrowRight className="arrow-nudge h-4 w-4 text-accent" />
        </Link>
      </div>

      <Reveal className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <figure key={t.id} className="lift flex h-full flex-col rounded-2xl border border-rule bg-surface p-4 hover:border-accent/40">
            <TemplateWire t={t} />
            <figcaption className="mt-4 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{t.badge}</span>
                <span className="flex gap-1" aria-hidden>
                  {t.colorOptions.slice(0, 4).map((c) => (
                    <span key={c} className="h-3 w-3 rounded-full border border-rule" style={{ background: c }} />
                  ))}
                </span>
              </div>
              <h3 className="mt-2 text-[15px] font-semibold text-ink">{t.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">{t.tagline}</p>
              <ul className="mt-3 space-y-1">
                {t.features.slice(0, 2).map((f) => (
                  <li key={f} className="text-xs text-ink-3">
                    · {f}
                  </li>
                ))}
              </ul>
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </Section>
  );
}
