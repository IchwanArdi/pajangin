'use client';

import { Children } from 'react';
import { motion, useReducedMotion } from 'motion/react';

// Scroll-reveal ringan: setiap anak masuk saat terlihat, stagger 60ms.
// Anak tunggal maupun array sama-sama dianimasikan.
export function Reveal({
  children,
  className,
  stagger = 0.06,
  y = 16,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);

  return (
    <motion.div
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={{ hidden: { opacity: 0, y }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
