import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '../../../lib/supabase/server';
import { safeNext } from '../../../lib/safe-next';

// Titik balik semua link Supabase Auth:
// - konfirmasi email setelah daftar
// - login Google (OAuth)
// - link reset password (next=/reset-password)
// Mendukung alur PKCE (?code=) dan token hash (?token_hash=&type=).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = safeNext(searchParams.get('next'));
  const error = searchParams.get('error');
  const errorCode = searchParams.get('error_code') || '';
  const errorDescription = (searchParams.get('error_description') || '').toLowerCase();

  const loginError = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}`);

  // Supabase meneruskan error di query (link email rusak, OAuth dibatalkan, dll).
  if (error) {
    const isEmailLinkError =
      errorCode.includes('otp') ||
      errorDescription.includes('email link') ||
      errorDescription.includes('expired');

    if (error === 'access_denied' && !isEmailLinkError) return loginError('oauth_cancelled');
    if (isEmailLinkError) return loginError(next === '/reset-password' ? 'reset_link_invalid' : 'link_invalid');
    return loginError('auth_failed');
  }

  const supabase = await createClient();

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) return NextResponse.redirect(`${origin}${next}`);
  } else if (tokenHash && type) {
    const { error: otpError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!otpError) return NextResponse.redirect(`${origin}${next}`);
  }

  // Gagal: link sudah dipakai, kedaluwarsa, atau dibuka di browser/perangkat lain
  return loginError(next === '/reset-password' ? 'reset_link_invalid' : 'link_invalid');
}
