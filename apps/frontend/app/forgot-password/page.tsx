'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../../lib/supabase/client';
import { authErrorMessage } from '../../lib/auth-errors';
import AuthShell, { AuthAlert, authInputClass, authLabelClass, authPrimaryButtonClass } from '../../components/auth/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const { error } = await createClient().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    // Selalu tampilkan pesan yang sama (tidak membocorkan apakah email terdaftar),
    // kecuali error teknis seperti rate limit.
    if (error && error.status !== 400 && error.status !== 404) {
      setErrorMessage(authErrorMessage(error));
      return;
    }
    setSent(true);
  };

  return (
    <AuthShell
      title={sent ? 'Cek email Anda' : 'Lupa kata sandi?'}
      subtitle={
        sent
          ? 'Jika email tersebut terdaftar, kami telah mengirim link untuk membuat kata sandi baru. Link berlaku 1 jam.'
          : 'Masukkan email akun Anda. Kami akan mengirim link untuk membuat kata sandi baru.'
      }
      footer={
        <p>
          Ingat kata sandi?{' '}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Kembali masuk
          </Link>
        </p>
      }
    >
      {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}

      {sent ? (
        <div className="space-y-4 text-sm text-paper/65">
          <p>Tidak menemukan email? Cek folder <strong>Spam</strong>, atau coba lagi dalam beberapa menit.</p>
          <button type="button" onClick={() => setSent(false)} className="font-semibold text-accent hover:underline">
            Kirim ke email lain
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={authLabelClass}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="budi@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
            />
          </div>
          <button type="submit" disabled={loading} className={authPrimaryButtonClass}>
            {loading ? 'Mengirim…' : 'Kirim link reset'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
