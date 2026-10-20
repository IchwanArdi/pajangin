'use client';

import { useState } from 'react';
import {
  AtSign,
  Check,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  Tag,
} from 'lucide-react';
import type { Business } from '../../lib/api';
import { formatHour, getOpenStatus, type FaqItem, type Testimonial } from '../../lib/business-page';
import { ItemReveal } from './reveal-item';
import { SectionIntro, SiteSection, type SiteTone } from './site-ui';

export function AboutSection({ business, tone = 'soft' }: { business: Business; tone?: SiteTone }) {
  const openStatus = getOpenStatus(business.opening_hours);
  const facts = [
    { icon: Clock, label: 'Jam buka', value: business.opening_hours || 'Hubungi kami' },
    ...(business.service_area ? [{ icon: MapPin, label: 'Area layanan', value: business.service_area }] : []),
    ...(business.price_range ? [{ icon: Tag, label: 'Kisaran harga', value: business.price_range }] : []),
    ...(business.rating
      ? [
          {
            icon: Star,
            label: 'Rating pelanggan',
            value: `${business.rating}/5${business.review_count ? ` · ${business.review_count} ulasan` : ''}`,
          },
        ]
      : []),
  ];

  return (
    <SiteSection id="tentang" tone={tone}>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <SectionIntro
            eyebrow="Tentang kami"
            title={business.name}
            sub={business.tagline || undefined}
          />
          <div className="mt-6 max-w-2xl">
            <p className="text-[15px] leading-[1.85] text-ink-2">
              {business.description || 'Informasi layanan, lokasi, dan kontak bisnis.'}
            </p>
            {openStatus && (
              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-3.5 py-1.5 text-xs font-semibold text-ink">
                <span
                  className={[
                    'h-1.5 w-1.5 rounded-full',
                    openStatus.open ? 'animate-pulse bg-positive motion-reduce:animate-none' : 'bg-negative',
                  ].join(' ')}
                />
                {openStatus.open
                  ? `Buka sekarang · sampai ${formatHour(openStatus.end)}`
                  : `Tutup · buka ${formatHour(openStatus.start)}`}
              </p>
            )}
          </div>
        </div>

        <ItemReveal>
          <div className="rounded-3xl border border-rule bg-paper p-6 md:p-7">
            <dl className="divide-y divide-rule">
              {facts.map((fact) => {
                const Icon = fact.icon;
                return (
                  <div key={fact.label} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <div>
                      <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-3">
                        {fact.label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold leading-snug text-ink">{fact.value}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>
        </ItemReveal>
      </div>
    </SiteSection>
  );
}

export function TestimonialsSection({
  testimonials,
  rating,
  reviewCount,
}: {
  testimonials: Testimonial[];
  rating?: number | null;
  reviewCount?: number | null;
}) {
  if (testimonials.length === 0) return null;

  return (
    <SiteSection id="testimoni" tone="ink" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionIntro
            dark
            eyebrow="Kata pelanggan"
            title="Mereka sudah mencoba"
            sub="Pengalaman langsung pelanggan — tanpa filter dan tanpa bayaran."
          />
          {rating ? (
            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-paper/15 px-4 py-3">
              <span className="font-display text-3xl font-bold leading-none text-paper">
                {rating.toFixed(1).replace('.', ',')}
              </span>
              <div>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      className={[
                        'h-3.5 w-3.5',
                        i < Math.round(rating) ? 'fill-warning text-warning' : 'text-paper/25',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-paper/50">
                  {reviewCount ? `${reviewCount} ulasan` : 'Rating pelanggan'}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <ItemReveal key={index} index={index} className={index === 0 ? 'md:col-span-2' : undefined}>
              <figure className="flex h-full flex-col rounded-3xl border border-paper/15 bg-paper/5 p-6 md:p-7">
                <span aria-hidden className="font-display text-4xl leading-none text-accent">
                  “
                </span>
                <blockquote
                  className={[
                    'mt-3 flex-1 leading-relaxed text-paper/85',
                    index === 0 ? 'text-lg md:text-xl' : 'text-sm',
                  ].join(' ')}
                >
                  {testimonial.message}
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between gap-3 border-t border-paper/10 pt-4">
                  <span className="text-sm font-semibold text-paper">{testimonial.name}</span>
                  {testimonial.rating ? (
                    <span className="flex items-center gap-1 text-xs text-paper/60">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      {testimonial.rating}/5
                    </span>
                  ) : null}
                </figcaption>
              </figure>
            </ItemReveal>
          ))}
        </div>
      </div>
    </SiteSection>
  );
}

export function FaqSection({ items, tone = 'soft' }: { items: FaqItem[]; tone?: SiteTone }) {
  if (items.length === 0) return null;

  return (
    <SiteSection id="faq" tone={tone}>
      <div className="mx-auto max-w-4xl">
        <SectionIntro eyebrow="Pertanyaan umum" title="Hal yang sering ditanyakan" />

        <div className="mt-8 border-t border-rule">
          {items.map((item, index) => (
            <ItemReveal key={index} index={index}>
              <details className="group border-b border-rule">
                <summary className="flex cursor-pointer list-none items-start gap-4 py-5 md:gap-6 md:py-6">
                  <span className="mt-1 font-mono text-xs text-ink-3">{String(index + 1).padStart(2, '0')}</span>
                  <span className="flex-1 font-display text-base font-semibold tracking-[-0.01em] text-ink transition group-open:text-accent md:text-lg">
                    {item.question}
                  </span>
                  <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-ink-2 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="acc-panel">
                  <div>
                    <p className="pb-5 pl-8 pr-8 text-sm leading-relaxed text-ink-2 md:pb-6 md:pl-11 md:text-[15px]">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </details>
            </ItemReveal>
          ))}
        </div>
      </div>
    </SiteSection>
  );
}

export function LocationSection({
  business,
  waLink,
  onWhatsAppClick,
  tone = 'plain',
}: {
  business: Business;
  waLink: string;
  onWhatsAppClick: () => void;
  tone?: SiteTone;
}) {
  const [copied, setCopied] = useState(false);
  const query = encodeURIComponent(`${business.name}, ${business.address}, ${business.city}`);
  const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`;
  const fullAddress = `${business.address}, ${business.city}${business.province ? `, ${business.province}` : ''}`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(fullAddress);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard tidak tersedia di konteks ini — biarkan tombol tanpa efek
    }
  };

  return (
    <SiteSection id="lokasi" tone={tone}>
      <SectionIntro
        eyebrow="Lokasi & Kontak"
        title="Mampir atau hubungi kami"
        sub={`${business.city}${business.province ? `, ${business.province}` : ''}`}
      />

      <ItemReveal className="relative mt-8">
        <div className="overflow-hidden rounded-[2rem] border border-rule bg-paper-2">
          <iframe
            title={`Peta lokasi ${business.name}`}
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[340px] w-full border-0 sm:h-[420px] md:h-[500px]"
          />
        </div>

        <div className="relative z-10 mx-4 -mt-16 rounded-3xl border border-rule bg-paper/95 p-6 shadow-pop backdrop-blur md:absolute md:bottom-8 md:left-8 md:mx-0 md:mt-0 md:w-[22.5rem]">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-3">Alamat</p>
          <p className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink">{fullAddress}</p>

          <div className="mt-4 space-y-2 border-t border-rule pt-4 text-sm">
            <p className="flex items-start gap-2 text-ink">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {business.opening_hours || 'Jam operasional menyusul'}
            </p>
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-ink transition hover:text-accent">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                {business.phone}
              </a>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {business.google_maps_url && (
              <a
                href={business.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:opacity-90"
              >
                <ExternalLink className="h-4 w-4" /> Buka di Maps
              </a>
            )}
            <button
              type="button"
              onClick={copyAddress}
              className="press inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper-2"
            >
              {copied ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Alamat disalin' : 'Salin alamat'}
            </button>
          </div>

          {(business.whatsapp || business.instagram_url) && (
            <div className="mt-3 flex items-center gap-2">
              {business.whatsapp && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onWhatsAppClick()}
                  aria-label="Chat WhatsApp"
                  className="press inline-flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink-2 transition hover:border-ink/30 hover:text-ink"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
              {business.instagram_url && (
                <a
                  href={business.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="press inline-flex h-9 w-9 items-center justify-center rounded-full border border-rule text-ink-2 transition hover:border-ink/30 hover:text-ink"
                >
                  <AtSign className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </ItemReveal>
    </SiteSection>
  );
}
