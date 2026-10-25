'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

// Popover ringan: tutup saat klik di luar / Escape, fokus kembali ke pemicu
export function Popover({
  trigger,
  children,
  align = 'start',
  side = 'bottom',
  className = '',
}: {
  trigger: (props: { open: boolean; toggle: () => void; id: string }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: 'start' | 'end';
  side?: 'bottom' | 'top';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        (ref.current?.querySelector('[aria-expanded]') as HTMLElement | null)?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((o) => !o), id })}
      {open && (
        <div
          id={id}
          className={`absolute z-50 min-w-[16rem] rounded-(--radius-card) border border-rule bg-surface p-1.5 shadow-pop motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 ${
            side === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
          } ${align === 'end' ? 'right-0' : 'left-0'} ${className}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
