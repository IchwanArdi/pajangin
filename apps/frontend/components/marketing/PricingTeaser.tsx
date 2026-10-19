import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { PRICING_PLANS } from '../../lib/marketing-content';
import { Reveal } from '../../app/reveal';
import { Section, SectionHead } from './primitives';

export function PricingTeaser() {
  return (
    <Section id="harga" bordered>
      <SectionHead
        eyebrow="Harga"
        title="Gratis untuk usaha lokal. Tanpa langganan."
        desc="Semua fitur inti terbuka sekarang. Ada batas wajar untuk AI, galeri, dan notifikasi WhatsApp agar layanan tetap gratis untuk semua."
      />

      <Reveal className="mx-auto mt-10 max-w-2xl" stagger={0.08}>
        {PRICING_PLANS.map((p) => (
          <div
            key={p.id}
            className={`lift flex h-full flex-col rounded-2xl border bg-surface p-6 ${
              p.featured ? 'border-accent ring-1 ring-accent/25' : 'border-rule'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-ink">{p.name}</h3>
            </div>

            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tracking-[-0.02em] text-ink">{p.price}</span>
              <span className="text-sm text-ink-2">{p.period}</span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{p.tagline}</p>

            <ul className="mt-5 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="press group mt-6 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-ink transition hover:opacity-90"
            >
              Buat halaman gratis
              <ArrowRight className="arrow-nudge h-4 w-4" />
            </Link>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
