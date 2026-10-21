'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { authErrorMessage } from '../../lib/auth-errors';
import AuthShell, { AuthAlert, authLabelClass, authPrimaryButtonClass } from '../../components/auth/AuthShell';
import PasswordInput from '../../components/auth/PasswordInput';

const MIN_PASSWORD = 8;

// Dibuka dari link email "reset password" → /auth/callback membuat sesi recovery → halaman ini.
// proxy.ts memastikan hanya user dengan sesi aktif yang bisa membuka halaman ini.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < MIN_PASSWORD) {
      setErrorMessage(`Kata sandi minimal ${MIN_PASSWORD} karakter.`);
      return;
    }
    if (password !== confirm) {
      setErrorMessage('Konfirmasi kata sandi tidak sama.');
      return;
    }

    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setErrorMessage(authErrorMessage(error));
      return;
    }

    router.replace('/dashboard');
    router.refresh();
  };

  return (
    <AuthShell title="Buat kata sandi baru" subtitle="Gunakan minimal 8 karakter. Setelah disimpan Anda langsung masuk ke dashboard.">
      {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className={authLabelClass}>Kata sandi baru</label>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={MIN_PASSWORD} />
        </div>
        <div>
          <label htmlFor="confirm" className={authLabelClass}>Ulangi kata sandi baru</label>
          <PasswordInput id="confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" minLength={MIN_PASSWORD} />
        </div>
        <button type="submit" disabled={loading} aria-busy={loading} className={authPrimaryButtonClass}>
          {loading ? 'Menyimpan…' : 'Simpan kata sandi'}
        </button>
      </form>
    </AuthShell>
  );
}
