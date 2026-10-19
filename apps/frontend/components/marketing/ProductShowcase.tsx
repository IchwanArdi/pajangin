import type { ReactNode } from 'react';
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
import { Reveal } from '../../app/reveal';
import { BarGrow } from './motion';
import { Eyebrow, MockupFrame, Section, SectionHead } from './primitives';

function Row({
  eyebrow,
  title,
  desc,
  bullets,
  reverse = false,
  children,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  bullets: string[];
  reverse?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
      <div className={reverse ? 'lg:order-2' : ''}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.022em] text-ink [overflow-wrap:anywhere] sm:text-3xl">{title}</h3>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{desc}</p>
        <ul className="mt-5 space-y-2.5">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-ink">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function SerpMockup() {
  return (
    <MockupFrame label="Hasil pencarian Google" meta={<Search className="h-3 w-3 text-ink-3" />} bodyClassName="p-4 sm:p-5">
      <div className="rounded-xl border border-rule bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-paper-2 text-[10px] font-bold text-ink">KP</span>
          <div className="min-w-0">
            <p className="truncate text-xs text-ink">Kopi Pagi</p>
            <p className="serp-url truncate text-[11px]">pajangin.web.id/kopi-pagi</p>
          </div>
        </div>
        <p className="serp-link mt-2 text-[15px] font-medium leading-snug">
          Kopi Pagi — Kedai Kopi &amp; Cafe di Purwokerto
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-2">
          Espresso, manual brew, dan roti bakar. Buka 07.00–22.00. Hubungi langsung via WhatsApp.
        </p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {['Judul & deskripsi SEO', 'Schema.org LocalBusiness', 'Pratinjau saat dibagikan', 'URL publik yang rapi'].map((c) => (
          <span key={c} className="rounded-lg border border-rule bg-paper px-3 py-2 text-[11px] text-ink-2">
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
      <p className="text-[11px] text-ink-3">Angka di atas adalah contoh tampilan antarmuka, bukan data nyata.</p>
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

export function ProductShowcase() {
  return (
    <Section id="fitur" bordered tone="paper-2">
      <SectionHead
        eyebrow="Produk"
        title="Tampil profesional, dihubungi, lalu diukur."
        desc="Empat bagian inti Pajangin — dibangun untuk usaha lokal yang mengandalkan WhatsApp, bukan toko online besar."
      />

      <div className="mt-14 space-y-16 sm:space-y-24">
        <Row
          eyebrow="Halaman publik + SEO"
          title="Satu halaman yang mewakili bisnis Anda."
          desc="Bukan link bio seadanya. Halaman publik berisi layanan, harga, lokasi, dan jam buka — dengan struktur yang dikenali mesin pencari."
          bullets={[
            'Judul & deskripsi SEO otomatis dari profil bisnis',
            'Schema.org LocalBusiness agar muncul sebagai hasil lokal',
            'Pratinjau rapi saat link dibagikan ke WhatsApp atau media sosial',
          ]}
        >
          <SerpMockup />
        </Row>

        <Row
          reverse
          eyebrow="WhatsApp-first"
          title="Jalur kontak yang jelas, dan tercatat."
          desc="Mayoritas pelanggan lokal memilih chat, bukan formulir. Setiap tombol kontak diarahkan ke WhatsApp, sementara setiap klik tercatat sebagai data."
          bullets={[
            'Tombol WhatsApp menempel di layar ponsel pengunjung',
            'Klik WhatsApp, telepon, dan klik kartu layanan tercatat otomatis',
            'Klik diatribusikan ke layanan yang sedang dibuka',
          ]}
        >
          <WhatsAppMockup />
        </Row>

        <Row
          eyebrow="Analitik & funnel"
          title="Tahu dari mana pelanggan datang, dan di mana berhenti."
          desc="Pengunjung, sumber trafik, dan tingkat konversi tersaji dalam satu layar — tanpa perlu memasang alat pihak ketiga."
          bullets={[
            'Funnel dari kunjungan → klik kontak',
            'Distribusi sumber: Google, Instagram, TikTok, langsung',
            'Peringkat layanan berdasarkan klik layanan vs chat',
          ]}
        >
          <AnalyticsMockup />
        </Row>

        <Row
          reverse
          eyebrow="Insight engine"
          title="Rekomendasi yang bisa langsung dikerjakan."
          desc="Sistem menandai layanan yang ramai diklik tetapi sepi chat, dan mengubah data menjadi langkah perbaikan yang konkret."
          bullets={[
            'Deteksi layanan dengan gesekan (harga/CTA kurang jelas)',
            'Sorot layanan dengan jumlah kontak tertinggi',
            'Pantau ketergantungan pada satu saluran trafik',
          ]}
        >
          <InsightMockup />
        </Row>
      </div>

      <div className="mt-16 sm:mt-20">
        <div className="flex items-center gap-3">
          <Eyebrow>Fitur pendukung</Eyebrow>
        </div>
        <Reveal className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MINI_FEATURES.map((f) => {
            const Icon = MINI_ICONS[f.key as keyof typeof MINI_ICONS];
            return (
              <div key={f.key} className="lift h-full rounded-2xl border border-rule bg-surface p-5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h4 className="mt-4 text-[15px] font-semibold text-ink">{f.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{f.desc}</p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </Section>
  );
}
