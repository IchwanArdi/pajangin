'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  BarChart3,
  CalendarCheck,
  Check,
  Image as ImageIcon,
  Lightbulb,
  MessageCircle,
  Phone,
  QrCode,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { MINI_FEATURES } from '../../lib/marketing-content';
import { BarGrow } from './motion';
import { Eyebrow, MockupFrame, Section, SectionHead } from './primitives';

function SerpMockup() {
  return (
    <MockupFrame label="Hasil pencarian Google" meta={<Search className="h-3 w-3 text-ink-3" />} bodyClassName="p-4 sm:p-5">
      <div className="rounded-xl border border-rule bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-2 text-[10px] font-bold text-ink">BJ</span>
          <div className="min-w-0">
            <p className="truncate text-xs text-ink">Bengkel Maju Jaya</p>
            <p className="serp-url truncate text-[11px]">pajangin.web.id/bengkel-maju-jaya</p>
          </div>
        </div>
        <p className="serp-link mt-2 text-[15px] font-medium leading-snug">
          Bengkel Maju Jaya — Bengkel &amp; Otomotif di Purwokerto
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          Servis AC, ganti oli, dan tune up ringan. Buka 08.00–17.00. Hubungi langsung via WhatsApp.
        </p>
      </div>
      <div className="mt-3 grid min-w-0 grid-cols-2 gap-2">
        {['Judul & deskripsi SEO', 'Schema.org LocalBusiness', 'Pratinjau saat dibagikan', 'URL publik yang rapi'].map((c) => (
          <span key={c} className="min-w-0 break-words rounded-lg border border-rule bg-paper px-3 py-2 text-[11px] text-ink-2">
            {c}
          </span>
        ))}
      </div>
    </MockupFrame>
  );
}

function WhatsAppMockup() {
  const tracked = [
    { label: 'whatsapp_click', value: 96 },
    { label: 'service_view', value: 214 },
    { label: 'phone_click', value: 32 },
  ];
  return (
    <MockupFrame label="Percakapan & pelacakan kontak" meta={<MessageCircle className="h-3 w-3 text-ink-3" />} bodyClassName="p-4 sm:p-5">
      <div className="space-y-2.5">
        <div className="flex justify-end">
          <p className="max-w-[82%] rounded-2xl rounded-br-sm bg-accent-soft px-3.5 py-2 text-xs leading-relaxed text-ink">
            Halo, masih buka? Mau servis AC hari ini.
          </p>
        </div>
        <div className="flex">
          <p className="max-w-[82%] rounded-2xl rounded-bl-sm bg-paper-2 px-3.5 py-2 text-xs leading-relaxed text-ink-2">
            Halo! Masih buka sampai 21.00. Boleh saya bantu jadwalkan?
          </p>
        </div>
        <p className="pt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Tercatat sebagai event</p>
      </div>
      <div className="mt-3 space-y-2">
        {tracked.map((t, i) => (
          <div key={t.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 font-mono text-[11px] text-ink-2">{t.label}</span>
            <BarGrow value={t.value / 2.6} className="h-1.5 flex-1" delay={0.1 + i * 0.1} />
            <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-ink-2">{t.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-3">
        <Phone className="h-3 w-3" /> Setiap klik kontak diatribusikan ke layanan terkait.
      </p>
    </MockupFrame>
  );
}

function AnalyticsMockup() {
  const funnel = [
    { label: 'Pengunjung', value: 100 },
    { label: 'Klik WhatsApp / telepon', value: 21 },
  ];
  return (
    <MockupFrame label="Dashboard · funnel & sumber trafik" meta={<BarChart3 className="h-3 w-3 text-ink-3" />} bodyClassName="space-y-4 p-4 sm:p-5">
      <div className="space-y-3">
        {funnel.map((f, i) => (
          <div key={f.label}>
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className="text-ink-2">{f.label}</span>
              <span className="tabular-nums text-ink-2">{f.value}%</span>
            </div>
            <BarGrow
              value={f.value}
              tone={i === funnel.length - 1 ? 'accent' : 'ink'}
              className="h-2.5"
              delay={i * 0.1}
            />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-rule bg-paper p-3">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Sumber kunjungan</p>
        <div className="space-y-2">
          {[
            ['Google Organik', 62],
            ['Instagram', 24],
            ['Langsung / link', 14],
          ].map(([label, value], i) => (
            <div key={label as string} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-[11px] text-ink-2">{label}</span>
              <BarGrow value={value as number} className="h-1.5 flex-1" delay={i * 0.1} />
              <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-ink-2">{value}%</span>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

function InsightMockup() {
  const items = [
    {
      tone: 'warning' as const,
      title: 'Servis AC ramai diklik, sedikit dihubungi',
      rec: 'Jadikan layanan unggulan dan perjelas kisaran harga.',
    },
    {
      tone: 'accent' as const,
      title: 'Ganti oli punya tingkat kontak tertinggi',
      rec: 'Pindahkan ke posisi teratas daftar layanan.',
    },
    {
      tone: 'positive' as const,
      title: 'Trafik dari Google mulai mendominasi',
      rec: 'Lengkapi deskripsi SEO untuk mempertahankan posisi.',
    },
  ];
  const tones = {
    warning: 'bg-warning-soft text-warning',
    accent: 'bg-accent-soft text-accent',
    positive: 'bg-positive-soft text-positive',
  };
  return (
    <MockupFrame label="Insight marketing" meta={<Lightbulb className="h-3 w-3 text-ink-3" />} bodyClassName="space-y-2.5 p-4 sm:p-5">
      {items.map((it) => (
        <div key={it.title} className="lift rounded-xl border border-rule bg-paper p-3.5">
          <div className="flex items-start gap-2.5">
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${tones[it.tone]}`}>
              <TrendingUp className="h-3 w-3" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold leading-snug text-ink">{it.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{it.rec}</p>
            </div>
          </div>
        </div>
      ))}
      <p className="text-[11px] text-ink-3">Rekomendasi dibuat dari aturan analitik aplikasi, bukan tebakan.</p>
    </MockupFrame>
  );
}

const MINI_ICONS = {
  ai: Sparkles,
  qr: QrCode,
  booking: CalendarCheck,
  galeri: ImageIcon,
} as const;

const FEATURES = [
  {
    id: 'public',
    eyebrow: 'Halaman publik + SEO',
    title: 'Satu halaman yang mewakili bisnis Anda.',
    desc: 'Bukan link bio seadanya. Halaman publik berisi layanan, harga, lokasi, dan jam buka — dengan struktur yang dikenali mesin pencari.',
    bullets: [
      'Judul & deskripsi SEO otomatis dari profil bisnis',
      'Schema.org LocalBusiness agar muncul sebagai hasil lokal',
      'Pratinjau rapi saat link dibagikan ke WhatsApp atau media sosial',
    ],
    Visual: SerpMockup,
  },
  {
    id: 'whatsapp',
    eyebrow: 'WhatsApp-first',
    title: 'Jalur kontak yang jelas, dan tercatat.',
    desc: 'Mayoritas pelanggan lokal memilih chat, bukan formulir. Setiap tombol kontak diarahkan ke WhatsApp, sementara setiap klik tercatat sebagai data.',
    bullets: [
      'Tombol WhatsApp menempel di layar ponsel pengunjung',
      'Klik WhatsApp, telepon, dan klik kartu layanan tercatat otomatis',
      'Klik diatribusikan ke layanan yang sedang dibuka',
    ],
    Visual: WhatsAppMockup,
  },
  {
    id: 'analytics',
    eyebrow: 'Analitik & funnel',
    title: 'Tahu dari mana pelanggan datang, dan di mana berhenti.',
    desc: 'Pengunjung, sumber trafik, dan tingkat konversi tersaji dalam satu layar — tanpa perlu memasang alat pihak ketiga.',
    bullets: [
      'Funnel dari kunjungan → klik kontak',
      'Distribusi sumber: Google, Instagram, TikTok, langsung',
      'Peringkat layanan berdasarkan klik layanan vs chat',
    ],
    Visual: AnalyticsMockup,
  },
  {
    id: 'insight',
    eyebrow: 'Insight engine',
    title: 'Rekomendasi yang bisa langsung dikerjakan.',
    desc: 'Sistem menandai layanan yang ramai diklik tetapi sepi chat, dan mengubah data menjadi langkah perbaikan yang konkret.',
    bullets: [
      'Deteksi layanan dengan gesekan (harga/CTA kurang jelas)',
      'Sorot layanan dengan jumlah kontak tertinggi',
      'Pantau ketergantungan pada satu saluran trafik',
    ],
    Visual: InsightMockup,
  },
] as const;

export function ProductShowcase() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const elements = itemRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (!current) return;
        const index = Number((current.target as HTMLElement).dataset.index);
        if (!Number.isNaN(index)) setActive(index);
      },
      { rootMargin: '-46% 0px -46% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <Section id="fitur" tone="ink">
      <SectionHead
        eyebrow="Produk"
        tone="ink"
        title="Tampil profesional, dihubungi, lalu diukur."
        desc="Empat bagian inti Pajangin — dibangun untuk usaha lokal yang mengandalkan WhatsApp, bukan toko online besar."
      />

      <div className="mt-16 grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
        <div className="relative min-w-0">
          <div aria-hidden className="absolute bottom-0 left-0 top-0 hidden w-px bg-ink-3 lg:block" />

          {FEATURES.map((feature, i) => {
            const Visual = feature.Visual;

            return (
              <div
                key={feature.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                data-index={i}
                className="relative flex min-w-0 flex-col justify-center border-b border-ink-3 py-10 last:border-b-0 lg:min-h-[48vh] lg:border-b-0 lg:py-16 lg:pl-8"
              >
                <span className={`font-mono text-xs ${active === i ? 'text-accent' : 'text-paper-5'}`}>0{i + 1}</span>
                <p className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-paper-4">{feature.eyebrow}</p>
                <h3 className="mt-4 max-w-xl font-display text-[clamp(1.8rem,3.2vw,2.9rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-paper [text-wrap:balance]">
                  {feature.title}
                </h3>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-paper-4">{feature.desc}</p>
                <ul className="mt-6 space-y-2.5">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5 text-sm leading-relaxed text-paper-4">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.2} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 min-w-0 lg:hidden">
                  <Visual />
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden min-w-0 lg:block">
          <div className="lg:sticky lg:top-28">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-paper-5">Pratinjau produk</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper-5">
                0{active + 1} / 0{FEATURES.length}
              </span>
            </div>

            <div className="relative min-h-[520px]">
              {FEATURES.map((feature, i) => {
                const Visual = feature.Visual;
                const isActive = i === active;

                return (
                  <motion.div
                    key={feature.id}
                    className={isActive ? 'relative' : 'pointer-events-none absolute inset-0'}
                    initial={false}
                    animate={
                      reduce
                        ? { opacity: isActive ? 1 : 0 }
                        : { opacity: isActive ? 1 : 0, y: isActive ? 0 : 14, scale: isActive ? 1 : 0.985 }
                    }
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    aria-hidden={!isActive}
                  >
                    <Visual />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 border-t border-ink-3 pt-10 sm:mt-20">
        <Eyebrow tone="inverse">Fitur pendukung</Eyebrow>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {MINI_FEATURES.map((f) => {
            const Icon = MINI_ICONS[f.key as keyof typeof MINI_ICONS];
            return (
              <div key={f.key} className="flex flex-col">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h4 className="mt-4 font-display text-lg font-semibold tracking-[-0.02em] text-paper">{f.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-paper-4">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
