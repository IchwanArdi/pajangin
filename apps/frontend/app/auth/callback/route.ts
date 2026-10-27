import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { safeNext } from '../../../lib/safe-next';

// Titik balik login Google (Supabase OAuth).
// Mendukung alur PKCE (?code=) dan meneruskan error OAuth ke halaman login.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));
  const error = searchParams.get('error');

  const loginError = (reason: string) =>
    NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(reason)}&next=${encodeURIComponent(next)}`,
    );

  // Google mengirim error ketika pengguna menutup atau menolak layar consent.
  if (error) {
    return loginError(error === 'access_denied' ? 'oauth_cancelled' : 'auth_failed');
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchangeError) return NextResponse.redirect(`${origin}${next}`);
  }

  // Gagal: kode sudah dipakai, kedaluwarsa, atau callback dibuka tanpa kode.
  return loginError('auth_failed');
}
