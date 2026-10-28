'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useAuthSession } from '../../lib/use-auth-session';
import { Eyebrow, Section } from './primitives';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function FinalCta() {
  const { loggedIn } = useAuthSession();
  const reduce = useReducedMotion();

  return (
    <Section tone="ink">
      <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-20">
        <motion.div
          initial={reduce ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }}>
            <Eyebrow tone="inverse">Mulai hari ini</Eyebrow>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.55, ease }}
            className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5vw,4.75rem)] font-semibold leading-[0.99] tracking-[-0.045em] text-paper [text-wrap:balance]"
          >
            Buat halaman bisnis Anda, lalu bagikan <span className="text-accent">satu link.</span>
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.5, ease }} className="mt-6 max-w-xl text-base leading-relaxed text-paper-4 sm:text-lg">
            Tidak perlu desainer, tidak perlu hosting. Masuk dengan Google, isi profil singkat, dan halaman Anda langsung siap menerima chat.
          </motion.p>
        </motion.div>

        <motion.div
          className="flex flex-col gap-3 lg:items-end"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease, delay: 0.1 }}
        >
          <Link
            href={loggedIn ? '/dashboard' : '/login'}
            className="press group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-7 py-4 text-sm font-semibold text-accent-ink transition hover:bg-accent-strong lg:w-auto"
          >
            {loggedIn ? 'Buka dashboard' : 'Buat halaman gratis'}
            <ArrowRight className="arrow-nudge h-4 w-4" />
          </Link>
          <Link
            href="/contoh"
            className="press inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border border-paper-5 px-7 py-4 text-sm font-semibold text-paper transition hover:bg-ink-3 lg:w-auto"
          >
            Lihat contoh tampilan
          </Link>
          <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-paper-5 lg:text-right">
            Gratis selamanya · Tanpa kartu kredit
          </p>
        </motion.div>
      </div>
    </Section>
  );
}
