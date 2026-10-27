'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useAuthSession } from '../../lib/use-auth-session';
import { Container } from './primitives';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function FinalCta() {
  const { loggedIn } = useAuthSession();
  const reduce = useReducedMotion();

  return (
    <section className="border-t border-rule bg-surface">
      <Container className="py-16 sm:py-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-rule bg-surface px-6 py-12 sm:px-12 sm:py-16">
          <div aria-hidden className="cta-aurora">
            <span className="cta-aurora__blob cta-aurora__blob--a" />
            <span className="cta-aurora__blob cta-aurora__blob--b" />
            <span className="cta-aurora__blob cta-aurora__blob--c" />
          </div>
          <motion.div
            className="relative max-w-2xl"
            initial={reduce ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5, ease }}
              className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-accent"
            >
              Mulai hari ini
            </motion.p>
            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.55, ease }}
              className="mt-4 text-[1.9rem] font-semibold leading-[1.1] tracking-[-0.025em] text-ink [overflow-wrap:anywhere] sm:text-[2.75rem]"
            >
              Buat halaman bisnis Anda, lalu bagikan satu link ke pelanggan.
            </motion.h2>
            <motion.p variants={fadeUp} transition={{ duration: 0.5, ease }} className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2">
              Tidak perlu desainer, tidak perlu hosting. Masuk dengan Google, isi profil singkat, dan halaman Anda langsung siap menerima chat.
            </motion.p>
            <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={loggedIn ? '/dashboard' : '/login'}
                className="press group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-ink shadow-pop transition hover:opacity-90"
              >
                {loggedIn ? 'Buka dashboard' : 'Buat halaman gratis'}
                <ArrowRight className="arrow-nudge h-4 w-4" />
              </Link>
              <Link
                href="/contoh"
                className="press inline-flex items-center justify-center whitespace-nowrap rounded-full border border-rule bg-surface px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-paper-2"
              >
                Lihat contoh tampilan
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
