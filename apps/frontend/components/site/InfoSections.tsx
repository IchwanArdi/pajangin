import { AtSign, ChevronDown, Clock, ExternalLink, MapPin, MessageCircle, Phone, Quote } from 'lucide-react';
import type { Business } from '../../lib/api';
import type { FaqItem, Testimonial } from '../../lib/business-page';
import { ItemReveal } from './reveal-item';
import { SectionIntro, SiteSection } from './site-ui';

export function AboutSection({ business, tone = 'alt' }: { business: Business; tone?: 'paper' | 'alt' }) {
  const cards = [
    { icon: MessageCircle, title: 'Kontak langsung', desc: 'Konsultasi dan booking via WhatsApp.' },
    { icon: Clock, title: 'Jam buka', desc: business.opening_hours || 'Hubungi kami untuk informasi jam buka.' },
    { icon: MapPin, title: 'Lokasi', desc: `${business.address}, ${business.city}.` },
  ];

  return (
    <SiteSection id="tentang" tone={tone}>
      <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12">
        <SectionIntro
          eyebrow={`Tentang ${business.name}`}
          title="Informasi singkat"
          sub={business.description || business.tagline || 'Informasi layanan, lokasi, dan kontak bisnis.'}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <ItemReveal key={card.title} index={index}>
                <div className="lift h-full rounded-3xl border border-rule bg-paper p-5">
                  <Icon className="mb-3 h-5 w-5 text-accent" />
                  <h3 className="font-semibold text-ink">{card.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">{card.desc}</p>
                </div>
              </ItemReveal>
            );
          })}
        </div>
      </div>
    </SiteSection>
  );
}

export function TestimonialsSection({ testimonials, tone = 'paper' }: { testimonials: Testimonial[]; tone?: 'paper' | 'alt' }) {
  if (testimonials.length === 0) return null;

  return (
    <SiteSection id="testimoni" tone={tone}>
      <SectionIntro eyebrow="Kata pelanggan" title="Testimoni Pelanggan" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {testimonials.slice(0, 6).map((testimonial, index) => (
          <ItemReveal key={index} index={index}>
            <figure className="lift flex h-full flex-col rounded-3xl border border-rule bg-paper-2 p-5">
              <Quote className="h-5 w-5 text-accent" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">“{testimonial.message}”</blockquote>
              <figcaption className="mt-4 flex items-center justify-between gap-3 border-t border-rule pt-4">
                <span className="font-semibold text-ink">{testimonial.name}</span>
                {testimonial.rating ? <span className="text-xs font-medium text-accent">★ {testimonial.rating}/5</span> : null}
              </figcaption>
            </figure>
          </ItemReveal>
        ))}
      </div>
    </SiteSection>
  );
}

export function FaqSection({ items, tone = 'alt' }: { items: FaqItem[]; tone?: 'paper' | 'alt' }) {
  if (items.length === 0) return null;

  return (
    <SiteSection id="faq" tone={tone}>
      <div className="mx-auto max-w-4xl">
        <SectionIntro eyebrow="Pertanyaan umum" title="Hal yang sering ditanyakan" />
        <div className="mt-8 space-y-3">
          {items.map((item, index) => (
            <details key={index} className="group rounded-2xl border border-rule bg-paper">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-ink">
                {item.question}
                <ChevronDown className="h-4 w-4 shrink-0 text-ink-2 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <div className="acc-panel">
                <div>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-2">{item.answer}</p>
                </div>
              </div>
            </details>
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
  tone = 'paper',
}: {
  business: Business;
  waLink: string;
  onWhatsAppClick: () => void;
  tone?: 'paper' | 'alt';
}) {
  const query = encodeURIComponent(`${business.name}, ${business.address}, ${business.city}`);
  const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`;

  return (
    <SiteSection id="lokasi" tone={tone}>
      <SectionIntro icon={MapPin} eyebrow="Lokasi & Kontak" title="Kunjungi atau hubungi kami" />

      <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-3xl border border-rule bg-paper-2">
          <iframe
            title={`Peta lokasi ${business.name}`}
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-64 w-full border-0 md:h-full md:min-h-80"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-rule bg-paper-2 p-6">
            <p className="text-sm text-ink-2">Alamat</p>
            <p className="mt-1 text-lg font-semibold text-ink">
              {business.address}, {business.city}
            </p>
            {business.province && <p className="mt-1 text-sm text-ink-2">{business.province}</p>}

            <div className="mt-6 flex flex-wrap gap-2.5">
              {business.google_maps_url && (
                <a
                  href={business.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:opacity-90"
                >
                  <ExternalLink className="h-4 w-4" /> Buka di Maps
                </a>
              )}
              {business.whatsapp && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onWhatsAppClick()}
                  className="press inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-5 py-2.5 text-sm font-semibold text-ink hover:bg-paper-2"
                >
                  <MessageCircle className="h-4 w-4" /> Chat WhatsApp
                </a>
              )}
              {business.instagram_url && (
                <a
                  href={business.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex items-center gap-2 rounded-full border border-rule bg-paper px-5 py-2.5 text-sm font-semibold text-ink hover:bg-paper-2"
                >
                  <AtSign className="h-4 w-4" /> Instagram
                </a>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-rule bg-paper-2 p-6">
            <p className="text-sm text-ink-2">Kontak</p>
            {business.phone && (
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-ink">
                <Phone className="h-4 w-4 text-accent" />
                {business.phone}
              </p>
            )}
            {business.whatsapp && <p className="mt-1 text-sm text-ink-2">WhatsApp: {business.whatsapp}</p>}
            <p className="mt-4 flex items-center gap-2 text-sm text-ink-2">
              <Clock className="h-4 w-4" /> Jam operasional
            </p>
            <p className="mt-1 font-semibold text-ink">{business.opening_hours || 'Silakan hubungi kami'}</p>
          </div>
        </div>
      </div>
    </SiteSection>
  );
}
