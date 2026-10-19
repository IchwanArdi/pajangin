import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Supabase client untuk Server Components & Route Handlers
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Dipanggil dari Server Component (tidak bisa set cookie) — aman diabaikan,
            // karena proxy.ts yang menyegarkan sesi di setiap request.
          }
        },
      },
    },
  );
}
