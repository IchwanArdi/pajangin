import type { Business } from './api';
import { toWaNumber } from './whatsapp';

/* Helper murni untuk halaman publik bisnis (dipindah dari BusinessClientView). */

export type FaqItem = { question: string; answer: string };
export type Testimonial = { name: string; rating: number | null; message: string };
export type BookingDraft = {
  name: string;
  phone: string;
  serviceName: string;
  date: string;
  time: string;
  pax: number;
  note: string;
};

export function formatPrice(
  price: number | null | undefined,
  prefix?: string | null,
  fallback = 'Tanya harga',
): string {
  if (price === null || price === undefined || !Number.isFinite(Number(price))) {
    return fallback;
  }

  const value = Number(price);
  if (value === 0) return 'Gratis';

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
  if (prefix && /^per\s/i.test(prefix)) return `${formatted} ${prefix.toLowerCase()}`;
  return `${prefix || 'Mulai dari'} ${formatted}`;
}

export function parseTestimonials(json: string | null | undefined): Testimonial[] {
  try {
    const parsed = JSON.parse(json || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((x) => x && typeof x.name === 'string' && typeof x.message === 'string')
      : [];
  } catch {
    return [];
  }
}

export function parseFaq(text: string | null): FaqItem[] {
  if (!text) return [];
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const items: FaqItem[] = [];
  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    if (lines.length === 1) {
      const line = lines[0];
      const qIndex = line.indexOf('?');
      if (qIndex >= 0) {
        items.push({
          question: line.slice(0, qIndex + 1).trim(),
          answer: line
            .slice(qIndex + 1)
            .replace(/^[:\-\s]+/, '')
            .trim(),
        });
      } else {
        items.push({ question: line, answer: '' });
      }
    } else {
      items.push({
        question: lines[0].replace(/^[-*\u2022\d.)\s]+/, ''),
        answer: lines.slice(1).join(' '),
      });
    }
  }

  return items.filter((item) => item.question && item.answer);
}

const DAY_INDEX: Record<string, number> = {
  minggu: 0,
  ahad: 0,
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  sabtu: 6,
};

function jakartaNow(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const weekday = parts.find((part) => part.type === 'weekday')?.value.toLowerCase() ?? 'mon';
  const shortDay: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);

  return {
    day: shortDay[weekday] ?? new Date().getDay(),
    minutes: hour * 60 + minute,
  };
}

function matchesDay(normalized: string, day: number): boolean {
  if (/setiap hari|tiap hari|every day|daily|24 jam/.test(normalized)) return true;

  const range = normalized.match(
    /(minggu|ahad|senin|selasa|rabu|kamis|jumat|sabtu)\s*(?:-|–|—|sampai|s\/d|hingga)\s*(minggu|ahad|senin|selasa|rabu|kamis|jumat|sabtu)/,
  );
  if (range) {
    const start = DAY_INDEX[range[1]];
    const end = DAY_INDEX[range[2]];
    if (start <= end) return day >= start && day <= end;
    return day >= start || day <= end;
  }

  const mentioned = Object.keys(DAY_INDEX).filter((name) =>
    new RegExp(`\\b${name}\\b`).test(normalized),
  );
  if (mentioned.length > 0) {
    return mentioned.some((name) => DAY_INDEX[name] === day);
  }

  if (/weekend|akhir pekan/.test(normalized)) return day === 0 || day === 6;
  if (/weekday|hari kerja/.test(normalized)) return day >= 1 && day <= 5;
  return true;
}

function inTimeRange(start: number, end: number, minutes: number): boolean {
  if (start <= end) return minutes >= start && minutes <= end;
  // Jam malam, misalnya 20.00–02.00.
  return minutes >= start || minutes <= end;
}

export function getOpenStatus(hours: string | null): { open: boolean; start: number; end: number } | null {
  if (!hours) return null;
  const normalized = hours.toLowerCase();

  const ranges = [
    ...normalized.matchAll(
      /(\d{1,2})[.:](\d{2})\s*(?:-|–|—|sampai|hingga)\s*(\d{1,2})[.:](\d{2})/g,
    ),
  ].map((match) => ({
    start: Number(match[1]) * 60 + Number(match[2]),
    end: Number(match[3]) * 60 + Number(match[4]),
  }));

  if (ranges.length === 0) return null;

  const { day, minutes } = jakartaNow();
  const todayMatches = matchesDay(normalized, day);
  const overnightFromYesterday = ranges.some(
    (range) => range.end < range.start && minutes <= range.end && matchesDay(normalized, (day + 6) % 7),
  );
  const open =
    (todayMatches && ranges.some((range) => inTimeRange(range.start, range.end, minutes))) ||
    overnightFromYesterday;

  return { open, start: ranges[0].start, end: ranges[0].end };
}

export function formatHour(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}.${String(m).padStart(2, '0')}`;
}

/* --- Pembangun tautan WhatsApp (mempertahankan teks per-template) --- */

export function buildWhatsAppLink(
  business: Business,
  opts: { serviceName?: string; actionType?: 'emergency' } = {},
): string {
  const cleanPhone = toWaNumber(business.whatsapp ?? '');
  const { serviceName, actionType } = opts;
  let text = `Halo ${business.name ?? ''}, saya menemukan profil Anda di Pajangin.`;

  if (serviceName) {
    if (business.template === 'restaurant') {
      text += ` Saya ingin memesan/reservasi menu *${serviceName}*. Apakah tersedia?`;
    } else if (business.template === 'workshop') {
      text += ` Saya butuh servis/perbaikan untuk *${serviceName}*. Boleh tanya estimasi pengerjaan dan biaya?`;
    } else if (business.template === 'salon') {
      text += ` Saya ingin reservasi treatment *${serviceName}*. Apakah ada slot kosong terdekat?`;
    } else if (business.template === 'clinic') {
      text += ` Saya ingin konsultasi / jadwal periksa untuk *${serviceName}*.`;
    } else if (business.template === 'retail') {
      text += ` Saya tertarik beli *${serviceName}*. Apakah stoknya tersedia?`;
    } else if (business.template === 'education') {
      text += ` Saya tertarik mendaftar program *${serviceName}*. Boleh info jadwal & materinya?`;
    } else {
      text += ` Saya tertarik dengan layanan *${serviceName}*. Apakah ada jadwal/estimasi biaya?`;
    }
  } else if (business.template === 'workshop' && actionType === 'emergency') {
    text += ` Saya butuh servis cepat. Apakah bisa dibantu hari ini?`;
  } else if (business.template === 'restaurant') {
    text += ` Saya ingin reservasi meja / pesan menu.`;
  } else {
    text += ' Saya ingin konsultasi layanan.';
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildConsultationLink(business: Business, name: string, phone: string, need: string): string {
  const cleanPhone = toWaNumber(business.whatsapp ?? '');
  const text = `Halo ${business.name}, saya ${name}. Saya ingin konsultasi tentang ${need || 'layanan Anda'}. Nomor saya ${phone}.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function buildBookingLink(business: Business, d: BookingDraft): string {
  const cleanPhone = toWaNumber(business.whatsapp ?? '');
  let text =
    `Halo ${business.name}, saya ingin konfirmasi booking online saya.\n\n` +
    `\u2022 Nama: ${d.name}\n` +
    `\u2022 Nomor: ${d.phone}\n` +
    `\u2022 Layanan: ${d.serviceName}\n` +
    `\u2022 Tanggal: ${d.date}\n` +
    `\u2022 Jam: ${d.time} WIB`;
  if (d.pax && d.pax > 1) text += `\n\u2022 Tamu: ${d.pax} orang`;
  text += `\n\u2022 Catatan: ${d.note || '-'}\n\nMohon dikonfirmasi jadwalnya ya, terima kasih!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/* --- Judul & label per template --- */

export function serviceHeadingFor(templateId?: string | null): { title: string; sub: string } {
  switch (templateId) {
    case 'restaurant':
      return { title: 'Daftar Menu & Sajian', sub: 'Pilihan menu yang tersedia. Tanyakan ketersediaan dan cara pemesanan via WhatsApp.' };
    case 'workshop':
      return { title: 'Layanan Servis & Perbaikan', sub: 'Daftar pengerjaan dan estimasi biaya. Hubungi kami untuk detail dan ketersediaan.' };
    case 'salon':
      return { title: 'Layanan Perawatan', sub: 'Pilihan perawatan yang tersedia. Silakan tanyakan jadwal dan detail treatment.' };
    case 'clinic':
      return { title: 'Layanan & Jadwal Konsultasi', sub: 'Informasi layanan dan jadwal. Hubungi kami untuk detail dan ketersediaan.' };
    case 'retail':
      return { title: 'Katalog Produk', sub: 'Produk yang tersedia di etalase. Tanyakan stok dan pengiriman via WhatsApp.' };
    case 'education':
      return { title: 'Program Kelas & Pelatihan', sub: 'Program yang tersedia. Tanyakan jadwal, materi, dan biaya via WhatsApp.' };
    default:
      return { title: 'Layanan & Harga', sub: 'Pilih layanan yang Anda butuhkan, lalu lanjutkan konsultasi via WhatsApp.' };
  }
}

export function serviceCtaLabelFor(templateId?: string | null): string {
  switch (templateId) {
    case 'restaurant': return 'Pesan Menu';
    case 'workshop': return 'Konsultasi Servis';
    case 'salon': return 'Booking Treatment';
    case 'clinic': return 'Jadwal Periksa';
    case 'retail': return 'Order Produk';
    case 'education': return 'Daftar Kelas';
    default: return 'Tanya WA';
  }
}

export function primaryCtaLabelFor(templateId?: string | null): string {
  switch (templateId) {
    case 'restaurant': return 'Reservasi / Pesan Meja';
    case 'workshop': return 'Tanya Estimasi Biaya';
    case 'salon': return 'Booking Jadwal Treatment';
    case 'clinic': return 'Konsultasi & Periksa';
    case 'retail': return 'Beli via WhatsApp';
    case 'education': return 'Daftar / Konsultasi Kelas';
    default: return 'Konsultasi via WhatsApp';
  }
}

export function stickyCtaLabelFor(templateId?: string | null): string {
  switch (templateId) {
    case 'restaurant': return 'Pesan / Reservasi WA';
    case 'workshop': return 'Tanya Servis';
    case 'salon': return 'Booking Treatment';
    case 'clinic': return 'Konsultasi WA';
    case 'retail': return 'Order via WA';
    case 'education': return 'Daftar Kelas WA';
    default: return 'Chat WhatsApp';
  }
}

export function galleryHeadingFor(templateId?: string | null): string {
  const map: Record<string, string> = {
    restaurant: 'Menu & Foto Hidangan',
    workshop: 'Galeri Hasil Kerja',
    salon: 'Portofolio & Hasil Treatment',
    clinic: 'Fasilitas & Ruang Praktik',
    retail: 'Katalog Produk',
    education: 'Suasana Kelas & Kegiatan',
  };
  return map[templateId ?? ''] || 'Galeri Foto';
}

export function bookingHeadingFor(templateId?: string | null): string {
  switch (templateId) {
    case 'restaurant': return 'Reservasi Meja & Pemesanan';
    case 'salon': return 'Booking Treatment & Jadwal';
    case 'workshop': return 'Booking Servis';
    case 'clinic': return 'Reservasi Jadwal Konsultasi';
    default: return 'Booking Cepat & Reservasi';
  }
}
