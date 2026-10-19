'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  MessageCircle,
  Phone,
  MapPin,
  CalendarCheck,
  Globe,
  Clock,
  Share2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
import type { Business, Service } from '../../../lib/api';
import { sendAnalyticsEvent } from '../../../lib/api';
import { getAttribution, getDevice, getSessionId } from '../../../lib/attribution';

interface Props {
  business: Business;
  services: Service[];
}

export default function BioClientView({ business, services }: Props) {
  const themeColor = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(business.theme_color || '')
    ? business.theme_color!
    : '#e85d3a';

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
      } catch {
        // User cancelled share
      }
    } else if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan bio telah disalin!');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-stone-900 via-stone-950 to-black text-stone-100 antialiased selection:bg-accent selection:text-white">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20 blur-3xl"
        style={{
          background: `radial-gradient(circle at 50% 20%, ${themeColor} 0%, transparent 60%)`,
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-between px-4 py-8 sm:py-12">
        {/* Konten Utama */}
        <div className="space-y-6">
          {/* Header Profil */}
          <div className="flex flex-col items-center text-center">
            {/* Tombol Bagikan di Pojok Kanan Atas */}
            <div className="flex w-full justify-end">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Bagikan Tautan"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-300 backdrop-blur transition hover:bg-white/10 hover:text-white"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>

            {/* Logo / Avatar */}
            <div className="relative mt-2">
              <div
                className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 p-1 shadow-xl"
                style={{ borderColor: themeColor }}
              >
                {business.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={business.logo_url}
                    alt={business.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full text-2xl font-black text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {business.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Nama & Tagline */}
            <h1 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
              {business.name}
            </h1>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-stone-400">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-stone-300">
                {business.category}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="h-3 w-3 text-stone-400" />
                {business.city}
              </span>
            </p>

            {business.tagline && (
              <p className="mt-2.5 max-w-xs text-xs leading-relaxed text-stone-300">
                {business.tagline}
              </p>
            )}
          </div>

          {/* Quick CTA Utama: WhatsApp */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleTrackAction('whatsapp_click', 'bio_wa_btn', 'WhatsApp Utama Bio')}
            className="group flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-[0.99]"
          >
            <MessageCircle className="h-5 w-5 fill-current" />
            <span>Chat WhatsApp Sekarang</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          {/* Quick Links Grid: Booking, Website, Maps, IG */}
          <div className="grid grid-cols-2 gap-2.5">
            {business.booking_enabled && (
              <Link
                href={`/${business.slug}#booking`}
                className="col-span-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    <CalendarCheck className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">Reservasi / Booking</div>
                    <div className="text-[10px] text-stone-400">Pilih tanggal & jam kunjungan</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-stone-400" />
              </Link>
            )}

            <Link
              href={`/${business.slug}`}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-stone-200">
                <Globe className="h-4 w-4" />
              </div>
              <div className="min-w-0 text-left">
                <div className="truncate text-xs font-semibold text-white">Website Lengkap</div>
                <div className="truncate text-[10px] text-stone-400">Info & profil lengkap</div>
              </div>
            </Link>

            {business.google_maps_url ? (
              <a
                href={business.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-stone-200">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="truncate text-xs font-semibold text-white">Petunjuk Arah</div>
                  <div className="truncate text-[10px] text-stone-400">Google Maps</div>
                </div>
              </a>
            ) : business.phone ? (
              <a
                href={`tel:${business.phone}`}
                onClick={() => handleTrackAction('phone_click', 'bio_phone_btn', 'Telepon Bio')}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-stone-200">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="truncate text-xs font-semibold text-white">Telepon</div>
                  <div className="truncate text-[10px] text-stone-400">{business.phone}</div>
                </div>
              </a>
            ) : null}

            {business.instagram_url && (
              <a
                href={business.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur transition hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
                    <InstagramIcon className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-white">Instagram</div>
                    <div className="text-[10px] text-stone-400">Follow update & promo terbaru</div>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-stone-400" />
              </a>
            )}
          </div>

          {/* Katalog Layanan / Produk Unggulan */}
          {services.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold tracking-wider text-stone-400 uppercase">
                  Layanan & Menu Pilihan
                </h2>
                <Link
                  href={`/${business.slug}#layanan`}
                  className="text-[11px] font-semibold text-stone-400 transition hover:text-white"
                >
                  Lihat Semua
                </Link>
              </div>

              <div className="space-y-2">
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
                      onClick={() =>
                        handleTrackAction('service_view', service.id, service.name)
                      }
                      className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition hover:border-white/15 hover:bg-white/10"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-xs font-semibold text-white group-hover:text-stone-100">
                            {service.name}
                          </h3>
                          {service.is_featured && (
                            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                              Favorit
                            </span>
                          )}
                        </div>
                        {service.description && (
                          <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-400">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {service.price ? (
                          <span
                            className="rounded-lg px-2 py-1 text-xs font-bold text-white shadow-xs"
                            style={{ backgroundColor: `${themeColor}cc` }}
                          >
                            Rp {service.price.toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-stone-400">Tanya Harga</span>
                        )}
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Jam Buka & Alamat */}
          {(business.opening_hours || business.address) && (
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-xs text-stone-300">
              {business.opening_hours && (
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  <div>
                    <span className="font-semibold text-white">Jam Operasional:</span>
                    <p className="text-stone-400">{business.opening_hours}</p>
                  </div>
                </div>
              )}
              {business.address && (
                <div className={`flex items-start gap-2.5 ${business.opening_hours ? 'mt-3 border-t border-white/5 pt-3' : ''}`}>
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                  <div>
                    <span className="font-semibold text-white">Alamat:</span>
                    <p className="text-stone-400">
                      {business.address}, {business.city}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-white/5 pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-500 transition hover:text-stone-300"
          >
            <span>Ditenagai oleh</span>
            <span className="font-bold text-stone-300">
              Pajang<span style={{ color: themeColor }}>in</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
