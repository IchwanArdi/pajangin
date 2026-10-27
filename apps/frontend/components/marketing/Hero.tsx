'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, CalendarCheck, Check, Globe, MapPin, MessageCircle, Search, Star, TrendingUp } from 'lucide-react';
import { useAuthSession } from '../../lib/use-auth-session';
import { CountUp, BarGrow, DrawSparkline } from './motion';
import { Pill } from './primitives';

type TabKey = 'public' | 'dashboard' | 'booking';

const TABS: Array<{ key: TabKey; label: string; short: string }> = [
  { key: 'public', label: 'Halaman publik', short: 'Halaman' },
  { key: 'dashboard', label: 'Dashboard', short: 'Dasbor' },
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

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

const nfInt = new Intl.NumberFormat('id-ID');
const fmtInt = (n: number) => nfInt.format(Math.round(n));
const fmtPct1 = (n: number) =>
  `${n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

function PublicMockup() {
  return (
    <div className="p-3 sm:p-4">
      <div className="overflow-hidden rounded-xl border border-rule">
        <div className="relative h-16 bg-accent-soft">
          <span className="absolute left-3 top-3 rounded-full bg-surface px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            Bengkel &amp; Otomotif
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-xs font-bold text-paper">BJ</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">Bengkel Maju Jaya</p>
              <p className="truncate text-xs text-ink-2">Purwokerto · Buka 08.00–17.00</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent">
              <Star className="h-3 w-3 fill-current" /> 4,9
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            {SERVICES.map(([name, price]) => (
              <div
                key={name}
                className="group flex items-center justify-between rounded-lg border border-rule bg-paper px-3 py-2 text-sm transition hover:border-accent/50 hover:bg-accent-soft/40"
              >
                <span className="text-ink">{name}</span>
                <span className="flex items-center gap-2 text-ink-2">
                  <span className="tabular-nums">{price}</span>
                  <ArrowRight className="arrow-nudge h-3.5 w-3.5 text-accent" />
                </span>
              </div>
            ))}
          </div>

          <div className="group mt-3 flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink">
            <MessageCircle className="h-4 w-4" /> Hubungi via WhatsApp
            <ArrowRight className="arrow-nudge h-4 w-4" />
          </div>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-ink-3">
            <MapPin className="h-3 w-3" /> Alamat &amp; jam buka otomatis tampil di bawah
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div>
        <p className="text-xs font-medium text-ink-2">Kontak masuk</p>
        <div className="mt-1 flex items-end gap-2">
          <CountUp value={128} format={fmtInt} className="text-4xl font-semibold tabular-nums tracking-[-0.03em] text-ink" />
          <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-positive-soft px-2 py-0.5 text-xs font-semibold text-positive">
            <TrendingUp className="h-3 w-3" /> +12%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-rule rounded-xl border border-rule bg-surface">
        {(
          [
            ['Pengunjung', <CountUp key="a" value={1240} format={fmtInt} />],
            ['Tingkat kontak', <CountUp key="b" value={10.3} format={fmtPct1} />],
            ['Klik WhatsApp', <CountUp key="c" value={96} format={fmtInt} />],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="min-w-0 px-3 py-3">
            <p className="truncate text-[11px] text-ink-2">{label}</p>
            <p className="mt-0.5 text-base font-semibold tabular-nums text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-rule bg-surface p-3">
        <DrawSparkline
          className="h-14 w-full"
          lines={[
            { points: '0,44 20,40 40,42 60,32 80,34 100,24 120,27 140,18 160,20 180,12 200,15 220,8', stroke: 'var(--color-chart-contacts)' },
            { points: '0,50 20,48 40,49 60,44 80,46 100,40 120,42 140,36 160,38 180,32 200,34 220,28', stroke: 'var(--color-chart-visitors)' },
          ]}
        />
      </div>

      <div className="space-y-2.5">
        {SOURCES.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-ink-2">{s.label}</span>
            <BarGrow value={s.value} className="h-1.5 flex-1" delay={0.1 + i * 0.1} />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-ink-2">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingMockup() {
  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div>
        <p className="text-xs font-medium text-ink-2">Layanan</p>
        <div className="group mt-1.5 flex items-center justify-between rounded-lg border border-rule bg-paper px-3 py-2.5 text-sm text-ink transition hover:border-accent/50">
          Servis ringan &amp; tune up <ArrowRight className="arrow-nudge h-3.5 w-3.5 text-accent" />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-ink-2">Pilih tanggal</p>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {['Sen 14', 'Sel 15', 'Rab 16', 'Kam 17'].map((d) => (
            <span
              key={d}
              className={`rounded-lg border px-2 py-2 text-center text-xs transition ${
                d === 'Sel 15' ? 'border-accent bg-accent-soft font-semibold text-accent' : 'border-rule text-ink-2 hover:border-ink-3/40'
              }`}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-ink-2">Jam tersedia</p>
        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
          {['09.00', '10.00', '13.00', '15.00'].map((t) => (
            <span
              key={t}
              className={`rounded-lg border px-2 py-2 text-center text-xs transition ${
                t === '10.00' ? 'border-accent bg-accent-soft font-semibold text-accent' : 'border-rule text-ink-2 hover:border-ink-3/40'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="group flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink">
        <CalendarCheck className="h-4 w-4" /> Ajukan reservasi
        <ArrowRight className="arrow-nudge h-4 w-4" />
      </div>
      <p className="text-center text-[11px] text-ink-3">Pemilik menerima notifikasi &amp; mengelola status dari dashboard</p>
    </div>
  );
}

export function Hero() {
  const [tab, setTab] = useState<TabKey>('public');
  const reduce = useReducedMotion();
  const { loggedIn } = useAuthSession();

  const label =
    tab === 'public'
      ? 'Halaman publik · pajangin.web.id/bengkel-maju-jaya'
      : tab === 'dashboard'
        ? 'Dashboard pemilik · ringkasan'
        : 'Halaman publik · form booking';

  return (
    <section className="border-b border-rule">
      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:pb-24">
        <motion.div
          initial={reduce ? false : 'hidden'}
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
        >
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, ease }}
            className="flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-ink-2"
          >
            <span aria-hidden className="h-px w-5 bg-accent" />
            Marketing &amp; analitik untuk usaha lokal
          </motion.p>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.55, ease }}
            className="mt-5 text-[2.1rem] font-semibold leading-[1.06] tracking-[-0.03em] text-ink [overflow-wrap:anywhere] sm:text-5xl lg:text-[3.35rem]"
          >
            Halaman bisnis gratis yang tampil profesional dan menghasilkan chat WhatsApp.
          </motion.h1>

          <motion.p variants={fadeUp} transition={{ duration: 0.5, ease }} className="mt-6 max-w-xl text-base leading-relaxed text-ink-2">
            Pajangin menyiapkan halaman publik dengan SEO lokal, melacak setiap kunjungan dan klik kontak, lalu menunjukkan
            layanan mana yang benar-benar menarik pelanggan — semuanya dari satu dashboard.
          </motion.p>

          <motion.div variants={fadeUp} transition={{ duration: 0.5, ease }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={loggedIn ? '/dashboard' : '/login'}
              className="press group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-ink shadow-pop transition hover:opacity-90"
            >
              {loggedIn ? 'Buka dashboard' : 'Buat halaman gratis'}
              <ArrowRight className="arrow-nudge h-4 w-4" />
            </Link>
            <Link
              href="/contoh"
              className="press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-rule bg-surface px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-paper-2"
            >
              <Globe className="h-4 w-4 text-ink-2" />
              Lihat contoh tampilan
            </Link>
          </motion.div>

          <motion.ul variants={fadeUp} transition={{ duration: 0.5, ease }} className="mt-8 flex flex-wrap gap-2">
            {['Gratis selamanya', 'Tanpa hosting sendiri', 'SEO & Schema.org bawaan', 'Bahasa Indonesia'].map((f) => (
              <li key={f}>
                <Pill>
                  <Check className="h-3.5 w-3.5 text-accent" /> {f}
                </Pill>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          className="min-w-0"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease, delay: 0.18 }}
        >
          <div className="mb-3 flex gap-1 rounded-full border border-rule bg-surface p-1 shadow-sm sm:w-fit">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-pressed={tab === t.key}
                className={`relative flex-1 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition sm:flex-none sm:text-sm ${
                  tab === t.key ? 'text-paper' : 'text-ink-2 hover:text-ink'
                }`}
              >
                {tab === t.key ? (
                  <motion.span
                    layoutId="hero-tab-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative z-10 hidden sm:inline">{t.label}</span>
                <span className="relative z-10 sm:hidden">{t.short}</span>
              </button>
            ))}
          </div>

          <figure className="overflow-hidden rounded-2xl border border-rule bg-surface shadow-pop">
            <figcaption className="flex items-center justify-between gap-3 border-b border-rule bg-surface px-4 py-2.5">
              <span className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-3">{label}</span>
              <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
                <Search className="h-3 w-3" /> pratinjau
              </span>
            </figcaption>
            <div className="relative">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 1 } : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.24, ease }}
                >
                  {tab === 'public' ? <PublicMockup /> : tab === 'dashboard' ? <DashboardMockup /> : <BookingMockup />}
                </motion.div>
              </AnimatePresence>
            </div>
          </figure>
        </motion.div>
      </div>
    </section>
  );
}
