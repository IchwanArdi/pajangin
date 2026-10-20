'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import type { Service } from '../../lib/api';
import { formatPrice } from '../../lib/business-page';
import { ItemReveal } from './reveal-item';
import { SectionIntro, SiteSection, type SiteTone } from './site-ui';

type ServicesLayout = 'cards' | 'menu-grid' | 'feature-list' | 'catalog';

interface Props {
  services: Service[];
  heading: { title: string; sub: string };
  layout?: ServicesLayout;
  ctaLabel: string;
  buildWaLink: (serviceName: string) => string;
  onServiceClick: (service: Service) => void;
  onWhatsAppClick: (serviceId: string, serviceName: string) => void;
  tone?: SiteTone;
}

const EYEBROW: Record<ServicesLayout, string> = {
  cards: 'Layanan & Harga',
  'menu-grid': 'Menu & Harga',
  'feature-list': 'Layanan & Estimasi Biaya',
  catalog: 'Katalog & Harga',
};

/** Tautan WhatsApp per layanan — mematikan propagasi klik kartu. */
function ServiceLink({
  href,
  label,
  onTrack,
  className = '',
}: {
  href: string;
  label: string;
  onTrack: (event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onTrack}
      className={['inline-flex items-center gap-1.5 text-sm font-bold text-accent', className].join(' ')}
    >
      {label}
      <ArrowRight className="arrow-nudge h-3.5 w-3.5" />
    </a>
  );
}

export default function ServicesSection({
  services,
  heading,
  layout = 'cards',
  ctaLabel,
  buildWaLink,
  onServiceClick,
  onWhatsAppClick,
  tone = 'soft',
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(services.map((service) => service.category).filter(Boolean))) as string[];
    return unique.length > 1 ? ['Semua', ...unique] : [];
  }, [services]);

  const featured = useMemo(() => services.filter((service) => service.is_featured).slice(0, 2), [services]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'Semua') return services;
    return services.filter((service) => service.category === selectedCategory);
  }, [services, selectedCategory]);

  const featuredIds = useMemo(() => new Set(featured.map((service) => service.id)), [featured]);

  const gridServices = useMemo(
    () => filteredServices.filter((service) => !featuredIds.has(service.id)),
    [filteredServices, featuredIds],
  );

  const showFeatured = selectedCategory === 'Semua' && featured.length > 0;

  /** Menu dikelompokkan per kategori — hanya untuk layout menu-grid. */
  const menuGroups = useMemo(() => {
    const groups = new Map<string, Service[]>();
    for (const service of gridServices) {
      const key = service.category || 'Favorit lainnya';
      const list = groups.get(key) ?? [];
      list.push(service);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [gridServices]);

  /** Katalog: unggulan tampil lebih dulu di grid yang sama. */
  const catalogServices = useMemo(
    () => [...filteredServices].sort((a, b) => Number(b.is_featured) - Number(a.is_featured)),
    [filteredServices],
  );

  const trackWa = (service: Service) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();
    onWhatsAppClick(service.id, service.name);
  };

  const priceOf = (service: Service) => formatPrice(service.price, service.price_prefix);

  const hasVisibleItems = showFeatured || (layout === 'catalog' ? catalogServices.length > 0 : gridServices.length > 0);

  return (
    <SiteSection id="layanan" tone={tone}>
      <SectionIntro eyebrow={EYEBROW[layout]} title={heading.title} sub={heading.sub} />

      {categories.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-2">
          {categories.map((category) => {
            const activeChip = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={activeChip}
                className={[
                  'press rounded-full border px-4 py-1.5 text-sm',
                  activeChip
                    ? 'border-ink bg-ink font-semibold text-paper'
                    : 'border-rule bg-paper text-ink-2 hover:border-ink/30 hover:text-ink',
                ].join(' ')}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      {/* ---------- unggulan: menu-grid ---------- */}
      {showFeatured && layout === 'menu-grid' && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {featured.map((service, index) => (
            <ItemReveal key={service.id} index={index}>
              <article
                onClick={() => onServiceClick(service)}
                className="lift group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-rule bg-paper shadow-xs transition hover:shadow-pop"
              >
                {service.image_url && (
                  <div className="overflow-hidden">
                    <Image
                      src={service.image_url}
                      alt={service.name}
                      width={1200}
                      height={900}
                      unoptimized
                      className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent">
                      <Star className="h-3 w-3 fill-accent" />
                      Andalan
                    </span>
                    <span className="font-display text-[15px] font-semibold text-ink">{priceOf(service)}</span>
                  </div>
                  <h3 className="font-display mt-3 text-xl font-semibold tracking-[-0.01em] text-ink">{service.name}</h3>
                  {service.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{service.description}</p>
                  )}
                  <ServiceLink
                    href={buildWaLink(service.name)}
                    label={ctaLabel}
                    onTrack={trackWa(service)}
                    className="mt-auto pt-5"
                  />
                </div>
              </article>
            </ItemReveal>
          ))}
        </div>
      )}

      {/* ---------- unggulan: feature-list (paket) ---------- */}
      {showFeatured && layout === 'feature-list' && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {featured.map((service, index) => (
            <ItemReveal key={service.id} index={index}>
              <article
                onClick={() => onServiceClick(service)}
                className="lift group flex h-full cursor-pointer flex-col justify-between gap-5 rounded-3xl border-2 border-ink bg-paper p-6 transition hover:shadow-pop md:flex-row md:items-center"
              >
                <div className="min-w-0">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                    Paket Andalan
                  </span>
                  <h3 className="font-display mt-2 text-xl font-semibold tracking-[-0.01em] text-ink">{service.name}</h3>
                  {service.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{service.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center justify-between gap-4 md:flex-col md:items-end md:gap-2">
                  <span className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">{priceOf(service)}</span>
                  <ServiceLink href={buildWaLink(service.name)} label={ctaLabel} onTrack={trackWa(service)} />
                </div>
              </article>
            </ItemReveal>
          ))}
        </div>
      )}

      {/* ---------- unggulan: cards ---------- */}
      {showFeatured && layout === 'cards' && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {featured.map((service, index) => (
            <ItemReveal key={service.id} index={index}>
              <article
                onClick={() => onServiceClick(service)}
                className="lift group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-rule bg-paper shadow-xs transition hover:shadow-pop"
              >
                {service.image_url && (
                  <div className="overflow-hidden">
                    <Image
                      src={service.image_url}
                      alt={service.name}
                      width={1200}
                      height={900}
                      unoptimized
                      className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                      <Star className="h-3 w-3 fill-accent" />
                      Andalan
                    </span>
                    <span className="font-display text-[15px] font-semibold text-ink">{priceOf(service)}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-ink">{service.name}</h3>
                  {service.description && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{service.description}</p>
                  )}
                  <ServiceLink
                    href={buildWaLink(service.name)}
                    label={ctaLabel}
                    onTrack={trackWa(service)}
                    className="mt-auto pt-5"
                  />
                </div>
              </article>
            </ItemReveal>
          ))}
        </div>
      )}

      {/* ---------- daftar: menu bergaris harga ---------- */}
      {layout === 'menu-grid' && menuGroups.length > 0 && (
        <div className="mt-9 grid gap-x-14 gap-y-10 md:grid-cols-2">
          {menuGroups.map(([groupName, items]) => (
            <div key={groupName}>
              <h3 className="font-display text-lg font-semibold tracking-[-0.01em] text-ink">{groupName}</h3>
              <ul className="mt-4 space-y-5">
                {items.map((service) => (
                  <li key={service.id} onClick={() => onServiceClick(service)} className="group cursor-pointer">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[15px] font-semibold text-ink transition group-hover:text-accent">
                        {service.name}
                      </span>
                      <span aria-hidden className="flex-1 -translate-y-1 border-b border-dotted border-rule" />
                      <span className="whitespace-nowrap font-display text-[15px] font-semibold text-ink">
                        {priceOf(service)}
                      </span>
                    </div>
                    {service.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-2">{service.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* ---------- daftar: baris bernomor ---------- */}
      {layout === 'feature-list' && gridServices.length > 0 && (
        <div className="mt-9 divide-y divide-rule border-y border-rule">
          {gridServices.map((service, index) => (
            <ItemReveal key={service.id} index={index}>
              <div
                onClick={() => onServiceClick(service)}
                className="group grid cursor-pointer grid-cols-[auto_1fr] items-center gap-x-5 gap-y-1 py-5 sm:grid-cols-[auto_1fr_auto]"
              >
                <span className="font-mono text-xs font-medium text-ink-3">{String(index + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <p className="font-display text-[17px] font-semibold tracking-[-0.01em] text-ink transition group-hover:text-accent">
                    {service.name}
                  </p>
                  {service.description && (
                    <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-ink-2">{service.description}</p>
                  )}
                </div>
                <div className="col-start-2 flex items-center gap-4 sm:col-start-3 sm:flex-col sm:items-end sm:gap-1">
                  <span className="whitespace-nowrap font-display text-[15px] font-semibold text-ink">
                    {priceOf(service)}
                  </span>
                  <ServiceLink href={buildWaLink(service.name)} label={ctaLabel} onTrack={trackWa(service)} />
                </div>
              </div>
            </ItemReveal>
          ))}
        </div>
      )}

      {/* ---------- daftar: kartu standar ---------- */}
      {layout === 'cards' && gridServices.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gridServices.map((service, index) => (
            <ItemReveal key={service.id} index={index}>
              <article
                onClick={() => onServiceClick(service)}
                className="lift group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-rule bg-paper shadow-xs transition hover:shadow-pop"
              >
                {service.image_url && (
                  <div className="overflow-hidden">
                    <Image
                      src={service.image_url}
                      alt={service.name}
                      width={1200}
                      height={900}
                      unoptimized
                      className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-[17px] font-semibold leading-snug tracking-[-0.01em] text-ink">
                      {service.name}
                    </h3>
                    {service.is_featured && <Star className="mt-0.5 h-4 w-4 shrink-0 fill-accent text-accent" />}
                  </div>
                  {service.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-2">{service.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="text-sm font-semibold text-ink">{priceOf(service)}</span>
                    <ServiceLink href={buildWaLink(service.name)} label={ctaLabel} onTrack={trackWa(service)} />
                  </div>
                </div>
              </article>
            </ItemReveal>
          ))}
        </div>
      )}

      {/* ---------- katalog produk ---------- */}
      {layout === 'catalog' && catalogServices.length > 0 && (
        <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {catalogServices.map((service, index) => (
            <ItemReveal key={service.id} index={index}>
              <article onClick={() => onServiceClick(service)} className="group cursor-pointer">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-rule bg-paper-2">
                  {service.image_url ? (
                    <Image
                      src={service.image_url}
                      alt={service.name}
                      width={900}
                      height={900}
                      unoptimized
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="motif-warm flex h-full w-full items-center justify-center">
                      <span className="font-display text-4xl font-bold text-ink/20">
                        {service.name.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {service.is_featured && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent backdrop-blur">
                      <Star className="h-3 w-3 fill-accent" />
                      Andalan
                    </span>
                  )}
                  {service.price !== null && service.price !== undefined && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-paper backdrop-blur">
                      {priceOf(service)}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink transition group-hover:text-accent">{service.name}</h3>
                {service.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-2">{service.description}</p>
                )}
                <ServiceLink
                  href={buildWaLink(service.name)}
                  label={ctaLabel}
                  onTrack={trackWa(service)}
                  className="mt-1.5"
                />
              </article>
            </ItemReveal>
          ))}
        </div>
      )}

      {!hasVisibleItems && (
        <p className="mt-8 rounded-2xl border border-rule bg-paper p-6 text-sm text-ink-2">
          Belum ada layanan pada kategori ini.
        </p>
      )}
    </SiteSection>
  );
}
