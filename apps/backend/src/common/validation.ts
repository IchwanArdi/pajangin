import { BadRequestException } from '@nestjs/common';

// URL dari user hanya boleh http/https. Ini mencegah "javascript:" dan data: URL
// yang bisa berubah menjadi XSS saat dirender sebagai link/gambar.
export function normalizeHttpUrl(value: unknown, field = 'URL'): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new BadRequestException(`${field} tidak valid.`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException(`${field} harus diawali http:// atau https://.`);
  }

  return parsed.toString();
}

// Warna aksen hanya hex 3/6 digit. Nilai aneh jangan disimpan ke database.
export function normalizeHexColor(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const raw = String(value).trim();
  if (!raw) return null;
  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) {
    throw new BadRequestException('Warna aksen harus berupa kode hex, misalnya #e85d3a.');
  }
  return raw.toLowerCase();
}

export function normalizeRating(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const n = Number(value);
  if (!Number.isFinite(n) || n < 1 || n > 5) {
    throw new BadRequestException('Rating harus berupa angka antara 1 sampai 5.');
  }
  return Math.round(n * 10) / 10;
}

export function normalizeReviewCount(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000) {
    throw new BadRequestException('Jumlah ulasan harus berupa bilangan bulat yang valid.');
  }
  return n;
}

export function clipText(value: unknown, max: number): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s ? s.slice(0, max) : null;
}
