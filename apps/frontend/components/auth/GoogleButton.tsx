'use client';

import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import { authErrorMessage } from '../../lib/auth-errors';
import { secondaryButtonClass } from './AuthShell';

// Login / daftar dengan Google (Supabase OAuth). Setelah sukses kembali ke /auth/callback.
export default function GoogleButton({ next, label = 'Lanjutkan dengan Google', onError }: { next: string; label?: string; onError: (message: string) => void }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    // sukses = browser diarahkan ke Google; sampai sini hanya kalau gagal
    if (error) {
      onError(authErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={`${secondaryButtonClass} inline-flex items-center justify-center gap-2.5`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.11A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11Z" />
        <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.26 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z" />
      </svg>
      {loading ? 'Mengarahkan ke Google…' : label}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-ink-2">
      <span className="h-px flex-1 bg-rule" />
      atau
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}
