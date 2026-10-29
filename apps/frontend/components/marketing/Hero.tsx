'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, CalendarCheck, Check, Globe, MapPin, MessageCircle, Search, Star, TrendingUp } from 'lucide-react';
import { useAuthSession } from '../../lib/use-auth-session';
import { track } from '../../lib/marketing-analytics';
import { CountUp, BarGrow, DrawSparkline } from './motion';

type TabKey = 'public' | 'dashboard' | 'booking';

const TABS: Array<{ key: TabKey; label: string; short: string }> = [
  { key: 'dashboard', label: 'Dashboard', short: 'Dasbor' },
  { key: 'public', label: 'Halaman publik', short: 'Halaman' },
  { key: 'booking', label: 'Booking', short: 'Booking' },
];

const SERVICES = [
  ['Servis AC mobil', 'Rp 150.000'],
  ['Ganti oli & filter', 'Rp 85.000'],
  ['Tune up ringan', 'Rp 250.000'],
] as const;

const SOURCES = [
  { label: 'Google Organik', value: 62 },
  { label: 'Instagram', value: 24 },
  { label: 'Langsung / link', value: 14 },
] as const;

const PROOF = ['Gratis selamanya', 'Tanpa hosting sendiri', 'SEO & Schema.org bawaan', 'Bahasa Indonesia'] as const;

const ease = [0.16, 1, 0.3, 1] as const;

const nfInt = new Intl.NumberFormat('id-ID');
const fmtInt = (n: number) => nfInt.format(Math.round(n));
const fmtPct1 = (n: number) => `${n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

function PublicMockup() {
  return (
    <div className="p-4 sm:p-5">
      <div className="overflow-hidden rounded-2xl border border-rule">
        <div className="relative h-20 bg-accent-soft">
          <span className="absolute left-4 top-4 rounded-full bg-surface px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">Bengkel &amp; Otomotif</span>
          <span className="absolute bottom-3 right-4 h-6 w-24 rounded-full bg-accent" />
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink font-display text-sm font-bold text-paper">BJ</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-semibold text-ink">Bengkel Maju Jaya</p>
              <p className="truncate text-xs text-ink-2">Purwokerto · Buka 08.00–17.00</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
              <Star className="h-3 w-3 fill-current" /> 4,9
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {SERVICES.map(([name, price]) => (
              <div key={name} className="group flex items-center justify-between rounded-xl border border-rule bg-paper-2 px-3.5 py-2.5 text-sm transition hover:border-accent hover:bg-paper-3">
                <span className="text-ink">{name}</span>
                <span className="flex items-center gap-2 text-ink-2">
                  <span className="tabular-nums">{price}</span>
                  <ArrowRight className="arrow-nudge h-3.5 w-3.5 text-accent" />
                </span>
              </div>
            ))}
          </div>

          <div className="group mt-4 flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-ink">
            <MessageCircle className="h-4 w-4" /> Hubungi via WhatsApp
            <ArrowRight className="arrow-nudge h-4 w-4" />
          </div>
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-ink-3">
            <MapPin className="h-3 w-3" /> Alamat &amp; jam buka otomatis tampil di bawah
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="space-y-4 p-5 sm:p-6">
      <div>
        <p className="text-xs font-medium text-ink-2">Kontak masuk</p>
        <div className="mt-1 flex items-end gap-2">
          <CountUp value={128} format={fmtInt} className="font-display text-5xl font-semibold tabular-nums tracking-[-0.04em] text-ink" />
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-positive-soft px-2 py-0.5 text-xs font-semibold text-positive">
            <TrendingUp className="h-3 w-3" /> +12%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-rule rounded-2xl border border-rule bg-paper-2">
        {(
          [
            ['Pengunjung', <CountUp key="a" value={1240} format={fmtInt} />],
            ['Tingkat kontak', <CountUp key="b" value={10.3} format={fmtPct1} />],
            ['Klik WhatsApp', <CountUp key="c" value={96} format={fmtInt} />],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="min-w-0 px-3.5 py-3.5">
            <p className="truncate text-[11px] text-ink-2">{label}</p>
            <p className="mt-0.5 font-display text-lg font-semibold tabular-nums text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-rule bg-surface p-4">
        <DrawSparkline
          className="h-16 w-full"
          lines={[
            { points: '0,44 20,40 40,42 60,32 80,34 100,24 120,27 140,18 160,20 180,12 200,15 220,8', stroke: 'var(--color-chart-contacts)' },
            { points: '0,50 20,48 40,49 60,44 80,46 100,40 120,42 140,36 160,38 180,32 200,34 220,28', stroke: 'var(--color-chart-visitors)' },
          ]}
        />
      </div>

      <div className="space-y-3">
        {SOURCES.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-ink-2">{s.label}</span>
            <BarGrow value={s.value} className="h-2 flex-1" delay={0.1 + i * 0.1} />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-ink-2">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingMockup() {
  return (
    <div className="space-y-5 p-5 sm:p-6">
      <div>
        <p className="text-xs font-medium text-ink-2">Layanan</p>
        <div className="group mt-2 flex items-center justify-between rounded-xl border border-rule bg-paper-2 px-3.5 py-3 text-sm text-ink transition hover:border-accent">
          Servis ringan &amp; tune up <ArrowRight className="arrow-nudge h-3.5 w-3.5 text-accent" />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-ink-2">Pilih tanggal</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {['Sen 14', 'Sel 15', 'Rab 16', 'Kam 17'].map((d) => (
            <span key={d} className={`rounded-xl border px-2 py-2.5 text-center text-xs transition ${d === 'Sel 15' ? 'border-accent bg-accent-soft font-semibold text-accent' : 'border-rule bg-paper-2 text-ink-2 hover:border-ink-3'}`}>
              {d}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-ink-2">Jam tersedia</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {['09.00', '10.00', '13.00', '15.00'].map((t) => (
            <span key={t} className={`rounded-xl border px-2 py-2.5 text-center text-xs transition ${t === '10.00' ? 'border-accent bg-accent-soft font-semibold text-accent' : 'border-rule bg-paper-2 text-ink-2 hover:border-ink-3'}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="group flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-accent-ink">
        <CalendarCheck className="h-4 w-4" /> Ajukan reservasi
        <ArrowRight className="arrow-nudge h-4 w-4" />
      </div>
      <p className="text-center text-[11px] text-ink-3">Pemilik menerima notifikasi &amp; mengelola status dari dashboard</p>
    </div>
  );
}

export function Hero() {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const { loggedIn } = useAuthSession();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, -38]);
  const mockupRotate = useTransform(scrollYProgress, [0, 1], [0, -1.2]);

  useEffect(() => {
    if (reduce || paused) return;

    const id = window.setInterval(() => {
      setTab((current) => {
        const index = TABS.findIndex((item) => item.key === current);
        return TABS[(index + 1) % TABS.length].key;
      });
    }, 5600);

    return () => window.clearInterval(id);
  }, [paused, reduce]);

  const label = tab === 'dashboard' ? 'Dashboard pemilik · ringkasan' : tab === 'public' ? 'pajangin.web.id/bengkel-maju-jaya' : 'Halaman publik · form booking';

  return (
    <section ref={sectionRef} className="relative overflow-hidden border-b border-rule bg-surface">
      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-16 lg:pb-28">
        <div>
          <p className="hero-rise flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-3" style={{ animationDelay: '0.05s' }}>
            <span aria-hidden className="h-px w-5 bg-accent" />
            Marketing &amp; analitik untuk usaha lokal
          </p>

          <h1 className="mt-6 font-display text-[clamp(2.1rem,4vw,3.55rem)] font-semibold leading-[1.01] tracking-[-0.045em] text-ink wrap-anywhere">
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="hero-line block" style={{ animationDelay: '0.08s' }}>
                Halaman bisnis gratis
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="hero-line block" style={{ animationDelay: '0.17s' }}>
                yang tampil profesional
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="hero-line block" style={{ animationDelay: '0.26s' }}>
                dan menghasilkan
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span className="hero-line block text-accent" style={{ animationDelay: '0.35s' }}>
                chat WhatsApp.
              </span>
            </span>
          </h1>

          <p className="hero-rise mt-7 max-w-xl text-base leading-relaxed text-ink-2 sm:text-lg" style={{ animationDelay: '0.42s' }}>
            Pajangin menyiapkan halaman publik dengan SEO lokal, melacak setiap kunjungan dan klik kontak, lalu menunjukkan layanan mana yang benar-benar menarik pelanggan — semuanya dari satu dashboard.
          </p>

          <div className="hero-rise mt-9 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '0.5s' }}>
            <Link
              href={loggedIn ? '/dashboard' : '/login'}
              onClick={() => track('cta_clicked', { location: 'hero-primary', label: loggedIn ? 'Buka dashboard' : 'Buat halaman gratis' })}
              className="press group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-7 py-4 text-sm font-semibold text-accent-ink shadow-pop transition hover:bg-accent-strong"
            >
              {loggedIn ? 'Buka dashboard' : 'Buat halaman gratis'}
              <ArrowRight className="arrow-nudge h-4 w-4" />
            </Link>
            <Link
              href="/contoh"
              onClick={() => track('cta_clicked', { location: 'hero-secondary', label: 'Lihat contoh tampilan' })}
              className="press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-rule bg-surface px-6 py-4 text-sm font-semibold text-ink transition hover:bg-paper-2"
            >
              <Globe className="h-4 w-4 text-ink-2" />
              Lihat contoh tampilan
            </Link>
          </div>

          <ul className="hero-rise mt-9 grid max-w-lg grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2" style={{ animationDelay: '0.58s' }}>
            {PROOF.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-ink-2">
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-preview min-w-0">
          <motion.div
            style={reduce ? undefined : { y: mockupY, rotate: mockupRotate }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div role="tablist" aria-label="Pratinjau produk" className="flex gap-1 rounded-full border border-rule bg-paper-2 p-1">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.key}
                    onClick={() => {
                      setTab(t.key);
                      setPaused(true);
                      track('preview_tab_clicked', { tab: t.key });
                    }}
                    className={`relative rounded-full px-3.5 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${tab === t.key ? 'text-paper' : 'text-ink-2 hover:text-ink'}`}
                  >
                    {tab === t.key ? <motion.span layoutId="hero-tab-pill" className="absolute inset-0 rounded-full bg-ink" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }} /> : null}
                    <span className="relative z-10 hidden sm:inline">{t.label}</span>
                    <span className="relative z-10 sm:hidden">{t.short}</span>
                  </button>
                ))}
              </div>
              <span className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Pratinjau hidup
              </span>
            </div>

            <div className="relative">
              <div aria-hidden className="absolute -inset-4 -z-10 hidden rounded-[2.25rem] bg-paper-2 lg:block" />
              <figure className="relative z-10 overflow-hidden rounded-3xl border border-rule bg-surface shadow-window">
                <figcaption className="flex items-center justify-between gap-3 border-b border-rule bg-paper-2 px-4 py-3 sm:px-5">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-3">{label}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                    <Search className="h-3 w-3" /> pratinjau
                  </span>
                </figcaption>
                <div className="relative min-h-95">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={tab} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 1 } : { opacity: 0, y: -12 }} transition={{ duration: 0.28, ease }}>
                      {tab === 'dashboard' ? <DashboardMockup /> : tab === 'public' ? <PublicMockup /> : <BookingMockup />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </figure>

              <div className="absolute -bottom-6 -left-6 z-20 hidden items-center gap-3 rounded-2xl border border-rule bg-surface px-4 py-3 shadow-window sm:flex">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-positive-soft text-positive">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold leading-none tracking-[-0.02em] text-ink">128 kontak</p>
                  <p className="mt-1 text-[11px] text-ink-3">bulan ini · +12%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
