'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

/* Hallmark · component: shared marketing motion
 * Hanya transform/opacity. Semua menghormati prefers-reduced-motion. */

const ease = [0.16, 1, 0.3, 1] as const;

/* Angka yang naik (count-up) saat masuk layar. */
export function CountUp({
  value,
  format,
  duration = 0.9,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value, duration]);

  const shown = reduce ? value : value * progress;

  return (
    <span ref={ref} className={className}>
      {format(shown)}
    </span>
  );
}

/* Bar yang tumbuh dari 0. Caller memberi tinggi (mis. h-1.5) + lebar (flex-1). */
export function BarGrow({
  value,
  tone = 'accent',
  delay = 0,
  className = '',
}: {
  value: number;
  tone?: 'accent' | 'ink' | 'muted';
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const fill = tone === 'accent' ? 'bg-accent' : tone === 'ink' ? 'bg-ink-2' : 'bg-ink-3';
  const pct = `${Math.max(2, Math.min(100, value))}%`;

  return (
    <span className={`block overflow-hidden rounded-full bg-paper-3 ${className}`}>
      <motion.span
        className={`block h-full rounded-full ${fill}`}
        initial={reduce ? false : { width: '0%' }}
        whileInView={{ width: pct }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, ease, delay }}
      />
    </span>
  );
}

/* Garis grafik yang menggambar sendiri saat masuk layar. */
export function DrawSparkline({
  lines,
  className,
  label = 'Tren kunjungan (pratinjau dashboard)',
}: {
  lines: Array<{ points: string; stroke: string }>;
  className?: string;
  label?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <svg viewBox="0 0 220 56" className={className} role="img" aria-label={label}>
      {lines.map((l, i) => (
        <motion.polyline
          key={l.points}
          points={l.points}
          fill="none"
          style={{ stroke: l.stroke }}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.1, ease, delay: 0.15 + i * 0.15 }}
        />
      ))}
    </svg>
  );
}
