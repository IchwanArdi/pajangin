// Terjemahkan error Supabase Auth ke Bahasa Indonesia yang ramah
export function authErrorMessage(error: { message?: string; code?: string } | null | undefined): string {
  if (!error) return '';
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();

  if (code === 'invalid_credentials' || msg.includes('invalid login credentials')) {
    return 'Email atau kata sandi tidak sesuai.';
  }
  if (code === 'email_not_confirmed' || msg.includes('email not confirmed')) {
    return 'Email Anda belum diverifikasi. Cek kotak masuk (atau folder spam) dan klik link verifikasi.';
  }
  if (code === 'user_already_exists' || msg.includes('already registered')) {
    return 'Email ini sudah terdaftar. Silakan masuk.';
  }
  if (code === 'weak_password' || msg.includes('password should')) {
    return 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter dengan kombinasi huruf dan angka.';
  }
  if (code === 'same_password') {
    return 'Kata sandi baru harus berbeda dari kata sandi lama.';
  }
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || msg.includes('rate limit')) {
    return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
  }
  if (code === 'validation_failed' && msg.includes('email')) {
    return 'Format email tidak valid.';
  }
  if (msg.includes('provider is not enabled') || code === 'provider_disabled') {
    return 'Login dengan Google belum diaktifkan. Silakan gunakan email dan kata sandi.';
  }
  if (msg.includes('failed to fetch') || msg.includes('network')) {
    return 'Tidak bisa terhubung ke server. Periksa koneksi internet Anda.';
  }
  return 'Terjadi kesalahan. Silakan coba lagi.';
}
