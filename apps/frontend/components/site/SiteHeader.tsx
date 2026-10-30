'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  CalendarCheck,
  HelpCircle,
  Images,
  ListChecks,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Store,
  X,
} from 'lucide-react';
import type { Business } from '../../lib/api';

export interface NavItem {
  id: string;
  label: string;
}

const NAV_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  layanan: ListChecks,
  galeri: Images,
  booking: CalendarCheck,
  tentang: Store,
  faq: HelpCircle,
  lokasi: MapPin,
};

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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

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

  // kunci scroll saat menu mobile terbuka + fokuskan tombol tutup
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  // kembalikan fokus ke tombol hamburger saat menu ditutup
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      menuButtonRef.current?.focus();
    }
  }, [open]);

  // tutup menu jika layar melebar ke ukuran desktop
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia('(min-width: 768px)');
    const handleChange = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', handleChange);
    return () => desktop.removeEventListener('change', handleChange);
  }, [open]);

  // escape menutup menu
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  function openMenu() {
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab') return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  const go = (id: string) => {
    setOpen(false);
    window.requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  };

  return (
    <>
      <header
        className={[
          'sticky top-0 z-50 border-b bg-paper/90 backdrop-blur transition-shadow duration-300',
          scrolled ? 'border-rule shadow-[0_1px_0_0_var(--color-rule),0_12px_28px_-24px_oklch(20%_0.012_60/0.35)]' : 'border-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <BusinessIdentity business={business} />
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
              ref={menuButtonRef}
              type="button"
              onClick={openMenu}
              aria-expanded={open}
              aria-controls="site-mobile-menu"
              aria-haspopup="dialog"
              aria-label={open ? 'Tutup menu' : 'Buka menu'}
              className="press inline-flex h-10 w-10 items-center justify-center rounded-full border border-rule bg-paper text-ink md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="site-mobile-menu"
            id="site-mobile-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Menu ${business.name}`}
            onKeyDown={handleMenuKeyDown}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-paper md:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-rule px-5">
              <BusinessIdentity business={business} />
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMenu}
                aria-label="Tutup menu"
                className="press grid h-11 w-11 shrink-0 place-items-center rounded-full border border-rule text-ink transition hover:bg-paper-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-5">
              <p className="px-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-3">
                Halaman ini
              </p>
              <div className="mt-2 space-y-0.5">
                {navItems.map((item, index) => {
                  const Icon = NAV_ICONS[item.id] ?? ArrowRight;
                  const isActive = active === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1], delay: 0.04 + index * 0.035 }}
                    >
                      <button
                        type="button"
                        onClick={() => go(item.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={[
                          'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                          isActive ? 'bg-accent-soft' : 'active:bg-paper-2',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition',
                            isActive ? 'bg-accent text-accent-ink' : 'bg-paper-2 text-ink-2',
                          ].join(' ')}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span
                          className={[
                            'flex-1 font-display text-[17px] font-semibold tracking-[-0.01em]',
                            isActive ? 'text-accent' : 'text-ink',
                          ].join(' ')}
                        >
                          {item.label}
                        </span>
                        <ArrowRight
                          className={[
                            'h-4 w-4 transition',
                            isActive ? 'text-accent' : 'text-ink-3 opacity-0 group-hover:opacity-100',
                          ].join(' ')}
                        />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-rule bg-paper px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
              {business.whatsapp && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    onWhatsAppClick();
                    closeMenu();
                  }}
                  className="press flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-bold text-accent-ink hover:opacity-90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat WhatsApp
                </a>
              )}
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  onClick={() => {
                    onPhoneClick();
                    closeMenu();
                  }}
                  className={[
                    'press flex w-full items-center justify-center gap-2 rounded-full border border-rule bg-paper px-5 py-3.5 text-sm font-semibold text-ink hover:bg-paper-2',
                    business.whatsapp ? 'mt-2' : '',
                  ].join(' ')}
                >
                  <Phone className="h-4 w-4" />
                  Telepon
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BusinessIdentity({ business }: { business: Business }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      {business.logo_url ? (
        <Image
          src={business.logo_url}
          alt={business.name}
          width={36}
          height={36}
          unoptimized
          className="h-9 w-9 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-ink">
          {business.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold leading-tight text-ink">{business.name}</span>
        <span className="block truncate text-xs text-ink-2">{business.category}</span>
      </span>
    </span>
  );
}
