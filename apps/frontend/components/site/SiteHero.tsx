'use client';

import Image from 'next/image';
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
import type { Business } from '../../lib/api';
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
  onWhatsAppClick: (serviceId?: string, serviceName?: string) => void;
  onPhoneClick: () => void;
}

function highlightsFor(business: Business): Highlight[] {
  switch (business.template) {
    case 'restaurant':
      return [
        { icon: Utensils, label: 'Menu', value: 'Makanan & minuman' },
        { icon: Clock, label: 'Jam buka', value: business.opening_hours || 'Hubungi kami' },
        { icon: Star, label: 'Rating', value: business.rating ? `${business.rating}/5` : 'Belum ada rating' },
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
        { icon: Clock, label: 'Jam buka', value: business.opening_hours || 'Hubungi kami' },
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
      return [
        { icon: GraduationCap, label: 'Program', value: 'Kelas & pelatihan' },
        { icon: Clock, label: 'Jadwal', value: business.opening_hours || 'Hubungi kami' },
        { icon: MapPin, label: 'Lokasi', value: business.city },
        { icon: MessageCircle, label: 'Konsultasi', value: 'Via WhatsApp' },
      ];
    default:
      return [
        { icon: Clock, label: 'Jam buka', value: business.opening_hours || 'Hubungi kami' },
        { icon: MapPin, label: 'Area layanan', value: business.service_area || business.city },
        { icon: Star, label: 'Rating', value: business.rating ? `${business.rating}/5` : 'Belum ada rating' },
        { icon: Check, label: 'Harga', value: business.price_range || 'Tanya harga' },
      ];
  }
}

function Badges({ business, badge, openStatus }: { business: Business; badge: string; openStatus: OpenStatus }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-ink shadow-xs">{badge}</span>
      <span className="rounded-full border border-rule bg-paper px-3 py-1 text-xs font-medium text-ink-2">{business.category}</span>
      <span className="rounded-full border border-rule bg-paper px-3 py-1 text-xs font-medium text-ink-2">{business.city}</span>
      {openStatus && (
        <span
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            openStatus.open ? 'bg-positive-soft text-positive' : 'bg-negative-soft text-negative',
          ].join(' ')}
        >
          <span className={['h-1.5 w-1.5 rounded-full', openStatus.open ? 'bg-positive' : 'bg-negative'].join(' ')} />
          {openStatus.open ? `Buka · sampai ${formatHour(openStatus.end)}` : `Tutup · buka ${formatHour(openStatus.start)}`}
        </span>
      )}
    </div>
  );
}

function Ctas({
  business,
  primaryCtaLabel,
  waLink,
  onWhatsAppClick,
  onPhoneClick,
  align = 'left',
}: Pick<Props, 'business' | 'primaryCtaLabel' | 'waLink' | 'onWhatsAppClick' | 'onPhoneClick'> & {
  align?: 'left' | 'center';
}) {
  return (
    <div className={['flex flex-col gap-3 sm:flex-row', align === 'center' ? 'sm:justify-center' : ''].join(' ')}>
      {business.whatsapp && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onWhatsAppClick()}
          className="press group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-accent-ink shadow-md hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" />
          {primaryCtaLabel}
          <ArrowRight className="arrow-nudge h-4 w-4" />
        </a>
      )}
      {business.phone && (
        <a
          href={`tel:${business.phone}`}
          onClick={onPhoneClick}
          className="press inline-flex items-center justify-center gap-2 rounded-full border border-rule bg-paper px-6 py-3.5 text-sm font-semibold text-ink hover:bg-paper-2"
        >
          <Phone className="h-4 w-4" />
          Telepon Sekarang
        </a>
      )}
    </div>
  );
}

/** Catatan khusus per kategori (bengkel darurat / informasi reservasi restoran). */
function TemplateNote({ business, emergencyWaLink }: { business: Business; emergencyWaLink: string }) {
  if (business.template === 'workshop') {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Wrench className="h-4 w-4 shrink-0 text-accent" />
          <span className="text-xs font-semibold text-ink">Butuh servis cepat? Tanyakan ketersediaan hari ini.</span>
        </div>
        <a
          href={emergencyWaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="press shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-center text-xs font-bold text-accent-ink hover:opacity-90"
        >
          Tanya Cepat
        </a>
      </div>
    );
  }

  if (business.template === 'restaurant') {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-accent/30 bg-accent-soft p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Utensils className="h-4 w-4 shrink-0 text-accent" />
          <span className="text-xs font-semibold text-ink">Ingin pesan untuk dine-in atau takeaway? Lihat menu lalu tanyakan via WhatsApp.</span>
        </div>
        <a
          href="#layanan"
          className="press shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-center text-xs font-bold text-accent-ink hover:opacity-90"
        >
          Lihat Menu
        </a>
      </div>
    );
  }

  return null;
}

function Highlights({ items, layout, center = false }: { items: Highlight[]; layout: 'cards' | 'strip'; center?: boolean }) {
  if (layout === 'strip') {
    // gap-px di atas latar `rule` → pemisah hairline tanpa logika border per-sel
    return (
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="bg-paper p-4">
              <Icon className="mb-2 h-4 w-4 text-accent" />
              <p className="text-xs text-ink-2">{item.label}</p>
              <p className="line-clamp-1 text-sm font-semibold text-ink">{item.value}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={['grid grid-cols-2 gap-3 sm:grid-cols-4', center ? 'mx-auto' : ''].join(' ')}>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="lift rounded-2xl border border-rule bg-paper-2 p-4">
            <Icon className="mb-2 h-4 w-4 text-accent" />
            <p className="text-xs text-ink-2">{item.label}</p>
            <p className="line-clamp-1 text-sm font-semibold text-ink">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
}

function Media({
  business,
  className = '',
  rounded = 'rounded-2xl',
}: {
  business: Business;
  className?: string;
  rounded?: string;
}) {
  return (
    <div className={`overflow-hidden border border-rule bg-paper-2 ${rounded} ${className}`}>
      {business.hero_image_url ? (
        <Image src={business.hero_image_url} alt={business.name} width={1400} height={1000} unoptimized className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-paper-2 to-paper">
          <div className="text-center">
            <p className="text-5xl font-bold text-accent">{business.name.slice(0, 1).toUpperCase()}</p>
            <p className="mt-2 text-sm text-ink-2">{business.category}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function AddressOverlay({ business }: { business: Business }) {
  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-black/35 p-4 text-white backdrop-blur-sm">
      <p className="text-sm font-semibold">{business.name}</p>
      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/80">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="line-clamp-1">
          {business.address}, {business.city}
        </span>
      </p>
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
  onWhatsAppClick,
  onPhoneClick,
}: Props) {
  const highlights = highlightsFor(business);
  const variant = template.heroStyle;
  const note = <TemplateNote business={business} emergencyWaLink={emergencyWaLink} />;
  const cta = (
    <Ctas
      business={business}
      primaryCtaLabel={primaryCtaLabel}
      waLink={waLink}
      onWhatsAppClick={onWhatsAppClick}
      onPhoneClick={onPhoneClick}
      align={variant === 'centered' ? 'center' : 'left'}
    />
  );

  const heading = (
    <>
      <h1 className="text-[clamp(2rem,1.4rem+2.6vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">{business.name}</h1>
      {business.tagline && <p className="mt-4 text-lg font-medium leading-relaxed text-ink">{business.tagline}</p>}
      {business.description && <p className="mt-3 text-base leading-relaxed text-ink-2">{business.description}</p>}
    </>
  );

  return (
    <section className="bg-paper pt-8 pb-12 md:pt-12 md:pb-16">
      <div className="mx-auto w-full max-w-6xl px-5">
        {/* ---------- BANNER: foto lebar di atas, konten di bawah ---------- */}
        {variant === 'banner' && (
          <div className="rise">
            <div className="relative h-56 overflow-hidden rounded-[2rem] border border-rule bg-paper-2 md:h-80">
              {business.hero_image_url ? (
                <Image src={business.hero_image_url} alt={business.name} width={1600} height={900} unoptimized className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-paper-2 to-paper" />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">{business.category}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {business.address}, {business.city}
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-start">
              <div>
                <div className="rise rise-d1">
                  <Badges business={business} badge={template.badge} openStatus={openStatus} />
                </div>
                <div className="rise rise-d2 mt-5">{heading}</div>
                <div className="rise rise-d3 mt-7 space-y-4">
                  {cta}
                  {note}
                </div>
              </div>
              <div className="rise rise-d4">
                <Highlights items={highlights} layout="strip" />
              </div>
            </div>
          </div>
        )}

        {/* ---------- CENTERED: teks tengah, foto besar di bawah ---------- */}
        {variant === 'centered' && (
          <div className="rise">
            <div className="mx-auto max-w-3xl text-center">
              <div className="flex justify-center">
                <Badges business={business} badge={template.badge} openStatus={openStatus} />
              </div>
              <div className="rise rise-d1 mt-5">{heading}</div>
              <div className="rise rise-d2 mt-7 space-y-4">
                {cta}
                {note}
              </div>
            </div>
            <div className="rise rise-d3 relative mt-10">
              <Media business={business} rounded="rounded-[2rem]" className="h-64 shadow-pop md:h-96" />
              <AddressOverlay business={business} />
            </div>
            <div className="rise rise-d4 mt-6">
              <Highlights items={highlights} layout="cards" center />
            </div>
          </div>
        )}

        {/* ---------- CLEAN: tenang, hairline, tanpa bayangan ---------- */}
        {variant === 'clean' && (
          <div className="rise grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <Badges business={business} badge={template.badge} openStatus={openStatus} />
              <div className="rise rise-d1 mt-5">{heading}</div>
              <div className="rise rise-d2 mt-7 space-y-4">
                {cta}
                {note}
              </div>
              <div className="rise rise-d3 mt-8">
                <Highlights items={highlights} layout="strip" />
              </div>
            </div>
            <div className="rise rise-d4">
              <Media business={business} rounded="rounded-3xl" className="h-60 md:h-96" />
            </div>
          </div>
        )}

        {/* ---------- SPLIT (default): teks kiri, foto tinggi kanan ---------- */}
        {variant === 'split' && (
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <div className="rise">
                <Badges business={business} badge={template.badge} openStatus={openStatus} />
              </div>
              <div className="rise rise-d1 mt-5">{heading}</div>
              <div className="rise rise-d2 mt-7 space-y-4">
                {cta}
                {note}
              </div>
              <div className="rise rise-d3 mt-8">
                <Highlights items={highlights} layout="cards" />
              </div>
            </div>
            <div className="rise rise-d4 relative">
              <Media business={business} rounded="rounded-[2rem]" className="h-64 shadow-pop md:h-140" />
              <AddressOverlay business={business} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
