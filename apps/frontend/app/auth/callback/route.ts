import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { safeNext } from '../../../lib/safe-next';
import { ACQUISITION_COOKIE, AUTH_EVENT_COOKIE, parseAcquisition } from '../../../lib/acquisition';

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
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const user = data.user;

      // Simpan atribusi first-touch ke metadata auth user. Ini membuat sumber
      // pendaftaran tetap terbaca setelah redirect Google OAuth.
      const acquisition = parseAcquisition(request.cookies.get(ACQUISITION_COOKIE)?.value);
      if (user && acquisition && !user.user_metadata?.acquisition) {
        try {
          await supabase.auth.updateUser({ data: { acquisition } });
        } catch {
          // Kegagalan metadata tidak boleh menggagalkan login.
        }
      }

      const createdAt = user?.created_at ? new Date(user.created_at).getTime() : 0;
      const isNewUser = createdAt > 0 && Date.now() - createdAt < 5 * 60 * 1000;
      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.set(AUTH_EVENT_COOKIE, isNewUser ? 'sign_up' : 'login', {
        path: '/',
        maxAge: 300,
        sameSite: 'lax',
        httpOnly: false,
        secure: request.nextUrl.protocol === 'https:',
      });
      return response;
    }
  }

  // Gagal: kode sudah dipakai, kedaluwarsa, atau callback dibuka tanpa kode.
  return loginError('auth_failed');
}
