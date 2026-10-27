'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, BarChart3, ChevronDown, Globe, Menu, MessageCircle, Sparkles, X } from 'lucide-react';
import { useAuthSession } from '../../lib/use-auth-session';

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
  { title: 'Bengkel & otomotif', desc: 'Daftar servis, harga mulai, dan kontak darurat.', href: '/contoh' },
  { title: 'Kafe & kuliner', desc: 'Menu andalan, jam buka, dan pesan cepat via WA.', href: '/contoh' },
  { title: 'Laundry & retail', desc: 'Paket kiloan, area antar-jemput, dan rute Maps.', href: '/contoh' },
  { title: 'Salon & klinik', desc: 'Layanan, estimasi biaya, dan booking via WhatsApp.', href: '/contoh' },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function MegaNav() {
  const [open, setOpen] = useState<'product' | 'solution' | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<'product' | 'solution' | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { loggedIn } = useAuthSession();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

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

  const triggerClass =
    'nav-underline flex items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-ink-2 transition hover:text-ink';

  return (
    <header ref={ref} className="sticky top-0 z-50 pt-3 sm:pt-4">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-8">
        <div
          className={`flex h-14 items-center justify-between gap-2 rounded-full border border-rule px-2 pl-4 backdrop-blur transition-shadow duration-300 ${
            scrolled ? 'bg-surface/90 shadow-pop' : 'bg-surface/80 shadow-sm'
          }`}
        >
          <Link href="/" className="shrink-0 text-[15px] font-extrabold tracking-tight text-ink">
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
                className="press whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:opacity-90"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="press whitespace-nowrap rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition hover:opacity-90"
              >
                Masuk dengan Google
              </Link>
            )}
          </div>

          <button
            type="button"
            className="press rounded-full p-2 text-ink transition hover:bg-paper-2 lg:hidden"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
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
              className="absolute inset-x-0 top-full mx-auto mt-2 hidden w-full max-w-6xl px-3 sm:px-8 lg:block"
              onMouseLeave={() => setOpen(null)}
            >
              <div className="overflow-hidden rounded-3xl border border-rule bg-surface shadow-pop">
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
                      className="press group mt-4 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition hover:opacity-90"
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
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={reduce ? { opacity: 1 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.26, ease }}
              className="mt-2 overflow-hidden rounded-3xl border border-rule bg-surface shadow-pop lg:hidden"
            >
              <div className="space-y-1 p-3">
                <button
                  type="button"
                  onClick={() => setMobileGroup(mobileGroup === 'product' ? null : 'product')}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-ink"
                >
                  Produk <ChevronDown className={`h-4 w-4 transition-transform ${mobileGroup === 'product' ? 'rotate-180' : ''}`} />
                </button>
                {mobileGroup === 'product' ? (
                  <div className="space-y-0.5 pb-1 pl-3">
                    {productLinks.map((item) => (
                      <Link key={item.title} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-ink-2" onClick={() => setMobileOpen(false)}>
                        {item.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setMobileGroup(mobileGroup === 'solution' ? null : 'solution')}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-ink"
                >
                  Solusi <ChevronDown className={`h-4 w-4 transition-transform ${mobileGroup === 'solution' ? 'rotate-180' : ''}`} />
                </button>
                {mobileGroup === 'solution' ? (
                  <div className="space-y-0.5 pb-1 pl-3">
                    {solutionLinks.map((item) => (
                      <Link key={item.title} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-ink-2" onClick={() => setMobileOpen(false)}>
                        {item.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
                <Link href="/pricing" className="block rounded-xl px-3 py-3 text-sm font-semibold text-ink" onClick={() => setMobileOpen(false)}>
                  Harga
                </Link>
                <Link href="/contoh" className="block rounded-xl px-3 py-3 text-sm font-semibold text-ink" onClick={() => setMobileOpen(false)}>
                  Contoh
                </Link>
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href={loggedIn ? '/dashboard' : '/login'}
                    className="press block whitespace-nowrap rounded-full bg-ink px-5 py-3 text-center text-sm font-semibold text-paper"
                    onClick={() => setMobileOpen(false)}
                  >
                    {loggedIn ? 'Buka dashboard' : 'Masuk dengan Google'}
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
