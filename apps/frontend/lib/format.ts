import {
  Camera,
  Globe,
  Link as LinkIcon,
  MessageCircle,
  Music2,
  Search,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react';

const nf = new Intl.NumberFormat('id-ID');

export function formatNumber(n: number): string {
  return nf.format(n);
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toLocaleString('id-ID', { maximumFractionDigits: digits })}%`;
}

export function formatRupiah(n: number | null | undefined): string {
  if (!n) return '';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

// "2026-10-07" → "7 Okt"
export function formatShortDate(isoDay: string): string {
  const d = new Date(`${isoDay}T12:00:00+07:00`);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' });
}

// "2026-10-07" → "Selasa, 7 Oktober"
export function formatLongDate(isoDay: string): string {
  const d = new Date(`${isoDay}T12:00:00+07:00`);
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Jakarta' });
}

// "baru saja", "3 mnt lalu", "2 jam lalu", "kemarin", "5 Okt"
export function formatRelative(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'kemarin';
  if (day < 7) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// Sumber traffic → label & ikon yang dimengerti pemilik usaha
const SOURCES: Record<string, { label: string; icon: LucideIcon }> = {
  google: { label: 'Google', icon: Search },
  instagram: { label: 'Instagram', icon: Camera },
  tiktok: { label: 'TikTok', icon: Music2 },
  facebook: { label: 'Facebook', icon: ThumbsUp },
  whatsapp: { label: 'WhatsApp', icon: MessageCircle },
  direct: { label: 'Langsung / link', icon: LinkIcon },
  other: { label: 'Situs lain', icon: Globe },
};

export function sourceMeta(key: string): { label: string; icon: LucideIcon } {
  const k = key.toLowerCase();
  return SOURCES[k] ?? { label: key.charAt(0).toUpperCase() + key.slice(1), icon: Globe };
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') || 'B'
  );
}
