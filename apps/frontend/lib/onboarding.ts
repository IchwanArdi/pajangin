/* Helper murni untuk wizard onboarding.
 * Isian disimpan di localStorage per akun + mode (bisnis pertama / tambah bisnis),
 * supaya user tidak kehilangan data saat refresh atau pindah tab. */

export type OnboardingStep = 1 | 2 | 3;

export interface DraftService {
  name: string;
  price: string;
  description: string;
}

export interface OnboardingDraft {
  version: 1;
  step: OnboardingStep;
  businessName: string;
  category: string;
  city: string;
  address: string;
  whatsapp: string;
  tagline: string;
  description: string;
  services: DraftService[];
}

export const ONBOARDING_DRAFT_VERSION = 1 as const;
export const MAX_ONBOARDING_SERVICES = 3;

const SERVICE_SUGGESTIONS: Record<string, string[]> = {
  'Bengkel & Otomotif': ['Servis rutin', 'Ganti oli', 'Tune up'],
  'Kedai Kopi & Cafe': ['Kopi signature', 'Minuman non-kopi', 'Camilan'],
  'Restoran & Kuliner': ['Menu andalan', 'Paket keluarga', 'Minuman'],
  Laundry: ['Cuci kering', 'Setrika', 'Cuci express'],
  'Salon & Barbershop': ['Potong rambut', 'Cukur jenggot', 'Cuci & styling'],
  'Kecantikan & Spa': ['Facial', 'Massage', 'Perawatan tubuh'],
  'Kesehatan & Klinik': ['Konsultasi umum', 'Pemeriksaan', 'Tindakan ringan'],
  'Pendidikan & Kursus': ['Kelas reguler', 'Kelas privat', 'Try out'],
  'Jasa Rumah Tangga': ['Bersih rumah', 'Servis AC', 'Perbaikan ringan'],
  'Toko & Retail': ['Produk utama', 'Paket hemat', 'Layanan antar'],
  Lainnya: ['Layanan utama', 'Layanan tambahan', 'Konsultasi'],
};

export function emptyServiceDraft(): DraftService {
  return { name: '', price: '', description: '' };
}

export function serviceSuggestions(category: string): string[] {
  return SERVICE_SUGGESTIONS[category] ?? SERVICE_SUGGESTIONS.Lainnya;
}

// Slug hanya untuk pratinjau. Backend tetap pembuat slug final (termasuk penanganan nama yang sudah dipakai).
export function slugPreview(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'bisnis-anda';
}

// Deskripsi awal yang faktual, tanpa klaim atau testimoni karangan.
export function defaultDescription(name: string, city: string): string {
  const safeName = name.trim() || 'Bisnis ini';
  const safeCity = city.trim() || 'lokasi Anda';
  return `${safeName} melayani pelanggan di ${safeCity}. Hubungi via WhatsApp untuk menanyakan layanan, ketersediaan, dan harga.`;
}

export function draftStorageKey(userId: string, mode: 'first' | 'add'): string {
  return `pajangin.onboarding.v1:${userId}:${mode}`;
}

export function hasDraftContent(draft: OnboardingDraft): boolean {
  return Boolean(
    draft.step > 1 ||
      draft.businessName.trim() ||
      draft.city.trim() ||
      draft.address.trim() ||
      draft.whatsapp.trim() ||
      draft.tagline.trim() ||
      draft.description.trim() ||
      draft.services.some((service) => service.name.trim() || service.price.trim() || service.description.trim()),
  );
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function readOnboardingDraft(key: string | null): OnboardingDraft | null {
  if (!key || typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<OnboardingDraft> | null;
    if (!parsed || parsed.version !== ONBOARDING_DRAFT_VERSION) return null;

    const rawServices = Array.isArray(parsed.services) ? parsed.services : [];
    const services = rawServices
      .slice(0, MAX_ONBOARDING_SERVICES)
      .map((service) => ({
        name: asString(service?.name),
        price: asString(service?.price),
        description: asString(service?.description),
      }));

    const step: OnboardingStep = parsed.step === 2 || parsed.step === 3 ? parsed.step : 1;

    return {
      version: ONBOARDING_DRAFT_VERSION,
      step,
      businessName: asString(parsed.businessName),
      category: asString(parsed.category),
      city: asString(parsed.city),
      address: asString(parsed.address),
      whatsapp: asString(parsed.whatsapp),
      tagline: asString(parsed.tagline),
      description: asString(parsed.description),
      services: services.length > 0 ? services : [emptyServiceDraft()],
    };
  } catch {
    return null;
  }
}

export function writeOnboardingDraft(key: string, draft: OnboardingDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // localStorage bisa diblokir di mode privat; onboarding tetap berjalan tanpa draft.
  }
}

export function clearOnboardingDraft(key: string | null): void {
  if (!key || typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Diamkan: kegagalan menghapus draft tidak boleh menghalangi pembuatan bisnis.
  }
}
