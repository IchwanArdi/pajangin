import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Halaman yang wajib login
const PROTECTED = ['/dashboard', '/onboarding', '/reset-password'];
// Halaman tamu — user yang sudah login langsung diarahkan ke dashboard
const GUEST_ONLY = ['/login', '/register', '/forgot-password'];

const matches = (pathname: string, list: string[]) =>
  list.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Menyegarkan sesi Supabase (refresh token → cookie baru) di setiap request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // getClaims() memverifikasi JWT (JWKS) — jangan pakai getSession() di server
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    const [p, q] = path.split('?');
    url.pathname = p;
    url.search = q ? `?${q}` : '';
    const res = NextResponse.redirect(url);
    // bawa cookie sesi yang mungkin baru di-refresh
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!isLoggedIn && matches(pathname, PROTECTED)) {
    return redirectTo(`/login?next=${encodeURIComponent(pathname + search)}`);
  }

  if (isLoggedIn && matches(pathname, GUEST_ONLY)) {
    return redirectTo('/dashboard');
  }

  return response;
}

export const config = {
  matcher: [
    // semua path kecuali aset statis & gambar
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
