// Allowlist admin dipakai backend (guard) dan frontend (nampilkan tautan console).
// Jangan pernah mengandalkan pengecekan di frontend untuk otorisasi.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.length > 0 && allowed.includes(email.toLowerCase());
}
