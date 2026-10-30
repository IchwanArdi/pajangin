'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  Coffee,
  Globe,
  Menu,
  MessageCircle,
  Scissors,
  Shirt,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { useAuthSession } from '../../lib/use-auth-session';
import { track } from '../../lib/marketing-analytics';

type NavItem = {
  title: string;
  desc: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
};

const productLinks: NavItem[] = [
  { title: 'Halaman publik', desc: 'Profil bisnis siap jual dengan harga, lokasi, dan WhatsApp.', href: '/#fitur', icon: Globe },
  { title: 'Analitik', desc: 'Pengunjung, sumber trafik, dan konversi dalam satu layar.', href: '/#fitur', icon: BarChart3 },
  { title: 'SEO lokal', desc: 'Metadata + Schema.org agar mudah ditemukan Google.', href: '/#fitur', icon: Sparkles },
  { title: 'Insight marketing', desc: 'Tandai layanan sepi dan peluang konversi otomatis.', href: '/#cara-kerja', icon: MessageCircle },
];

const solutionLinks: NavItem[] = [
  { title: 'Bengkel & otomotif', desc: 'Daftar servis, harga mulai, dan kontak darurat.', href: '/contoh', icon: Wrench },
  { title: 'Kafe & kuliner', desc: 'Menu andalan, jam buka, dan pesan cepat via WA.', href: '/contoh', icon: Coffee },
  { title: 'Laundry & retail', desc: 'Paket kiloan, area antar-jemput, dan rute Maps.', href: '/contoh', icon: Shirt },
  { title: 'Salon & klinik', desc: 'Layanan, estimasi biaya, dan booking via WhatsApp.', href: '/contoh', icon: Scissors },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function MegaNav() {
  const [open, setOpen] = useState<'product' | 'solution' | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { loggedIn } = useAuthSession();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const wasMenuOpen = useRef(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(null);
        setMobileOpen(false);
      }
    }
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Kunci scroll halaman selama menu penuh layar terbuka, lalu pulihkan.
  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [mobileOpen]);

  // Kembalikan fokus ke tombol hamburger saat menu ditutup.
  useEffect(() => {
    if (mobileOpen) {
      wasMenuOpen.current = true;
      return;
    }
    if (wasMenuOpen.current) {
      wasMenuOpen.current = false;
      menuButtonRef.current?.focus();
    }
  }, [mobileOpen]);

  // Tutup menu jika layar diperbesar ke ukuran desktop saat menu terbuka.
  useEffect(() => {
    if (!mobileOpen) return;
    const desktop = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener('change', handleChange);
    return () => desktop.removeEventListener('change', handleChange);
  }, [mobileOpen]);

  function openMenu() {
    setOpen(null);
    setMobileOpen(true);
  }

  function closeMenu() {
    setMobileOpen(false);
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

  const triggerClass =
    'nav-underline flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-ink-2 transition hover:text-ink';

  return (
    <header ref={ref} className="sticky top-0 z-50 pt-3 sm:pt-4">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-8">
        <div
          className={`flex h-14 items-center justify-between gap-2 rounded-full border border-rule bg-surface px-2 pl-4 transition-shadow duration-300 ${
            scrolled ? 'shadow-window' : 'shadow-sm'
          }`}
        >
          <Link href="/" className="shrink-0 font-display text-[17px] font-semibold tracking-[-0.035em] text-ink">
            Pajang<span className="text-accent">in</span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigasi utama">
            <div className="relative">
              <button
                type="button"
                aria-expanded={open === 'product'}
                onMouseEnter={() => setOpen('product')}
                onFocus={() => setOpen('product')}
                onClick={() => setOpen(open === 'product' ? null : 'product')}
                className={triggerClass}
              >
                Produk <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open === 'product' ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div className="relative">
              <button
                type="button"
                aria-expanded={open === 'solution'}
                onMouseEnter={() => setOpen('solution')}
                onFocus={() => setOpen('solution')}
                onClick={() => setOpen(open === 'solution' ? null : 'solution')}
                className={triggerClass}
              >
                Solusi <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open === 'solution' ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <Link href="/pricing" className={triggerClass}>
              Harga
            </Link>
            <Link href="/contoh" className={triggerClass}>
              Contoh
            </Link>
          </nav>

          <div className="hidden items-center gap-1.5 lg:flex">
            {loggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => track('cta_clicked', { location: 'nav-primary', label: 'Dashboard' })}
                className="press whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-3"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => track('cta_clicked', { location: 'nav-primary', label: 'Masuk dengan Google' })}
                className="press whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-3"
              >
                Masuk dengan Google
              </Link>
            )}
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            className="press grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-paper-2 lg:hidden"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
            onClick={openMenu}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              key="desktop-menu"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease }}
              className="absolute inset-x-0 top-full mx-auto mt-2 hidden w-full max-w-7xl px-3 sm:px-8 lg:block"
              onMouseLeave={() => setOpen(null)}
            >
              <div className="overflow-hidden rounded-3xl border border-rule bg-surface shadow-window">
                <div className="grid gap-6 p-6 md:grid-cols-[1.35fr_0.65fr]">
                  <div>
                    <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3">
                      {open === 'product' ? 'Produk' : 'Solusi untuk usaha lokal'}
                    </p>
                    <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
                      {(open === 'product' ? productLinks : solutionLinks).map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.title}
                            initial={reduce ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, ease, delay: 0.03 + i * 0.03 }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setOpen(null)}
                              className="group block rounded-2xl border border-transparent p-3.5 transition hover:border-rule hover:bg-paper-2"
                            >
                              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                                {Icon ? <Icon className="h-4 w-4 text-accent" /> : null}
                                <span className="whitespace-nowrap">{item.title}</span>
                                <ArrowRight className="arrow-nudge h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-ink-2">{item.desc}</p>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between rounded-2xl border border-rule bg-paper-2 p-5">
                    <div>
                      <p className="text-sm font-semibold text-ink">Siap untuk usaha lokal?</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-2">
                        Buat halaman publik, cantumkan harga, dan mulai terima chat WhatsApp.
                      </p>
                    </div>
                    <Link
                      href={loggedIn ? '/dashboard' : '/login'}
                      onClick={() => setOpen(null)}
                      className="press group mt-4 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-accent-strong"
                    >
                      {loggedIn ? 'Buka dashboard' : 'Mulai sekarang'}
                      <ArrowRight className="arrow-nudge h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              key="mobile-menu"
              id="mobile-menu"
              ref={menuRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu navigasi"
              onKeyDown={handleMenuKeyDown}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.24, ease }}
              className="fixed inset-0 z-[60] flex flex-col bg-paper lg:hidden"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-rule px-4">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="font-display text-[17px] font-semibold tracking-[-0.035em] text-ink"
                >
                  Pajang<span className="text-accent">in</span>
                </Link>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeMenu}
                  aria-label="Tutup menu"
                  className="press grid h-11 w-11 place-items-center rounded-full border border-rule text-ink transition hover:bg-paper-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-6">
                <MobileMenuGroup
                  label="Produk"
                  items={productLinks}
                  onNavigate={closeMenu}
                  reduce={reduce}
                  delay={0.04}
                />
                <MobileMenuGroup
                  label="Solusi"
                  items={solutionLinks}
                  onNavigate={closeMenu}
                  reduce={reduce}
                  delay={0.16}
                  className="mt-7"
                />

                <div className="mt-8 grid grid-cols-2 gap-2">
                  <Link
                    href="/pricing"
                    onClick={closeMenu}
                    className="press flex items-center justify-between rounded-2xl border border-rule bg-surface px-4 py-3.5 text-sm font-semibold text-ink"
                  >
                    Harga
                    <ArrowRight className="h-4 w-4 text-ink-3" />
                  </Link>
                  <Link
                    href="/contoh"
                    onClick={closeMenu}
                    className="press flex items-center justify-between rounded-2xl border border-rule bg-surface px-4 py-3.5 text-sm font-semibold text-ink"
                  >
                    Contoh
                    <ArrowRight className="h-4 w-4 text-ink-3" />
                  </Link>
                </div>
              </div>

              <div className="shrink-0 border-t border-rule bg-paper px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                <Link
                  href={loggedIn ? '/dashboard' : '/login'}
                  onClick={() => {
                    closeMenu();
                    track('cta_clicked', {
                      location: 'mobile-menu-primary',
                      label: loggedIn ? 'Buka dashboard' : 'Buat halaman gratis',
                    });
                  }}
                  className="press flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-accent-ink shadow-pop transition hover:bg-accent-strong"
                >
                  {loggedIn ? 'Buka dashboard' : 'Buat halaman gratis'}
                  <ArrowRight className="arrow-nudge h-4 w-4" />
                </Link>
                <p className="mt-2.5 text-center text-xs text-ink-3">
                  {loggedIn ? 'Anda sudah masuk dengan Google' : 'Gratis · Tanpa kartu kredit'}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}

function MobileMenuGroup({
  label,
  items,
  onNavigate,
  reduce,
  delay = 0,
  className = '',
}: {
  label: string;
  items: NavItem[];
  onNavigate: () => void;
  reduce: boolean | null;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="px-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink-3">{label}</p>
      <div className="mt-1.5 space-y-0.5">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={`${label}-${item.title}`}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease, delay: delay + index * 0.035 }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className="group flex items-start gap-3 rounded-2xl px-3 py-3 transition active:bg-paper-2"
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-paper-2 text-ink-2 transition group-hover:bg-accent-soft group-hover:text-accent">
                  {Icon ? <Icon className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-display text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                    {item.title}
                    <ArrowRight className="arrow-nudge h-3.5 w-3.5 text-accent opacity-0 transition group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-2">{item.desc}</span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
