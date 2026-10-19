'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import type { BusinessImageItem } from '../../lib/api';
import { Reveal } from '../../app/reveal';
import { SectionIntro, SiteSection } from './site-ui';

interface Props {
  images: BusinessImageItem[];
  heading: string;
  tone?: 'paper' | 'alt';
}

export default function GallerySection({ images, heading, tone = 'paper' }: Props) {
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
          icon={ImageIcon}
          eyebrow="Dokumentasi & Visual"
          title={heading}
          sub="Lihat suasana, fasilitas, dan kualitas hasil kerja kami secara langsung."
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
                    'press rounded-full px-3.5 py-1.5 text-xs font-semibold',
                    activeTab ? 'bg-ink text-paper' : 'border border-rule bg-paper text-ink-2 hover:border-ink hover:text-ink',
                  ].join(' ')}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Reveal className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4" stagger={0.04}>
        {visibleImages.map((image, index) => (
          <button
            key={image.id || index}
            type="button"
            onClick={() => setLightboxIdx(index)}
            aria-label={image.caption ? `Perbesar: ${image.caption}` : 'Perbesar foto'}
            className="group relative aspect-4/3 cursor-zoom-in overflow-hidden rounded-2xl border border-rule bg-paper shadow-xs transition hover:shadow-md"
          >
            <Image
              src={image.url}
              alt={image.caption || 'Foto bisnis'}
              width={1200}
              height={900}
              unoptimized
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/75 via-transparent to-transparent p-3 text-left text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {image.caption && <span className="line-clamp-2 text-xs font-medium">{image.caption}</span>}
              {image.category && (
                <span className="mt-1 self-start rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium backdrop-blur-xs">{image.category}</span>
              )}
            </span>
          </button>
        ))}
      </Reveal>

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
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
              <div className="mt-4 flex w-full items-center justify-between gap-4 px-2 text-white/90">
                <div className="text-left">
                  {current.caption && <p className="text-sm font-medium">{current.caption}</p>}
                  {current.category && <span className="text-xs text-white/60">{current.category}</span>}
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
