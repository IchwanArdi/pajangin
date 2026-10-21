'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { authErrorMessage } from '../../lib/auth-errors';
import { safeNext } from '../../lib/safe-next';
import AuthShell, { AuthAlert, authInputClass, authLabelClass, authPrimaryButtonClass } from '../../components/auth/AuthShell';
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
    text: 'Link verifikasi tidak valid, sudah kedaluwarsa, atau dibuka di browser berbeda. Masuk untuk mengirim ulang link verifikasi.',
  },
  reset_link_invalid: {
    tone: 'error',
    text: 'Link reset kata sandi sudah kedaluwarsa atau sudah dipakai. Minta link baru dari halaman Lupa kata sandi.',
  },
  oauth_cancelled: {
    tone: 'info',
    text: 'Login dengan Google dibatalkan. Silakan coba lagi atau masuk dengan email.',
  },
  auth_failed: {
    tone: 'error',
    text: 'Login tidak bisa diselesaikan. Coba lagi, atau masuk dengan email dan kata sandi.',
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
      eyebrow="Selamat datang kembali"
      title="Masuk ke dashboard bisnis Anda"
      subtitle="Kelola halaman, layanan, dan pesan WhatsApp dari satu tempat."
      footer={
        <p>
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-accent underline-offset-4 hover:underline">
            Daftar gratis
          </Link>
        </p>
      }
    >
      {notice && !errorMessage && <AuthAlert tone={notice.tone}>{notice.text}</AuthAlert>}

      {errorMessage && (
        <AuthAlert>
          <p>{errorMessage}</p>
          {needsVerification && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendState !== 'idle'}
              className="mt-2 font-semibold text-accent underline-offset-4 hover:underline disabled:opacity-60"
            >
              {resendState === 'sent' ? 'Link verifikasi terkirim ✓' : resendState === 'sending' ? 'Mengirim…' : 'Kirim ulang link verifikasi'}
            </button>
          )}
        </AuthAlert>
      )}

      <GoogleButton next={next} onError={setErrorMessage} />
      <OrDivider />

      <form onSubmit={handleLogin} className="space-y-5" noValidate={false}>
        <div>
          <label htmlFor="email" className={authLabelClass}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="budi@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="password" className="text-[13px] font-semibold text-paper/80">Kata sandi</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-accent underline-offset-4 hover:underline">
              Lupa kata sandi?
            </Link>
          </div>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>

        <button type="submit" disabled={loading} aria-busy={loading} className={authPrimaryButtonClass}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              Memeriksa akun…
            </>
          ) : (
            <>
              Masuk
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
