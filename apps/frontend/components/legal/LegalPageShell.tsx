import type { ReactNode } from 'react';
import { Footer } from '../marketing/Footer';
import { MegaNav } from '../marketing/MegaNav';
import { Container, Eyebrow } from '../marketing/primitives';
import { LEGAL_CONTACT_EMAIL, LEGAL_CONTACT_HREF, LEGAL_UPDATED } from '../../lib/legal';

export interface LegalSectionLink {
  id: string;
  title: string;
}

/* Kerangka dokumen legal: header editorial, daftar isi sticky di desktop,
 * dan artikel satu kolom yang nyaman dibaca di HP. Tanpa komponen client. */
export default function LegalPageShell({
  title,
  intro,
  sections,
  children,
}: {
  title: string;
  intro: ReactNode;
  sections: LegalSectionLink[];
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <MegaNav />

      <main>
        <section className="border-b border-rule bg-paper-2/40">
          <Container className="py-14 sm:py-20">
            <Eyebrow>Legal</Eyebrow>
            <h1 className="mt-4 max-w-3xl text-[2.15rem] font-semibold leading-[1.08] tracking-[-0.03em] text-balance sm:text-5xl">
              {title}
            </h1>
            <div className="mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-2">{intro}</div>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-3">
              <span className="rounded-full border border-rule bg-surface px-3 py-1 font-medium">
                Berlaku {LEGAL_UPDATED}
              </span>
              <span>Bahasa Indonesia</span>
            </div>
          </Container>
        </section>

        <Container className="py-12 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
                Daftar isi
              </p>
              <nav aria-label="Daftar isi dokumen" className="mt-4 border-l border-rule">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex gap-3 border-l-2 border-transparent py-1.5 pl-3 text-sm leading-snug text-ink-2 transition-colors hover:border-accent hover:text-ink focus-visible:border-accent focus-visible:text-ink focus-visible:outline-none"
                  >
                    <span className="font-mono text-[10px] leading-5 text-ink-3 group-hover:text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{section.title}</span>
                  </a>
                ))}
              </nav>

              <div className="mt-8 rounded-2xl border border-rule bg-paper-2 p-4">
                <p className="text-xs leading-relaxed text-ink-2">Ada pertanyaan tentang dokumen ini?</p>
                <a
                  href={LEGAL_CONTACT_HREF}
                  className="mt-1 block break-all text-sm font-semibold text-ink underline decoration-accent/40 underline-offset-4 transition hover:decoration-accent"
                >
                  {LEGAL_CONTACT_EMAIL}
                </a>
              </div>
            </aside>

            <article className="min-w-0 max-w-3xl">
              <div className="space-y-10">{children}</div>
              <div className="mt-12 border-t border-rule pt-6 text-xs leading-relaxed text-ink-3">
                <p>
                  Dokumen ini adalah bagian dari ketentuan layanan Pajangin dan berlaku untuk penggunaan
                  layanan di Indonesia.
                </p>
              </div>
            </article>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-xl font-semibold tracking-[-0.015em] text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-7 text-ink-2">{children}</div>
    </section>
  );
}
