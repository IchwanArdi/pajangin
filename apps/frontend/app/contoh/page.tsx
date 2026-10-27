import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, MessageCircle } from 'lucide-react';
import { MegaNav } from '../../components/marketing/MegaNav';
import { TemplateWire } from '../../components/marketing/Templates';
import { FinalCta } from '../../components/marketing/FinalCta';
import { Footer } from '../../components/marketing/Footer';
import { Container, Eyebrow, MockupFrame, Section, SectionHead } from '../../components/marketing/primitives';
import { BUSINESS_TEMPLATES } from '../../lib/templates';
import { DEFAULT_OG_IMAGE, SITE_NAME } from '../../lib/seo';

const TITLE = 'Contoh tampilan — Pajangin';
const DESCRIPTION =
  'Galeri template per kategori usaha dan anatomi halaman publik Pajangin: layanan, galeri, testimoni, booking, dan tombol WhatsApp.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/contoh' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/contoh',
    siteName: SITE_NAME,
    locale: 'id_ID',
    type: 'website',
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

function Anno({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border border-accent/40 bg-surface font-mono text-[10px] font-semibold text-accent ${className}`}
    >
      {n}
    </span>
  );
}

function AnatomyMockup() {
  return (
    <MockupFrame label="Anatomi halaman publik" meta={<span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">pratinjau</span>} bodyClassName="space-y-3 p-4">
      <div className="relative overflow-hidden rounded-xl border border-rule">
        <Anno n={1} className="absolute right-2 top-2 z-10" />
        <div className="flex items-center gap-2.5 border-b border-rule p-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-[10px] font-bold text-paper">BM</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-ink">Bengkel Maju Jaya</p>
            <p className="truncate text-[10px] text-ink-2">Otomotif · Purwokerto · Buka 08.00–17.00</p>
          </div>
        </div>
        <div className="relative h-20 overflow-hidden bg-ink p-3">
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{ background: 'radial-gradient(120% 120% at 20% 0%, var(--color-accent), transparent 60%)' }}
          />
          <div className="relative flex h-full flex-col justify-end">
            <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/50">Bengkel · Purwokerto</p>
            <p className="font-display mt-0.5 text-sm font-semibold text-white">Servis rapi, harga jelas.</p>
            <div className="mt-1.5 flex gap-1.5">
              <span className="h-3.5 w-16 rounded-full bg-accent" />
              <span className="h-3.5 w-10 rounded-full border border-white/40" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative rounded-xl border border-rule p-3">
        <Anno n={2} className="absolute -top-2.5 right-3" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Layanan &amp; harga</p>
        <div className="mt-2 space-y-1.5">
          {[
            ['Ganti oli', 'Rp 50.000'],
            ['Tune up', 'Rp 150.000'],
            ['Servis AC', 'Rp 175.000'],
          ].map(([n, p]) => (
            <div key={n} className="flex items-center justify-between rounded-lg border border-rule bg-paper px-3 py-2 text-xs">
              <span className="text-ink">{n}</span>
              <span className="tabular-nums text-ink-2">{p}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative rounded-xl border border-rule p-3">
        <Anno n={3} className="absolute -top-2.5 right-3" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Galeri bento</p>
        <div className="mt-2 grid h-20 grid-cols-3 grid-rows-2 gap-1.5">
          <span className="col-span-2 row-span-2 rounded-md border border-rule bg-paper-2" />
          <span className="rounded-md border border-rule bg-accent-soft" />
          <span className="rounded-md border border-rule bg-paper-2" />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-ink p-3 text-paper">
        <Anno n={4} className="absolute right-3 top-3" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50">Testimoni pelanggan</p>
        <p className="font-display mt-1 text-xl leading-none text-accent">“</p>
        <p className="mt-1 text-[11px] leading-relaxed text-paper/80">Pengerjaan cepat, hasil rapi. Pasti kembali lagi.</p>
        <p className="mt-1.5 text-[9px] text-paper/45">Rina · ★ 5/5</p>
      </div>

      <div className="relative rounded-xl border border-rule p-3">
        <Anno n={5} className="absolute -top-2.5 right-3" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Pertanyaan umum</p>
        <div className="mt-2 border-t border-rule">
          {['Bisa booking hari ini?', 'Berapa lama pengerjaan?'].map((q) => (
            <div key={q} className="flex items-center justify-between border-b border-rule py-2 text-[11px] text-ink-2">
              <span>{q}</span>
              <span className="text-ink-3">+</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative rounded-xl border border-rule p-3">
        <Anno n={6} className="absolute -top-2.5 right-3" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Lokasi &amp; peta</p>
        <div className="relative mt-2 h-20 overflow-hidden rounded-lg border border-rule bg-paper-2">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(var(--color-rule) 1px, transparent 1.5px)',
              backgroundSize: '12px 12px',
            }}
          />
          <div className="absolute bottom-1.5 left-1.5 right-10 rounded-md border border-rule bg-surface/95 p-1.5">
            <p className="text-[9px] font-semibold text-ink">Jl. Contoh No. 12</p>
            <span className="mt-1 inline-block rounded-full bg-ink px-1.5 py-0.5 text-[7px] font-semibold text-paper">Salin alamat</span>
          </div>
        </div>
      </div>

      <div className="relative rounded-xl border border-rule p-3">
        <Anno n={7} className="absolute -top-2.5 right-3" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Booking &amp; WhatsApp</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <span className="h-6 rounded-md border border-rule bg-paper-2" />
          <span className="h-6 rounded-md border border-rule bg-paper-2" />
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1.5 rounded-full bg-accent px-3 py-2 text-[10px] font-semibold text-accent-ink">
          <MessageCircle className="h-3 w-3" /> Hubungi via WhatsApp
        </div>
      </div>
    </MockupFrame>
  );
}

const ANATOMY = [
  'Hero & identitas: nama, kategori, status buka, dan tombol WhatsApp.',
  'Layanan & harga — tata letak mengikuti jenis usaha.',
  'Galeri bento dengan filter kategori dan lightbox.',
  'Tentang & testimoni asli dalam band gelap sebagai bukti sosial.',
  'FAQ bergaris untuk menjawab keberatan umum.',
  'Lokasi: peta besar, tombol Maps, dan salin alamat.',
  'Booking opsional + tombol WhatsApp menempel di layar ponsel.',
];

export default function ContohPage() {
  const templates = Object.values(BUSINESS_TEMPLATES);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <MegaNav />
      <main>
        <section className="relative border-b border-rule">
          <Container className="relative py-16 sm:py-24">
            <Eyebrow>Contoh tampilan</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-ink [overflow-wrap:anywhere] sm:text-5xl">
              Lihat bagaimana halaman Anda akan terlihat.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-2">
              Berikut anatomi halaman publik dan pilihan template yang menyesuaikan kategori usaha. Visual di bawah adalah pratinjau
              template, bukan halaman bisnis nyata.
            </p>
          </Container>
        </section>

        <Section bordered>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
            <div className="lg:sticky lg:top-24">
              <SectionHead
                eyebrow="Anatomi halaman"
                title="Tujuh bagian yang membuat halaman siap jual."
                desc="Setiap bagian diambil dari data profil bisnis Anda — tidak perlu menyusun tata letak dari awal."
              />
              <ol className="mt-8 space-y-3">
                {ANATOMY.map((a, i) => (
                  <li key={a} className="flex items-start gap-3 text-sm text-ink">
                    <Anno n={i + 1} />
                    <span className="pt-0.5 leading-relaxed text-ink-2">{a}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="min-w-0">
              <AnatomyMockup />
            </div>
          </div>
        </Section>

        <Section bordered>
          <SectionHead
            eyebrow="Galeri template"
            title="Tujuh template untuk tujuh karakter usaha."
            desc="Pilih yang paling dekat dengan bidang Anda, lalu sesuaikan warna aksennya agar sesuai identitas bisnis."
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <figure key={t.id} className="lift flex h-full flex-col rounded-2xl border border-rule bg-surface p-4">
                <TemplateWire t={t} />
                <figcaption className="mt-4 flex flex-1 flex-col">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">{t.badge}</span>
                  <h3 className="mt-1.5 text-[15px] font-semibold text-ink">{t.name}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-2">{t.description}</p>
                  <ul className="mt-3 space-y-1.5">
                    {t.features.slice(0, 3).map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-ink-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/login"
                    className="mt-4 inline-flex items-center justify-center whitespace-nowrap rounded-full border border-rule bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper-2 active:translate-y-px"
                  >
                    Pakai template ini
                  </Link>
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>

        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
