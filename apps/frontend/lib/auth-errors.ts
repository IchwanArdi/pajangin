// Terjemahkan error Supabase Auth ke Bahasa Indonesia yang ramah.
// Login Pajangin hanya memakai Google OAuth, jadi pesan difokuskan ke alur itu.
export function authErrorMessage(error: { message?: string; code?: string } | null | undefined): string {
  if (!error) return '';
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();

  if (code === 'provider_disabled' || msg.includes('provider is not enabled')) {
    return 'Login dengan Google belum diaktifkan. Hubungi admin Pajangin.';
  }
  if (code === 'access_denied' || msg.includes('access denied')) {
    return 'Login dengan Google dibatalkan.';
  }
  if (code === 'over_request_rate_limit' || msg.includes('rate limit')) {
    return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Tidak bisa terhubung ke server. Periksa koneksi internet Anda.';
  }
  return 'Login dengan Google gagal. Coba lagi.';
}
