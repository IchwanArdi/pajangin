import { ArrowRight, Check, X } from 'lucide-react';
import { PAIN_POINTS } from '../../lib/marketing-content';
import { Reveal } from '../../app/reveal';
import { Section, SectionHead } from './primitives';

export function ProblemSolution() {
  return (
    <Section id="masalah" bordered>
      <SectionHead
        eyebrow="Masalah yang sering terjadi"
        title="Halaman yang tidak diukur sulit diperbaiki."
        desc="Tiga hal yang paling sering membuat usaha lokal kehilangan calon pelanggan sebelum sempat dihubungi — dan bagaimana Pajangin menjawabnya."
      />

      <Reveal className="mt-12 grid gap-4 md:grid-cols-3">
        {PAIN_POINTS.map((p, i) => (
          <div key={p.problem} className="lift flex h-full flex-col rounded-3xl border border-rule bg-surface p-6">
            <span className="font-mono text-xs text-ink-3">0{i + 1}</span>

            <div className="mt-5 flex items-start gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-negative-soft text-negative">
                <X className="h-3 w-3" />
              </span>
              <div>
                <p className="text-[15px] font-semibold leading-snug text-ink">{p.problem}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{p.detail}</p>
              </div>
            </div>

            <div className="my-5 h-px w-full bg-rule" />

            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                <Check className="h-3 w-3" />
              </span>
              <div>
                <p className="flex items-center gap-1.5 text-[15px] font-semibold leading-snug text-ink">
                  {p.solution} <ArrowRight className="h-3.5 w-3.5 text-accent" />
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{p.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </Reveal>
    </Section>
  );
}
