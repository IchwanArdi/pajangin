'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import type { Service } from '../../lib/api';
import { formatPrice } from '../../lib/business-page';
import { ItemReveal } from './reveal-item';
import { SectionIntro, SiteSection } from './site-ui';

interface Props {
  services: Service[];
  heading: { title: string; sub: string };
  ctaLabel: string;
  buildWaLink: (serviceName: string) => string;
  onServiceClick: (service: Service) => void;
  onWhatsAppClick: (serviceId: string, serviceName: string) => void;
  tone?: 'paper' | 'alt';
}

export default function ServicesSection({ services, heading, ctaLabel, buildWaLink, onServiceClick, onWhatsAppClick, tone = 'alt' }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(services.map((service) => service.category).filter(Boolean))) as string[];
    return unique.length > 1 ? ['Semua', ...unique] : [];
  }, [services]);

  const featured = useMemo(() => services.filter((service) => service.is_featured).slice(0, 2), [services]);

  const gridServices = useMemo(() => {
    const featuredIds = new Set(featured.map((service) => service.id));
    return services.filter((service) => {
      if (featuredIds.has(service.id)) return false;
      if (selectedCategory === 'Semua') return true;
      return service.category === selectedCategory;
    });
  }, [services, featured, selectedCategory]);

  return (
    <SiteSection id="layanan" tone={tone}>
      <SectionIntro eyebrow="Layanan & Harga" title={heading.title} sub={heading.sub} />

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const activeChip = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={activeChip}
                className={[
                  'press rounded-full border px-4 py-2 text-sm',
                  activeChip ? 'border-ink bg-ink font-semibold text-paper' : 'border-rule bg-paper text-ink-2 hover:text-ink',
                ].join(' ')}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      {featured.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {featured.map((service, index) => (
            <ItemReveal key={service.id} index={index}>
              <article
                onClick={() => onServiceClick(service)}
                className="lift group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-rule bg-paper hover:border-accent/40"
              >
                {service.image_url && (
                  <Image src={service.image_url} alt={service.name} width={1200} height={900} unoptimized className="h-52 w-full object-cover" />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                      <Star className="h-3 w-3" /> Andalan
                    </span>
                    <span className="text-sm font-semibold text-ink">{formatPrice(service.price, service.price_prefix)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-ink">{service.name}</h3>
                  {service.description && <p className="mt-2 text-sm leading-relaxed text-ink-2">{service.description}</p>}
                  <a
                    href={buildWaLink(service.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => {
                      event.stopPropagation();
                      onWhatsAppClick(service.id, service.name);
                    }}
                    className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-accent"
                  >
                    {ctaLabel}
                    <ArrowRight className="arrow-nudge h-4 w-4" />
                  </a>
                </div>
              </article>
            </ItemReveal>
          ))}
        </div>
      )}

      {gridServices.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gridServices.map((service, index) => (
            <ItemReveal key={service.id} index={index}>
              <article
                onClick={() => onServiceClick(service)}
                className="lift group flex h-full cursor-pointer flex-col rounded-3xl border border-rule bg-paper p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="font-bold leading-snug text-ink">{service.name}</h3>
                  {service.is_featured && <Star className="h-4 w-4 shrink-0 text-accent" />}
                </div>
                {service.description && <p className="line-clamp-2 text-sm text-ink-2">{service.description}</p>}
                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <span className="text-sm font-semibold text-ink">{formatPrice(service.price, service.price_prefix)}</span>
                  <a
                    href={buildWaLink(service.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => {
                      event.stopPropagation();
                      onWhatsAppClick(service.id, service.name);
                    }}
                    className="text-sm font-bold text-accent"
                  >
                    {ctaLabel} →
                  </a>
                </div>
              </article>
            </ItemReveal>
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-rule bg-paper p-6 text-sm text-ink-2">Belum ada layanan pada kategori ini.</p>
      )}
    </SiteSection>
  );
}
