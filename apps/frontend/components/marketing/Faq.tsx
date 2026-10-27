import Link from 'next/link';
import { Plus } from 'lucide-react';
import { FAQS } from '../../lib/marketing-content';
import { Reveal } from '../../app/reveal';
import { Section, SectionHead } from './primitives';

export function Faq() {
  return (
    <Section id="faq" tone="warm">
      <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead
            eyebrow="Pertanyaan umum"
            title="Hal yang biasanya ditanyakan."
            desc="Masih ragu? Buat halaman gratis, isi profil singkat, dan lihat halaman Anda terbit tanpa langganan."
          />
          <Link
            href="/login"
            className="press mt-8 inline-flex items-center justify-center whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-ink-3"
          >
            Mulai sekarang
          </Link>
        </div>

        <Reveal className="divide-y divide-rule overflow-hidden rounded-3xl border border-rule bg-surface shadow-window" stagger={0.04} y={10}>
          {FAQS.map((item) => (
            <details key={item.q} className="group px-5 sm:px-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <div className="acc-panel">
                <div>
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-ink-2 sm:text-[15px]">{item.a}</p>
                </div>
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
