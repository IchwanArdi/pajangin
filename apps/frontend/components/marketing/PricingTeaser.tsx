import { ArrowRight, Check } from 'lucide-react';
import TrackedLink from '../analytics/TrackedLink';
import { PRICING_PLANS } from '../../lib/marketing-content';
import { Section, SectionHead } from './primitives';

export function PricingTeaser() {
  const plan = PRICING_PLANS[0];

  return (
    <Section id="harga">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <div>
          <SectionHead
            eyebrow="Harga"
            title="Gratis untuk usaha lokal. Tanpa langganan."
            desc="Semua fitur inti terbuka sekarang. Ada batas wajar untuk AI, galeri, dan notifikasi WhatsApp agar layanan tetap gratis untuk semua."
          />
          <TrackedLink
            href="/login"
            eventParams={{ location: 'pricing-teaser-top', label: 'Buat halaman gratis' }}
            className="press group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-paper transition hover:bg-ink-3"
          >
            Buat halaman gratis
            <ArrowRight className="arrow-nudge h-4 w-4 text-accent" />
          </TrackedLink>
        </div>

        <div className="rounded-[2rem] bg-accent-soft p-6 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-2">Paket {plan.name}</span>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-ink">Aktif sekarang</span>
          </div>

          <div className="mt-8 flex items-baseline gap-2">
            <span className="font-display text-[clamp(4rem,8vw,6.5rem)] font-semibold leading-none tracking-[-0.06em] text-ink">
              {plan.price}
            </span>
            <span className="text-sm text-ink-2">{plan.period}</span>
          </div>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink-2 sm:text-base">{plan.tagline}</p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <TrackedLink
            href="/login"
            eventParams={{ location: 'pricing-teaser-card', label: plan.cta }}
            className="press group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-paper transition hover:bg-ink-3"
          >
            {plan.cta}
            <ArrowRight className="arrow-nudge h-4 w-4 text-accent" />
          </TrackedLink>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            Tanpa kartu kredit · Tanpa biaya tersembunyi
          </p>
        </div>
      </div>
    </Section>
  );
}
