'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  GraduationCap,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  Sparkles,
  Star,
  Stethoscope,
  Utensils,
  Wrench,
} from 'lucide-react';
import type { Business, BusinessImageItem } from '../../lib/api';
import type { BusinessTemplate } from '../../lib/templates';
import { formatHour } from '../../lib/business-page';

export type OpenStatus = { open: boolean; start: number; end: number } | null;

type Highlight = { icon: typeof Clock; label: string; value: string };

interface Props {
  business: Business;
  template: BusinessTemplate;
  openStatus: OpenStatus;
  primaryCtaLabel: string;
  waLink: string;
  emergencyWaLink: string;
  images: BusinessImageItem[];
  serviceCount: number;
  onWhatsAppClick: (serviceId?: string, serviceName?: string) => void;
  onPhoneClick: () => void;
}

function highlightsFor(business: Business): Highlight[] {
  switch (business.template) {
    case 'restaurant':
      return [
        { icon: Utensils, label: 'Menu', value: 'Makanan & minuman' },
        { icon: Clock, label: 'Jam buka', value: business.opening_hours || 'Hubungi kami' },
        { icon: MapPin, label: 'Lokasi', value: business.city },
        { icon: MessageCircle, label: 'Pemesanan', value: 'Via WhatsApp' },
      ];
    case 'workshop':
      return [
        { icon: Wrench, label: 'Layanan', value: 'Servis & perbaikan' },
        { icon: Clock, label: 'Jam buka', value: business.opening_hours || 'Hubungi kami' },
        { icon: MapPin, label: 'Area layanan', value: business.service_area || business.city },
        { icon: Phone, label: 'Kontak', value: 'WhatsApp / telepon' },
      ];
    case 'salon':
      return [
        { icon: Sparkles, label: 'Layanan', value: 'Perawatan & treatment' },
        { icon: Clock, label: 'Jam buka', value: business.opening_hours || 'Hubungi kami' },
        { icon: MapPin, label: 'Lokasi', value: business.city },
        { icon: MessageCircle, label: 'Booking', value: 'Via WhatsApp' },
      ];
    case 'clinic':
      return [
        { icon: Stethoscope, label: 'Layanan', value: 'Konsultasi & pemeriksaan' },
        { icon: Clock, label: 'Jam praktik', value: business.opening_hours || 'Hubungi kami' },
        { icon: MapPin, label: 'Lokasi', value: business.city },
        { icon: Phone, label: 'Kontak', value: 'WhatsApp / telepon' },
      ];
    case 'retail':
      return [
        { icon: ShoppingBag, label: 'Katalog', value: 'Produk tersedia' },
        { icon: MapPin, label: 'Area kirim', value: business.service_area || business.city },
        { icon: Clock, label: 'Jam buka', value: business.opening_hours || 'Hubungi kami' },
        { icon: MessageCircle, label: 'Order', value: 'Via WhatsApp' },
      ];
    case 'education':
      // pendidikan memakai panel statistik, bukan strip info
      return [];
    default:
      return [
        { icon: Clock, label: 'Jam buka', value: business.opening_hours || 'Hubungi kami' },
        { icon: MapPin, label: 'Area layanan', value: business.service_area || business.city },
        { icon: Star, label: 'Rating', value: business.rating ? `${business.rating}/5` : 'Belum ada rating' },
        { icon: Check, label: 'Harga', value: business.price_range || 'Tanya harga' },
      ];
  }
}

/** Motif latar per kategori — dipakai terutama saat bisnis belum punya foto. */
function motifFor(templateId: string): string {
  switch (templateId) {
    case 'restaurant':
      return 'motif-warm';
    case 'salon':
      return 'motif-soft';
    case 'workshop':
      return 'motif-blueprint';
    case 'retail':
      return 'motif-stripes';
    case 'clinic':
      return 'motif-hairline';
    case 'education':
      return 'motif-blueprint';
    default:
      return 'motif-warm';
  }
}

function Monogram({ business, onDark = false }: { business: Business; onDark?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2">
      <span
        className={[
          'font-display text-[clamp(3.5rem,9vw,6rem)] font-bold leading-none tracking-[-0.04em]',
          onDark ? 'text-white' : 'text-ink/15',
        ].join(' ')}
      >
        {business.name.slice(0, 1).toUpperCase()}
      </span>
      <span
        className={[
          'font-mono text-[10px] font-medium uppercase tracking-[0.2em]',
          onDark ? 'text-white/60' : 'text-ink-3',
        ].join(' ')}
      >
        {business.category}
      </span>
    </div>
  );
}

function Kicker({ children, onDark = false, center = false }: { children: ReactNode; onDark?: boolean; center?: boolean }) {
  return (
    <p
      className={[
        'flex items-center gap-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em]',
        onDark ? 'text-white/70' : 'text-ink-2',
        center ? 'justify-center' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden className={['h-px w-5', onDark ? 'bg-white/50' : 'bg-accent'].join(' ')} />
      {children}
      {center ? <span aria-hidden className={['h-px w-5', onDark ? 'bg-white/50' : 'bg-accent'].join(' ')} /> : null}
    </p>
  );
}

function StatusChip({ openStatus, onDark = false }: { openStatus: OpenStatus; onDark?: boolean }) {
  if (!openStatus) return null;
  const text = openStatus.open
    ? `Buka · sampai ${formatHour(openStatus.end)}`
    : `Tutup · buka ${formatHour(openStatus.start)}`;

  if (onDark) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
        <span
          className={[
            'h-1.5 w-1.5 rounded-full',
            openStatus.open ? 'animate-pulse bg-positive motion-reduce:animate-none' : 'bg-negative',
          ].join(' ')}
        />
        {text}
      </span>
    );
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
        openStatus.open ? 'bg-positive-soft text-positive' : 'bg-negative-soft text-negative',
      ].join(' ')}
    >
      <span
        className={[
          'h-1.5 w-1.5 rounded-full',
          openStatus.open ? 'animate-pulse bg-positive motion-reduce:animate-none' : 'bg-negative',
        ].join(' ')}
      />
      {text}
    </span>
  );
}

function RatingChip({ business, onDark = false }: { business: Business; onDark?: boolean }) {
  if (!business.rating) return null;
  const reviews = business.review_count ? ` · ${business.review_count} ulasan` : '';
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
        onDark ? 'border border-white/25 bg-white/10 text-white backdrop-blur-sm' : 'border border-rule bg-paper text-ink',
      ].join(' ')}
    >
      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
      {business.rating}/5{reviews}
    </span>
  );
}

function CtaRow({
  business,
  label,
  waLink,
  onWhatsAppClick,
  onPhoneClick,
  shape = 'round',
  onDark = false,
  center = false,
}: {
  business: Business;
  label: string;
  waLink: string;
  onWhatsAppClick: () => void;
  onPhoneClick: () => void;
  shape?: 'round' | 'sharp';
  onDark?: boolean;
  center?: boolean;
}) {
  const radius = shape === 'round' ? 'rounded-full' : 'rounded-xl';
  const secondary = onDark
    ? 'border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
    : 'border border-rule bg-paper text-ink hover:bg-paper-2';

  return (
    <div className={['flex flex-col gap-3 sm:flex-row', center ? 'sm:justify-center' : ''].join(' ')}>
      {business.whatsapp && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onWhatsAppClick()}
          className={`press group inline-flex items-center justify-center gap-2 ${radius} bg-accent px-6 py-3.5 text-sm font-bold text-accent-ink shadow-pop hover:opacity-90`}
        >
          <MessageCircle className="h-4 w-4" />
          {label}
          <ArrowRight className="arrow-nudge h-4 w-4" />
        </a>
      )}
      {business.phone && (
        <a
          href={`tel:${business.phone}`}
          onClick={onPhoneClick}
          className={`press inline-flex items-center justify-center gap-2 ${radius} px-6 py-3.5 text-sm font-semibold ${secondary}`}
        >
          <Phone className="h-4 w-4" />
          Telepon
        </a>
      )}
    </div>
  );
}

function InfoStrip({ items, overlap = false }: { items: Highlight[]; overlap?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div
      className={[
        'grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-4',
        overlap ? 'relative z-10 -mt-9 shadow-pop' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="bg-paper p-4">
            <Icon className="h-4 w-4 text-accent" />
            <p className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-3">{item.label}</p>
            <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-ink">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}

function AddressOverlay({ business }: { business: Business }) {
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-black/30 p-4 text-white backdrop-blur-md">
      <p className="font-display text-sm font-semibold">{business.name}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/80">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="line-clamp-1">
          {business.address}, {business.city}
        </span>
      </p>
    </div>
  );
}

/** Catatan khusus per kategori (bengkel darurat / info pemesanan restoran). */
function TemplateNote({ business, emergencyWaLink }: { business: Business; emergencyWaLink: string }) {
  if (business.template === 'workshop') {
    return (
      <div className="mt-5 flex flex-col gap-3 rounded-xl border-2 border-ink bg-warning-soft p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Wrench className="h-4 w-4 shrink-0 text-ink" />
          <span className="text-sm font-semibold text-ink">Butuh servis cepat? Tanyakan ketersediaan hari ini.</span>
        </div>
        <a
          href={emergencyWaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="press shrink-0 rounded-lg bg-ink px-4 py-2 text-center text-xs font-bold text-paper hover:opacity-90"
        >
          Tanya Cepat
        </a>
      </div>
    );
  }

  if (business.template === 'restaurant') {
    return (
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-rule bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Utensils className="h-4 w-4 shrink-0 text-accent" />
          <span className="text-sm font-medium text-ink-2">
            Ingin pesan untuk dine-in atau takeaway? Lihat menu lalu tanyakan via WhatsApp.
          </span>
        </div>
        <a href="#layanan" className="press shrink-0 rounded-full bg-accent-soft px-4 py-2 text-center text-xs font-bold text-accent">
          Lihat Menu
        </a>
      </div>
    );
  }

  return null;
}

/** Blok foto dengan fallback motif kelas — tidak pernah tampak "tempat kosong". */
function PhotoBlock({
  business,
  motif,
  className = '',
  rounded = 'rounded-3xl',
}: {
  business: Business;
  motif: string;
  className?: string;
  rounded?: string;
}) {
  return (
    <div className={`relative overflow-hidden border border-rule bg-paper-2 ${rounded} ${className}`}>
      {business.hero_image_url ? (
        <Image
          src={business.hero_image_url}
          alt={business.name}
          width={1400}
          height={1000}
          unoptimized
          loading="eager"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center ${motif}`}>
          <Monogram business={business} />
        </div>
      )}
    </div>
  );
}

export default function SiteHero({
  business,
  template,
  openStatus,
  primaryCtaLabel,
  waLink,
  emergencyWaLink,
  images,
  serviceCount,
  onWhatsAppClick,
  onPhoneClick,
}: Props) {
  const highlights = highlightsFor(business);
  const motif = motifFor(business.template);
  const note = <TemplateNote business={business} emergencyWaLink={emergencyWaLink} />;
  const heroImage = business.hero_image_url;

  const ctaBase = {
    business,
    label: primaryCtaLabel,
    waLink,
    onWhatsAppClick,
    onPhoneClick,
  };

  /* ---------- KULINER: foto full-bleed + strip info mengapung ---------- */
  if (business.template === 'restaurant') {
    return (
      <section className="bg-paper">
        <div className="rise relative h-[58vh] max-h-[620px] min-h-[400px] w-full overflow-hidden">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={business.name}
              width={1920}
              height={1080}
              unoptimized
              loading="eager"
              className="kenburns absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className={`absolute inset-0 ${motif}`}>
              <Monogram business={business} />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto w-full max-w-6xl px-5 pb-8 md:pb-10">
              <p className="rise rise-d1 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
                {business.category} · {business.city}
              </p>
              <h1 className="rise rise-d2 font-display mt-3 max-w-3xl text-[clamp(2.2rem,1.4rem+3.4vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white [overflow-wrap:anywhere]">
                {business.name}
              </h1>
              {business.tagline && <p className="rise rise-d3 mt-3 max-w-xl text-base leading-relaxed text-white/85">{business.tagline}</p>}
              <div className="rise rise-d3 mt-5 flex flex-wrap items-center gap-2.5">
                <StatusChip openStatus={openStatus} onDark />
                <RatingChip business={business} onDark />
              </div>
              <div className="rise rise-d4 mt-6">
                <CtaRow {...ctaBase} onDark />
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-6xl px-5 pb-14 md:pb-20">
          <div className="rise rise-d4">
            <InfoStrip items={highlights} overlap />
          </div>
          {note ? <div className="rise rise-d5">{note}</div> : null}
        </div>
      </section>
    );
  }

  /* ---------- BENGKEL: industri tegas, foto berbingkai offset ---------- */
  if (business.template === 'workshop') {
    return (
      <section className="relative overflow-hidden bg-paper">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${motif} opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]`}
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-8 md:pb-20 md:pt-12">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            <div>
              <div className="rise">
                <span className="inline-flex items-center gap-2 rounded-md border-2 border-ink bg-paper px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-ink">
                  <Wrench className="h-3.5 w-3.5 text-accent" />
                  {template.badge}
                </span>
              </div>
              <h1 className="rise rise-d1 font-display mt-5 text-[clamp(2rem,1.3rem+2.8vw,3.3rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.01em] text-ink [overflow-wrap:anywhere]">
                {business.name}
              </h1>
              {business.tagline && <p className="rise rise-d2 mt-4 text-lg font-medium leading-snug text-ink">{business.tagline}</p>}
              {business.description && (
                <p className="rise rise-d2 mt-2 max-w-xl text-[15px] leading-relaxed text-ink-2">{business.description}</p>
              )}
              <div className="rise rise-d3 mt-6 flex flex-wrap items-center gap-2.5">
                <StatusChip openStatus={openStatus} />
                {business.price_range && (
                  <span className="inline-flex items-center rounded-md border border-rule bg-paper-2 px-3 py-1.5 font-mono text-[11px] font-semibold text-ink">
                    {business.price_range}
                  </span>
                )}
              </div>
              <div className="rise rise-d4 mt-7">
                <CtaRow {...ctaBase} shape="sharp" />
              </div>
              {note ? <div className="rise rise-d5">{note}</div> : null}
            </div>
            <div className="rise rise-d4">
              <div className="overflow-hidden rounded-2xl border-2 border-ink bg-paper-2 shadow-[8px_8px_0_0_var(--color-ink)]">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={business.name}
                    width={1400}
                    height={1000}
                    unoptimized
                    loading="eager"
                    className="h-64 w-full object-cover md:h-[440px]"
                  />
                ) : (
                  <div className={`flex h-64 w-full items-center justify-center md:h-[440px] ${motif}`}>
                    <Monogram business={business} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="rise rise-d5 mt-10 md:mt-12">
            <InfoStrip items={highlights} />
          </div>
        </div>
      </section>
    );
  }

  /* ---------- SALON: tipografi besar + foto lembut ---------- */
  if (business.template === 'salon') {
    return (
      <section className="relative overflow-hidden bg-paper">
        <div aria-hidden className={`pointer-events-none absolute inset-0 ${motif} opacity-80`} />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-8 md:pb-24 md:pt-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="rise flex justify-center">
              <Kicker center>
                {business.category} · {business.city}
              </Kicker>
            </div>
            <h1 className="rise rise-d1 font-display mt-4 text-[clamp(2.2rem,1.4rem+3.2vw,3.7rem)] font-[560] leading-[1.05] tracking-[-0.03em] text-ink [overflow-wrap:anywhere]">
              {business.name}
            </h1>
            {business.tagline && (
              <p className="rise rise-d2 mx-auto mt-4 max-w-xl text-lg leading-relaxed text-ink-2">{business.tagline}</p>
            )}
            <div className="rise rise-d3 mt-5 flex flex-wrap items-center justify-center gap-2.5">
              <StatusChip openStatus={openStatus} />
              <RatingChip business={business} />
            </div>
            <div className="rise rise-d4 mt-7 flex justify-center">
              <CtaRow {...ctaBase} center />
            </div>
          </div>
          <div className="rise rise-d4 relative mt-10 md:mt-14">
            <PhotoBlock business={business} motif={motif} rounded="rounded-[2.5rem]" className="h-64 shadow-pop md:h-[460px]" />
            <AddressOverlay business={business} />
          </div>
          {note ? <div className="rise rise-d5 mx-auto mt-6 max-w-3xl">{note}</div> : null}
          <div className="rise rise-d5 mt-10 md:mt-12">
            <InfoStrip items={highlights} />
          </div>
        </div>
      </section>
    );
  }

  /* ---------- KLINIK: editorial bersih + kartu jam praktik ---------- */
  if (business.template === 'clinic') {
    return (
      <section className="relative overflow-hidden bg-paper">
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${motif} opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]`}
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-8 md:pb-20 md:pt-12">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            <div>
              <div className="rise">
                <Kicker>
                  {template.badge} · {business.city}
                </Kicker>
              </div>
              <h1 className="rise rise-d1 font-display mt-4 text-[clamp(2rem,1.3rem+2.7vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink [overflow-wrap:anywhere]">
                {business.name}
              </h1>
              {business.tagline && <p className="rise rise-d2 mt-4 text-lg font-medium leading-snug text-ink">{business.tagline}</p>}
              {business.description && (
                <p className="rise rise-d2 mt-2 max-w-xl text-[15px] leading-relaxed text-ink-2">{business.description}</p>
              )}
              <div className="rise rise-d3 mt-6 flex flex-wrap items-center gap-2.5">
                <StatusChip openStatus={openStatus} />
                <RatingChip business={business} />
              </div>
              <div className="rise rise-d4 mt-7">
                <CtaRow {...ctaBase} shape="sharp" />
              </div>
              {note ? <div className="rise rise-d5">{note}</div> : null}
            </div>
            <div className="rise rise-d4 relative">
              <PhotoBlock business={business} motif={motif} rounded="rounded-[2rem]" className="h-72 md:h-[440px]" />
              <div className="absolute -bottom-5 left-5 max-w-[17rem] rounded-2xl border border-rule bg-paper/95 p-4 shadow-pop backdrop-blur">
                {openStatus ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span
                      className={[
                        'h-2 w-2 rounded-full',
                        openStatus.open ? 'animate-pulse bg-positive motion-reduce:animate-none' : 'bg-negative',
                      ].join(' ')}
                    />
                    {openStatus.open ? 'Sedang buka' : 'Sedang tutup'}
                  </p>
                ) : null}
                <p className="mt-1 text-xs leading-relaxed text-ink-2">{business.opening_hours || 'Jam praktik: hubungi kami'}</p>
              </div>
            </div>
          </div>
          <div className="rise rise-d5 mt-14">
            <InfoStrip items={highlights} />
          </div>
        </div>
      </section>
    );
  }

  /* ---------- TOKO: kolase produk ---------- */
  if (business.template === 'retail') {
    const collage = [heroImage, ...images.map((image) => image.url)].filter(Boolean).slice(0, 3) as string[];
    return (
      <section className="bg-paper">
        <div className="mx-auto w-full max-w-6xl px-5 pb-14 pt-8 md:pb-20 md:pt-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14">
            <div>
              <div className="rise">
                <Kicker>
                  {template.badge} · {business.city}
                </Kicker>
              </div>
              <h1 className="rise rise-d1 font-display mt-4 text-[clamp(2rem,1.3rem+2.7vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink [overflow-wrap:anywhere]">
                {business.name}
              </h1>
              {business.tagline && <p className="rise rise-d2 mt-4 text-lg font-medium leading-snug text-ink">{business.tagline}</p>}
              {business.description && (
                <p className="rise rise-d2 mt-2 max-w-xl text-[15px] leading-relaxed text-ink-2">{business.description}</p>
              )}
              <div className="rise rise-d3 mt-6 flex flex-wrap items-center gap-2.5">
                <StatusChip openStatus={openStatus} />
                {business.service_area && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper px-3 py-1.5 text-xs font-medium text-ink-2">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    Kirim ke {business.service_area}
                  </span>
                )}
              </div>
              <div className="rise rise-d4 mt-7">
                <CtaRow {...ctaBase} />
              </div>
              {note ? <div className="rise rise-d5">{note}</div> : null}
            </div>
            <div className="rise rise-d4 grid grid-cols-3 gap-3">
              <div className="col-span-2 overflow-hidden rounded-3xl border border-rule bg-paper-2">
                {collage[0] ? (
                  <Image
                    src={collage[0]}
                    alt={business.name}
                    width={1200}
                    height={1500}
                    unoptimized
                    loading="eager"
                    className="h-64 w-full object-cover md:h-[430px]"
                  />
                ) : (
                  <div className={`flex h-64 w-full items-center justify-center md:h-[430px] ${motif}`}>
                    <Monogram business={business} />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {[collage[1], collage[2]].map((url, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-2xl border border-rule bg-paper-2">
                    {url ? (
                      <Image
                        src={url}
                        alt={`${business.name} — foto ${index + 2}`}
                        width={600}
                        height={600}
                        unoptimized
                        loading="eager"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`h-full w-full ${motif}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rise rise-d5 mt-10 md:mt-12">
            <InfoStrip items={highlights} />
          </div>
        </div>
      </section>
    );
  }

  /* ---------- PENDIDIKAN: panel statistik ---------- */
  if (business.template === 'education') {
    const stats = [
      ...(serviceCount > 0 ? [{ icon: GraduationCap, label: 'Program', value: `${serviceCount} kelas & program` }] : []),
      ...(business.rating ? [{ icon: Star, label: 'Rating', value: `${business.rating}/5` }] : []),
      { icon: Clock, label: 'Jadwal', value: business.opening_hours || 'Hubungi kami' },
      { icon: MapPin, label: 'Lokasi', value: business.city },
    ].slice(0, 4);

    return (
      <section className="bg-paper">
        <div className="mx-auto w-full max-w-6xl px-5 pb-14 pt-8 md:pb-20 md:pt-12">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            <div>
              <div className="rise">
                <Kicker>
                  {template.badge} · {business.city}
                </Kicker>
              </div>
              <h1 className="rise rise-d1 font-display mt-4 text-[clamp(2rem,1.3rem+2.7vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink [overflow-wrap:anywhere]">
                {business.name}
              </h1>
              {business.tagline && <p className="rise rise-d2 mt-4 text-lg font-medium leading-snug text-ink">{business.tagline}</p>}
              {business.description && (
                <p className="rise rise-d2 mt-2 max-w-xl text-[15px] leading-relaxed text-ink-2">{business.description}</p>
              )}
              <div className="rise rise-d3 mt-6 flex flex-wrap items-center gap-2.5">
                <StatusChip openStatus={openStatus} />
              </div>
              <div className="rise rise-d4 mt-7">
                <CtaRow {...ctaBase} />
              </div>
              {note ? <div className="rise rise-d5">{note}</div> : null}
            </div>
            <div className="rise rise-d4 grid grid-cols-2 gap-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-2xl border border-rule bg-paper-2 p-5">
                    <Icon className="h-4 w-4 text-accent" />
                    <p className="mt-3 font-display text-xl font-bold tracking-[-0.02em] text-ink [overflow-wrap:anywhere]">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- DEFAULT (template lain): split bersih ---------- */
  return (
    <section className="bg-paper">
      <div className="mx-auto w-full max-w-6xl px-5 pb-14 pt-8 md:pb-20 md:pt-12">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div>
            <div className="rise flex flex-wrap items-center gap-2.5">
              <StatusChip openStatus={openStatus} />
              <RatingChip business={business} />
            </div>
            <h1 className="rise rise-d1 font-display mt-5 text-[clamp(2rem,1.3rem+2.7vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink [overflow-wrap:anywhere]">
              {business.name}
            </h1>
            {business.tagline && <p className="rise rise-d2 mt-4 text-lg font-medium leading-snug text-ink">{business.tagline}</p>}
            {business.description && (
              <p className="rise rise-d2 mt-2 max-w-xl text-[15px] leading-relaxed text-ink-2">{business.description}</p>
            )}
            <div className="rise rise-d3 mt-7">
              <CtaRow {...ctaBase} />
            </div>
            {note ? <div className="rise rise-d4">{note}</div> : null}
          </div>
          <div className="rise rise-d4">
            <PhotoBlock business={business} motif={motif} rounded="rounded-[2rem]" className="h-64 shadow-pop md:h-[420px]" />
          </div>
        </div>
        <div className="rise rise-d5 mt-10 md:mt-12">
          <InfoStrip items={highlights} />
        </div>
      </div>
    </section>
  );
}
