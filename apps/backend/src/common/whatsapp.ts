import { BadRequestException } from '@nestjs/common';

// Normalisasi nomor WhatsApp Indonesia ke format internasional tanpa "+" (yang dibutuhkan wa.me).
// Contoh: "0812-3456-7890" → "6281234567890", "+62 812 3456 7890" → "6281234567890", "812..." → "62812..."
export function normalizeWhatsapp(input: unknown): string {
  let digits = String(input ?? '').replace(/\D/g, '');

  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith('8')) digits = `62${digits}`;

  // nomor ponsel Indonesia: 62 + 8xx + 7–11 digit → total 10–15 digit (E.164 maks 15)
  if (!/^628\d{7,11}$/.test(digits) && !/^(?!62)[1-9]\d{9,14}$/.test(digits)) {
    throw new BadRequestException(
      'Nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxxx atau +62xxxxxxxxxx.',
    );
  }
  return digits;
}
