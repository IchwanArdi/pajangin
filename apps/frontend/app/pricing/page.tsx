import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Image as ImageIcon, MessageCircle, Sparkles } from 'lucide-react';
import { MegaNav } from '../../components/marketing/MegaNav';
import { Faq } from '../../components/marketing/Faq';
import { FinalCta } from '../../components/marketing/FinalCta';
import { Footer } from '../../components/marketing/Footer';
import { Container, Eyebrow, Section } from '../../components/marketing/primitives';
import { PRICING_PLANS } from '../../lib/marketing-content';
import { DEFAULT_OG_IMAGE, SITE_NAME } from '../../lib/seo';

const TITLE = 'Gratis — Pajangin';
const DESCRIPTION =
  'Pajangin 100% gratis untuk usaha lokal: halaman publik, analitik, booking, QR & Link in Bio, dan AI Konten. Tanpa langganan.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/pricing',
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

const FAIR_USE = [
  {
    icon: Sparkles,
    title: 'AI Konten',
    description: 'Maksimal 20 generate per akun per hari. Jika habis, Anda tetap bisa menulis manual atau memakai contoh konten.',
  },
  {
    icon: ImageIcon,
    title: 'Galeri foto',
    description: 'Maksimal 24 foto per bisnis, masing-masing maksimal 5 MB. Hapus foto lama untuk memberi ruang foto baru.',
  },
  {
    icon: MessageCircle,
    title: 'Notifikasi WhatsApp',
    description: 'Maksimal 20 pesan otomatis per bisnis per hari. Notifikasi di dashboard tetap tersedia tanpa batas.',
  },
];

export default function PricingPage() {
  const plan = PRICING_PLANS[0];

  return (
    <div className="min-h-screen bg-surface text-ink">
      <MegaNav />
      <main>
        <section className="relative border-b border-rule">
          <Container className="relative py-16 sm:py-24">
            <Eyebrow>Harga</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-ink [overflow-wrap:anywhere] sm:text-5xl">
              Gratis untuk usaha lokal. Tanpa langganan.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-2">
              Semua fitur inti terbuka sekarang: halaman publik, layanan, galeri, booking, QR &amp; Link in Bio, analitik, dan AI Konten.
              Tidak ada paywall, tidak ada biaya tersembunyi.
            </p>
          </Container>
        </section>

        <Section bordered>
          <div className="mx-auto max-w-3xl rounded-3xl border border-accent bg-surface p-6 shadow-sm ring-1 ring-accent/20 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-ink">{plan.name}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{plan.tagline}</p>
              </div>
              <span className="rounded-full bg-positive-soft px-3 py-1 text-xs font-semibold text-positive">Aktif sekarang</span>
            </div>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-5xl font-semibold tracking-[-0.03em] text-ink">{plan.price}</span>
              <span className="text-sm text-ink-2">{plan.period}</span>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="press mt-8 inline-flex w-full items-center justify-center rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-accent-ink transition hover:opacity-90 sm:w-auto"
            >
              {plan.cta}
            </Link>
          </div>
        </Section>

        <Section>
          <div className="max-w-2xl">
            <Eyebrow>Batas wajar</Eyebrow>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-ink">Gratis, tapi tetap sehat untuk semua.</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              Batas ini menjaga biaya AI, penyimpanan foto, dan gateway WhatsApp. Tidak ada fitur yang dikunci—hanya kuota pemakaian yang wajar.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {FAIR_USE.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="lift rounded-2xl border border-rule bg-surface p-6">
                  <Icon className="h-5 w-5 text-accent" strokeWidth={1.75} />
                  <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.description}</p>
                </div>
              );
            })}
          </div>
        </Section>

        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
