'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Reveal per-elemen untuk grid: kelas kartu dipasang langsung pada elemen yang
 * dianimasikan, sehingga tinggi kartu tetap sama di dalam satu baris grid.
 */
export function ItemReveal({
  children,
  className,
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: Math.min(index * 0.05, 0.25) }}
    >
      {children}
    </motion.div>
  );
}
