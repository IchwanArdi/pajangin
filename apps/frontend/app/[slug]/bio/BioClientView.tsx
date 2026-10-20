'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Star,
} from 'lucide-react';
import type { Business, Service } from '../../../lib/api';
import { sendAnalyticsEvent } from '../../../lib/api';
import { getAttribution, getDevice, getSessionId } from '../../../lib/attribution';
import { formatHour, formatPrice, getOpenStatus } from '../../../lib/business-page';
import { accentVars, normalizeAccent } from '../../../lib/site-accent';

function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface Props {
  business: Business;
  services: Service[];
}

function servicesLabel(templateId?: string | null): string {
  switch (templateId) {
    case 'restaurant':
      return 'Menu Pilihan';
    case 'retail':
      return 'Produk Pilihan';
    case 'education':
      return 'Program Pilihan';
    default:
      return 'Layanan Pilihan';
  }
}

export default function BioClientView({ business, services }: Props) {
  const accent = normalizeAccent(business.theme_color, business.template);
  const openStatus = getOpenStatus(business.opening_hours);
  const [shared, setShared] = useState(false);

  // Format link WhatsApp
  const cleanWa = business.whatsapp.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
    `Halo ${business.name}, saya melihat dari Link in Bio dan ingin menanyakan info layanan.`,
  )}`;

  // Catat event page view saat halaman bio dibuka, memakai session yang sama
  // dengan halaman bisnis agar atribusi QR/bio tidak pecah.
  useEffect(() => {
    sendAnalyticsEvent({
      business_id: business.id,
      event_type: 'page_view',
      target_id: 'bio_page',
      target_name: 'Link in Bio Page',
      ...getAttribution(),
      device: getDevice(),
      session_id: getSessionId(),
    });
  }, [business.id]);

  const handleTrackAction = (
    eventType: 'whatsapp_click' | 'phone_click' | 'service_view',
    targetId: string,
    targetName: string,
  ) => {
    sendAnalyticsEvent({
      business_id: business.id,
      event_type: eventType,
      target_id: targetId,
      target_name: targetName,
      ...getAttribution(),
      device: getDevice(),
      session_id: getSessionId(),
    });
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: business.name,
          text: business.tagline || `Kunjungi ${business.name}`,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled share
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch {
      // Clipboard tidak tersedia — biarkan tanpa efek
    }
  };

  const openText = openStatus
    ? openStatus.open
      ? `Buka sekarang · sampai ${formatHour(openStatus.end)}`
      : `Tutup · buka ${formatHour(openStatus.start)}`
    : null;

  const quickLinkClass =
    'press group flex items-center gap-3 rounded-2xl border border-rule bg-paper p-3.5 text-left transition hover:border-ink/20 hover:bg-paper-2';

  return (
    <div style={accentVars(accent)} className="min-h-screen bg-paper text-ink antialiased">
      {/* ---------- Hero gelap: identitas + aksi utama ---------- */}
      <header className="relative overflow-hidden rounded-b-[2rem] bg-ink text-paper">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: accent }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1.5px)] [background-size:20px_20px]"
        />

        <div className="relative mx-auto w-full max-w-md px-5 pb-8 pt-5">
          <div className="flex items-center justify-between">
            <Link
              href={`/${business.slug}`}
              className="press inline-flex items-center gap-1.5 text-[11px] font-medium text-paper/60 transition hover:text-paper"
            >
              Halaman lengkap <ArrowRight className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={handleShare}
              aria-label={shared ? 'Tautan disalin' : 'Bagikan tautan'}
              className="press flex h-9 items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 text-[11px] font-medium text-paper/70 backdrop-blur transition hover:bg-white/10 hover:text-paper"
            >
              {shared ? <Check className="h-3.5 w-3.5 text-positive" /> : <Share2 className="h-3.5 w-3.5" />}
              {shared ? 'Disalin' : 'Bagikan'}
            </button>
          </div>

          <div className="mt-7 flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.75rem] bg-white/5 p-1 ring-1 ring-white/15">
                {business.logo_url ? (
                  <Image
                    src={business.logo_url}
                    alt={business.name}
                    width={192}
                    height={192}
                    unoptimized
                    className="h-full w-full rounded-[1.5rem] object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-[1.5rem] bg-accent text-3xl font-bold text-accent-ink">
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {openStatus && (
                <span
                  aria-hidden
                  className={[
                    'absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-ink',
                    openStatus.open ? 'bg-positive' : 'bg-negative',
                  ].join(' ')}
                />
              )}
            </div>

            <h1 className="font-display mt-4 text-[1.7rem] font-semibold leading-[1.08] tracking-[-0.03em] text-paper [overflow-wrap:anywhere]">
              {business.name}
            </h1>

            <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-paper/60">
              <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 font-medium text-paper/80">
                {business.category}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {business.city}
              </span>
            </p>

            {business.tagline && (
              <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-paper/70">{business.tagline}</p>
            )}

            {(openText || business.rating) && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {openText && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-paper/85">
                    <span
                      className={[
                        'h-1.5 w-1.5 rounded-full',
                        openStatus?.open ? 'animate-pulse bg-positive motion-reduce:animate-none' : 'bg-negative',
                      ].join(' ')}
                    />
                    {openText}
                  </span>
                )}
                {business.rating ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-paper/85">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {business.rating}/5
                    {business.review_count ? ` · ${business.review_count} ulasan` : ''}
                  </span>
                ) : null}
              </div>
            )}

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleTrackAction('whatsapp_click', 'bio_wa_btn', 'WhatsApp Utama Bio')}
              className="press group mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-accent px-5 py-4 text-sm font-bold text-accent-ink shadow-lg shadow-black/20 transition hover:opacity-95"
            >
              <MessageCircle className="h-5 w-5" />
              Chat WhatsApp
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md space-y-5 px-5 py-6">
        {/* ---------- Tautan cepat ---------- */}
        <div className="grid grid-cols-2 gap-2.5">
          {business.booking_enabled && services.length > 0 && (
            <Link
              href={`/${business.slug}#booking`}
              className="press col-span-2 flex items-center justify-between rounded-2xl border border-accent/20 bg-accent-soft p-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">Reservasi / Booking</p>
                  <p className="text-[11px] text-ink-2">Pilih tanggal &amp; jam kunjungan</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-accent" />
            </Link>
          )}

          <Link href={`/${business.slug}`} className={quickLinkClass}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper-2 text-ink-2">
              <Globe className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink">Halaman lengkap</p>
              <p className="truncate text-[10px] text-ink-2">Info, menu &amp; galeri</p>
            </div>
          </Link>

          {business.google_maps_url ? (
            <a
              href={business.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className={quickLinkClass}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper-2 text-ink-2">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink">Petunjuk arah</p>
                <p className="truncate text-[10px] text-ink-2">Google Maps</p>
              </div>
            </a>
          ) : business.phone ? (
            <a
              href={`tel:${business.phone}`}
              onClick={() => handleTrackAction('phone_click', 'bio_phone_btn', 'Telepon Bio')}
              className={quickLinkClass}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper-2 text-ink-2">
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink">Telepon</p>
                <p className="truncate text-[10px] text-ink-2">{business.phone}</p>
              </div>
            </a>
          ) : null}

          {business.instagram_url && (
            <a
              href={business.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${quickLinkClass} col-span-2`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper-2 text-ink-2">
                <InstagramIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">Instagram</p>
                <p className="truncate text-[10px] text-ink-2">Update &amp; promo terbaru</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink-3" />
            </a>
          )}
        </div>

        {/* ---------- Layanan pilihan ---------- */}
        {services.length > 0 && (
          <section className="overflow-hidden rounded-3xl border border-rule bg-paper">
            <div className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3.5">
              <h2 className="font-display text-sm font-semibold text-ink">{servicesLabel(business.template)}</h2>
              <Link
                href={`/${business.slug}#layanan`}
                className="press inline-flex items-center gap-1 text-[11px] font-semibold text-ink-2 transition hover:text-ink"
              >
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="divide-y divide-rule">
              {services.slice(0, 4).map((service) => {
                const serviceWaUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(
                  `Halo ${business.name}, saya tertarik memesan layanan "${service.name}". Apakah masih tersedia?`,
                )}`;
                return (
                  <a
                    key={service.id}
                    href={serviceWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleTrackAction('service_view', service.id, service.name)}
                    className="press group flex items-center gap-3 px-4 py-3 transition hover:bg-paper-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[13px] font-semibold text-ink">{service.name}</h3>
                        {service.is_featured && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] text-accent">
                            <Star className="h-2.5 w-2.5 fill-accent" />
                            Favorit
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-ink-2">{service.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] font-semibold text-ink-2">
                        {service.price !== null && service.price !== undefined
                          ? formatPrice(service.price, service.price_prefix)
                          : 'Tanya harga'}
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-accent">
                        <MessageCircle className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ---------- Jam buka & alamat ---------- */}
        {(business.opening_hours || business.address) && (
          <section className="rounded-3xl border border-rule bg-paper-2 p-4">
            {business.opening_hours && (
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Jam operasional</p>
                  <p className="mt-0.5 text-[13px] font-medium text-ink">{business.opening_hours}</p>
                </div>
              </div>
            )}
            {business.address && (
              <div
                className={[
                  'flex items-start gap-3',
                  business.opening_hours ? 'mt-3 border-t border-rule pt-3' : '',
                ].join(' ')}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">Alamat</p>
                  <p className="mt-0.5 text-[13px] font-medium leading-relaxed text-ink">
                    {business.address}, {business.city}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="mx-auto w-full max-w-md px-5 pb-10 text-center">
        <div className="border-t border-rule pt-5">
          <p className="text-[11px] text-ink-3">
            © {new Date().getFullYear()} {business.name}
          </p>
          <Link
            href="/"
            className="press mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-3 transition hover:text-ink"
          >
            Ditenagai
            <span className="font-display text-xs font-semibold text-ink">Pajangin</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
