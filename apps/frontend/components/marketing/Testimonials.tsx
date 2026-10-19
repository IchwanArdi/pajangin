import { Quote } from 'lucide-react';
import { Reveal } from '../../app/reveal';
import { PendingBadge, Section, SectionHead } from './primitives';

// Placeholder yang jelas ditandai — jangan mengarang testimoni.
const SLOTS = [
  { role: 'Pemilik bengkel', category: 'Otomotif' },
  { role: 'Pemilik kedai kopi', category: 'Kuliner' },
  { role: 'Pemilik klinik', category: 'Kesehatan' },
];

export function Testimonials() {
  return (
    <Section bordered tone="paper-2">
      <SectionHead
        eyebrow="Bukti sosial"
        title="Kata pengguna."
        desc="Slot ulasan pelanggan nyata. Isi hanya dengan testimoni asli beserta izin pemiliknya — bukan contoh karangan."
      />
      <Reveal className="mt-10 grid gap-4 md:grid-cols-3" stagger={0.08}>
        {SLOTS.map((s) => (
          <figure key={s.role} className="lift flex h-full flex-col rounded-2xl border border-dashed border-ink-3/40 bg-surface p-6">
            <Quote className="h-5 w-5 text-ink-3" />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink-3">
              “Ruang untuk testimoni pelanggan. Tambahkan setelah pelanggan memberi ulasan dan mengizinkan namanya dicantumkan.”
            </blockquote>
            <figcaption className="mt-5 flex items-center justify-between gap-3 border-t border-rule pt-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-2">{s.role}</p>
                <p className="truncate text-xs text-ink-3">{s.category}</p>
              </div>
              <PendingBadge label="menunggu testimoni" />
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </Section>
  );
}
