'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Menu, MessageCircle, X } from 'lucide-react';
import type { Business } from '../../lib/api';

export interface NavItem {
  id: string;
  label: string;
}

interface Props {
  business: Business;
  navItems: NavItem[];
  waLink: string;
  onWhatsAppClick: () => void;
  onPhoneClick: () => void;
}

export default function SiteHeader({ business, navItems, waLink, onWhatsAppClick, onPhoneClick }: Props) {
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  // elevasi header setelah scroll (rAF agar setState tidak sinkron di dalam effect)
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // scrollspy: tandai bagian yang sedang dilihat
  useEffect(() => {
    if (navItems.length === 0) return;
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navItems]);

  // kunci scroll saat menu mobile terbuka
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b bg-paper/90 backdrop-blur transition-shadow duration-300',
        scrolled ? 'border-rule shadow-[0_1px_0_0_var(--color-rule),0_12px_28px_-24px_oklch(20%_0.012_60/0.35)]' : 'border-transparent',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          {business.logo_url ? (
            <Image src={business.logo_url} alt={business.name} width={36} height={36} unoptimized className="h-9 w-9 shrink-0 rounded-xl object-cover" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-ink">
              {business.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-ink">{business.name}</p>
            <p className="truncate text-xs text-ink-2">{business.category}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={active === item.id ? 'true' : undefined}
              className={[
                'press rounded-full px-3.5 py-2 text-sm transition',
                active === item.id ? 'bg-ink font-semibold text-paper' : 'text-ink-2 hover:bg-paper-2 hover:text-ink',
              ].join(' ')}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {business.whatsapp && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onWhatsAppClick()}
              className="press hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90 sm:inline-flex"
            >
              <MessageCircle className="h-4 w-4" />
              Chat WA
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            className="press inline-flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-paper text-ink md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-rule bg-paper md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={[
                    'rounded-xl px-3 py-3 text-left text-sm font-medium transition',
                    active === item.id ? 'bg-accent-soft text-accent' : 'text-ink-2 hover:bg-paper-2 hover:text-ink',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {business.whatsapp && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      onWhatsAppClick();
                      setOpen(false);
                    }}
                    className="press inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-bold text-accent-ink"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat WA
                  </a>
                )}
                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    onClick={() => {
                      onPhoneClick();
                      setOpen(false);
                    }}
                    className="press inline-flex items-center justify-center gap-2 rounded-full border border-rule bg-paper px-4 py-3 text-sm font-semibold text-ink"
                  >
                    Telepon
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
