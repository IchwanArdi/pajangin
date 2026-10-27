import { Check, X } from 'lucide-react';
import { COMPARISON_ROWS } from '../../lib/marketing-content';
import { Section, SectionHead } from './primitives';

export function Comparison() {
  return (
    <Section id="perbandingan" tone="warm">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead
            eyebrow="Perbandingan"
            title="Cara lama vs Pajangin."
            desc="Bukan tentang mengganti cara Anda berjualan, tetapi merapikan jalur dari orang yang menemukan usaha Anda sampai ia menghubungi."
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-rule bg-surface shadow-window">
          <div className="hidden grid-cols-[1.15fr_1fr_1fr] gap-5 border-b border-rule bg-paper-2 px-5 py-4 sm:grid">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">Aspek</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">Tanpa Pajangin</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Dengan Pajangin</span>
          </div>

          {COMPARISON_ROWS.map((r) => (
            <div
              key={r.aspect}
              className="grid gap-3 border-b border-rule px-5 py-5 transition-colors last:border-b-0 hover:bg-paper-2 sm:grid-cols-[1.15fr_1fr_1fr] sm:items-start sm:gap-5"
            >
              <span className="font-display text-base font-semibold leading-snug tracking-[-0.015em] text-ink">{r.aspect}</span>

              <span className="flex items-start gap-2 text-sm leading-relaxed text-ink-2">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-negative" strokeWidth={2} />
                <span>
                  <span className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 sm:hidden">Tanpa</span>
                  {r.old}
                </span>
              </span>

              <span className="flex items-start gap-2 text-sm leading-relaxed text-ink">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                <span>
                  <span className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-accent sm:hidden">Dengan</span>
                  {r.now}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
