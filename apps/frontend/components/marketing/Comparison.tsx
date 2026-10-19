import { Check, X } from 'lucide-react';
import { COMPARISON_ROWS } from '../../lib/marketing-content';
import { Reveal } from '../../app/reveal';
import { Section, SectionHead } from './primitives';

export function Comparison() {
  return (
    <Section id="perbandingan" bordered>
      <SectionHead
        eyebrow="Perbandingan"
        title="Cara lama vs Pajangin."
        desc="Bukan tentang mengganti cara Anda berjualan, tetapi merapikan jalur dari orang yang menemukan usaha Anda sampai ia menghubungi."
      />

      <div className="mt-10 overflow-hidden rounded-2xl border border-rule bg-surface">
        <div className="hidden grid-cols-[1.15fr_1fr_1fr] gap-5 border-b border-rule bg-paper-2 px-5 py-3 sm:grid">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">Aspek</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">Tanpa Pajangin</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">Dengan Pajangin</span>
        </div>

        <Reveal stagger={0.05} y={12}>
          {COMPARISON_ROWS.map((r) => (
            <div
              key={r.aspect}
              className="grid gap-3 border-b border-rule px-5 py-4 transition-colors last:border-b-0 hover:bg-paper-2/60 sm:grid-cols-[1.15fr_1fr_1fr] sm:items-start sm:gap-5"
            >
              <span className="text-sm font-semibold text-ink">{r.aspect}</span>

              <span className="flex items-start gap-2 text-sm text-ink-2">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-negative" strokeWidth={2} />
                <span>
                  <span className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3 sm:hidden">Tanpa</span>
                  {r.old}
                </span>
              </span>

              <span className="flex items-start gap-2 text-sm text-ink">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
                <span>
                  <span className="mr-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-accent sm:hidden">Dengan</span>
                  {r.now}
                </span>
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
