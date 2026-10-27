import Link from 'next/link';
import { ArrowRight, Check, X } from 'lucide-react';
import { PAIN_POINTS } from '../../lib/marketing-content';
import { Reveal } from '../../app/reveal';
import { Section, SectionHead } from './primitives';

export function ProblemSolution() {
  return (
    <Section id="masalah">
      <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead
            eyebrow="Masalah yang sering terjadi"
            title="Halaman yang tidak diukur sulit diperbaiki."
            desc="Tiga hal yang paling sering membuat usaha lokal kehilangan calon pelanggan sebelum sempat dihubungi — dan bagaimana Pajangin menjawabnya."
          />
          <Link
            href="#cara-kerja"
            className="press group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink transition hover:text-accent"
          >
            Lihat cara kerjanya
            <ArrowRight className="arrow-nudge h-4 w-4 text-accent" />
          </Link>
        </div>

        <Reveal className="border-t border-rule" stagger={0.08}>
          {PAIN_POINTS.map((p, i) => (
            <article key={p.problem} className="grid gap-5 border-b border-rule py-8 sm:grid-cols-[auto_1fr] sm:gap-7 sm:py-10">
              <span className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-paper-4 sm:text-5xl">
                0{i + 1}
              </span>

              <div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-negative-soft text-negative">
                    <X className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold leading-snug tracking-[-0.02em] text-ink sm:text-2xl">
                      {p.problem}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2 sm:text-base">{p.detail}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-paper-2 p-4 sm:p-5">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-accent">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    {p.solution}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink sm:text-[15px]">{p.answer}</p>
                </div>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
