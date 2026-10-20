// Helper query admin: semua nilai dari URL berbentuk string, jadi parsing dan
// batas aman dipusatkan di sini agar service tidak menduplikasi validasi.
export const ADMIN_DEFAULT_PAGE_SIZE = 20;
export const ADMIN_MAX_PAGE_SIZE = 100;

export function parsePage(value: unknown): number {
  const parsed = Number.parseInt(String(value ?? '1'), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function parseLimit(value: unknown, fallback = ADMIN_DEFAULT_PAGE_SIZE): number {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), ADMIN_MAX_PAGE_SIZE);
}

export function parseText(value: unknown, maxLength = 120): string {
  return String(value ?? '').trim().slice(0, maxLength);
}

export function parseEnum<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  const normalized = String(value ?? '').trim().toLowerCase();
  return (allowed as readonly string[]).includes(normalized) ? (normalized as T) : undefined;
}

export function totalPages(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / limit));
}

export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
