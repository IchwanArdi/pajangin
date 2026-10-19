'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <h1 className="text-2xl font-black text-ink">Terjadi kesalahan</h1>
        <p className="text-sm text-ink-2">Maaf, ada yang tidak beres. Silakan coba muat ulang halaman.</p>
        <button onClick={reset} className="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-ink transition hover:opacity-90">
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
