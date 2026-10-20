'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { BusinessImageItem } from '../../lib/api';
import { ItemReveal } from './reveal-item';
import { SectionIntro, SiteSection, type SiteTone } from './site-ui';

interface Props {
  images: BusinessImageItem[];
  heading: string;
  tone?: SiteTone;
}

/** Pola bento: foto pertama jadi sorotan besar, sesekali ada tile lebar. */
function tileSpan(index: number, total: number): string {
  if (index === 0) return 'col-span-2 row-span-2';
  if ((index === 3 || index === 5) && total > 4) return 'col-span-2';
  return '';
}

export default function GallerySection({ images, heading, tone = 'plain' }: Props) {
  const [galleryTab, setGalleryTab] = useState<string>('Semua');
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const imageCategories = useMemo(() => {
    const cats = Array.from(new Set(images.map((image) => image.category).filter(Boolean))) as string[];
    return cats.length > 0 ? ['Semua', ...cats] : [];
  }, [images]);

  const visibleImages = useMemo(() => {
    if (galleryTab === 'Semua') return images;
    return images.filter((image) => image.category === galleryTab);
  }, [images, galleryTab]);

  // navigasi keyboard + kunci scroll saat lightbox terbuka
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxIdx(null);
      else if (event.key === 'ArrowLeft') setLightboxIdx((prev) => (prev === null ? prev : prev > 0 ? prev - 1 : visibleImages.length - 1));
      else if (event.key === 'ArrowRight') setLightboxIdx((prev) => (prev === null ? prev : prev < visibleImages.length - 1 ? prev + 1 : 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIdx, visibleImages.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxIdx]);

  const current = lightboxIdx !== null ? visibleImages[lightboxIdx] : null;

  return (
    <SiteSection id="galeri" tone={tone}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <SectionIntro
          eyebrow="Dokumentasi & Visual"
          title={heading}
          sub="Suasana, fasilitas, dan hasil kerja — apa adanya."
        />
        {imageCategories.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {imageCategories.map((cat) => {
              const activeTab = galleryTab === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setGalleryTab(cat);
                    setLightboxIdx(null);
                  }}
                  aria-pressed={activeTab}
                  className={[
                    'press rounded-full border px-3.5 py-1.5 text-xs font-semibold',
                    activeTab
                      ? 'border-ink bg-ink text-paper'
                      : 'border-rule bg-paper text-ink-2 hover:border-ink/30 hover:text-ink',
                  ].join(' ')}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-8 grid auto-rows-[9.5rem] grid-flow-dense grid-cols-2 gap-2.5 sm:auto-rows-[12rem] sm:gap-3 md:auto-rows-[13.5rem] md:grid-cols-4">
        {visibleImages.map((image, index) => (
          <ItemReveal key={image.id || index} index={index} className={tileSpan(index, visibleImages.length)}>
            <button
              type="button"
              onClick={() => setLightboxIdx(index)}
              aria-label={image.caption ? `Perbesar: ${image.caption}` : 'Perbesar foto'}
              className="group relative h-full w-full cursor-zoom-in overflow-hidden rounded-2xl bg-paper-2"
            >
              <Image
                src={image.url}
                alt={image.caption || 'Foto bisnis'}
                width={1400}
                height={1050}
                unoptimized
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <span className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-left opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                {image.caption && <span className="line-clamp-2 block text-sm font-medium text-white">{image.caption}</span>}
                {image.category && (
                  <span className="mt-1 block font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-white/60">
                    {image.category}
                  </span>
                )}
              </span>
              {index === 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink backdrop-blur">
                  Sorotan
                </span>
              )}
            </button>
          </ItemReveal>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={current.caption || 'Pratinjau foto'}
            initial={reduce ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIdx(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          >
            <button
              type="button"
              onClick={() => setLightboxIdx(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20"
              aria-label="Tutup"
            >
              <X className="h-6 w-6" />
            </button>

            {visibleImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightboxIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : visibleImages.length - 1));
                  }}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20 md:left-4"
                  aria-label="Sebelumnya"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setLightboxIdx((prev) => (prev !== null && prev < visibleImages.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm transition hover:bg-white/20 md:right-4"
                  aria-label="Selanjutnya"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="flex max-h-[90vh] max-w-4xl flex-col items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={current.url}
                alt={current.caption || 'Foto preview'}
                width={1600}
                height={1200}
                unoptimized
                className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <div className="mt-4 flex w-full items-center justify-between gap-4 px-2 text-white/90">
                <div className="text-left">
                  {current.caption && <p className="text-sm font-medium">{current.caption}</p>}
                  {current.category && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">{current.category}</span>
                  )}
                </div>
                <span className="font-mono text-xs whitespace-nowrap text-white/60">
                  {(lightboxIdx ?? 0) + 1} / {visibleImages.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteSection>
  );
}
