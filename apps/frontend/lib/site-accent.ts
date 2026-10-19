import type { CSSProperties } from 'react';
import { getTemplateConfig } from './templates';

/**
 * Sistem warna aksen halaman bisnis.
 *
 * Sebelumnya halaman publik menimpa `--color-accent` saja, sehingga
 * `accent-soft` / `accent-ink` / ring tetap memakai coral default dan
 * tidak selaras untuk bisnis beraksen biru/hijau. Di sini seluruh
 * turunan aksen dibuat dari satu warna pilihan pemilik bisnis.
 */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB = /^rgba?\([\d\s.,%]+\)$/i;

/** Terima hex/rgb yang valid; selain itu pakai aksen default template. */
export function normalizeAccent(value: string | null | undefined, templateId?: string | null): string {
  const trimmed = (value ?? '').trim();
  if (HEX.test(trimmed) || RGB.test(trimmed)) return trimmed;
  return getTemplateConfig(templateId).defaultAccent;
}

/** Variabel CSS turunan aksen, dipasang pada elemen pembungkus halaman. */
export function accentVars(accent: string): CSSProperties {
  return {
    '--color-accent': accent,
    '--color-focus': accent,
    '--color-accent-ink': '#ffffff',
    '--color-accent-soft': `color-mix(in oklab, ${accent} 12%, white)`,
  } as CSSProperties;
}
