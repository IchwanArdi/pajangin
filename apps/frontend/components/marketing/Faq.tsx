import Link from 'next/link';
import { Plus } from 'lucide-react';
import { FAQS } from '../../lib/marketing-content';
import { Reveal } from '../../app/reveal';
import { Eyebrow, Section } from './primitives';

export function Faq() {
  return (
    <Section id="faq" bordered tone="paper-2">
      <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Eyebrow>Pertanyaan umum</Eyebrow>
          <h2 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.022em] text-ink [overflow-wrap:anywhere] sm:text-4xl">
            Hal yang biasanya ditanyakan.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
            Masih ragu? Buat halaman gratis, isi profil singkat, dan lihat halaman Anda terbit tanpa langganan.
          </p>
          <Link
            href="/register"
            className="press mt-6 inline-flex items-center justify-center whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:opacity-90"
          >
            Mulai sekarang
          </Link>
        </div>

        <Reveal className="divide-y divide-rule overflow-hidden rounded-2xl border border-rule bg-surface" stagger={0.04} y={10}>
          {FAQS.map((item) => (
            <details key={item.q} className="group px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[15px] font-medium text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <div className="acc-panel">
                <div>
                  <p className="pb-4 pr-8 text-sm leading-relaxed text-ink-2">{item.a}</p>
                </div>
              </div>
            </details>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
