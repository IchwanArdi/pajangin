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
      <div className="overflow-hidden rounded-xl border border-rule">
        <div className="h-14 bg-accent-soft" />
        <div className="flex items-center gap-3 p-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-[10px] font-bold text-paper">BM</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">Bengkel Makmur</p>
            <p className="truncate text-[11px] text-ink-2">Otomotif · Purwokerto · Buka 08.00–17.00</p>
          </div>
          <Anno n={1} />
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

      <div className="relative rounded-xl border border-dashed border-ink-3/40 p-3">
        <Anno n={3} className="absolute -top-2.5 right-3" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Galeri foto</p>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="aspect-square rounded-md border border-rule bg-paper-2" />
          ))}
        </div>
      </div>

      <div className="relative rounded-xl border border-dashed border-ink-3/40 p-3">
        <Anno n={4} className="absolute -top-2.5 right-3" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Testimoni pelanggan</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-3">“Ruang untuk ulasan asli dari pelanggan Anda.”</p>
      </div>

      <div className="relative rounded-xl border border-rule p-3">
        <Anno n={5} className="absolute -top-2.5 right-3" />
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">Booking / reservasi</p>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {['09.00', '10.00', '13.00', '15.00'].map((t) => (
            <span key={t} className="rounded-lg border border-rule px-2 py-1.5 text-center text-[11px] text-ink-2">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-accent-ink">
        <MessageCircle className="h-3.5 w-3.5" /> Hubungi via WhatsApp
        <Anno n={6} className="border-accent-ink/40 bg-transparent text-accent-ink" />
      </div>
    </MockupFrame>
  );
}

const ANATOMY = [
  'Identitas bisnis: logo, kategori, kota, dan jam buka.',
  'Layanan dengan harga — satu klik untuk melihat detail.',
  'Galeri foto: menu, hasil kerja, atau interior.',
  'Testimoni asli dari pelanggan sebagai bukti sosial.',
  'Booking opsional dengan pilihan tanggal dan jam.',
  'Tombol WhatsApp menempel di bawah layar ponsel.',
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
                title="Enam bagian yang membuat halaman siap jual."
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
                    href="/register"
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
