'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { authErrorMessage } from '../../lib/auth-errors';
import { safeNext } from '../../lib/safe-next';
import AuthShell, { FormAlert, inputClass, labelClass, primaryButtonClass } from '../../components/auth/AuthShell';
import PasswordInput from '../../components/auth/PasswordInput';
import GoogleButton, { OrDivider } from '../../components/auth/GoogleButton';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const NOTICES: Record<string, { tone: 'error' | 'info'; text: string }> = {
  session_expired: { tone: 'info', text: 'Sesi Anda telah berakhir. Silakan masuk kembali.' },
  password_updated: { tone: 'info', text: 'Kata sandi berhasil diperbarui. Silakan masuk dengan kata sandi baru.' },
  link_invalid: {
    tone: 'error',
    text: 'Link sudah kedaluwarsa, sudah pernah dipakai, atau dibuka di browser berbeda. Jika email Anda sudah terverifikasi, silakan masuk. Jika belum, masuk untuk mengirim ulang link verifikasi.',
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const notice = NOTICES[searchParams.get('reason') || searchParams.get('error') || ''];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setNeedsVerification(false);
    setLoading(true);

    const { error } = await createClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setErrorMessage(authErrorMessage(error));
      setNeedsVerification(error.code === 'email_not_confirmed');
      setLoading(false);
      return;
    }

    router.replace(next);
    router.refresh();
  };

  const handleResend = async () => {
    setResendState('sending');
    const { error } = await createClient().auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding` },
    });
    if (error) {
      setErrorMessage(authErrorMessage(error));
      setResendState('idle');
      return;
    }
    setResendState('sent');
  };

  return (
    <AuthShell
      title="Masuk ke akun Anda"
      subtitle="Kelola halaman bisnis, layanan, dan analitik Anda dari satu tempat."
      footer={
        <p>
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-accent hover:underline">
            Daftar gratis
          </Link>
        </p>
      }
    >
      {notice && !errorMessage && <FormAlert tone={notice.tone}>{notice.text}</FormAlert>}

      {errorMessage && (
        <FormAlert>
          <p>{errorMessage}</p>
          {needsVerification && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState !== 'idle'}
              className="mt-2 font-semibold text-accent hover:underline disabled:opacity-60"
            >
              {resendState === 'sent' ? 'Link verifikasi terkirim ✓' : resendState === 'sending' ? 'Mengirim…' : 'Kirim ulang link verifikasi'}
            </button>
          )}
        </FormAlert>
      )}

      <GoogleButton next={next} onError={setErrorMessage} />
      <OrDivider />

      <form onSubmit={handleLogin} className="space-y-4" noValidate={false}>
        <div>
          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="budi@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium text-ink-2">Kata sandi</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-accent hover:underline">
              Lupa kata sandi?
            </Link>
          </div>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? 'Memeriksa akun…' : 'Masuk'}
        </button>
      </form>
    </AuthShell>
  );
}
