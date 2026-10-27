'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { safeNext } from '../../lib/safe-next';
import AuthShell, { AuthAlert } from '../../components/auth/AuthShell';
import GoogleButton from '../../components/auth/GoogleButton';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

const NOTICES: Record<string, { tone: 'error' | 'info'; text: string }> = {
  session_expired: { tone: 'info', text: 'Sesi Anda telah berakhir. Silakan masuk kembali.' },
  account_deleted: {
    tone: 'info',
    text: 'Akun Pajangin Anda sudah dihapus. Terima kasih pernah memakai Pajangin.',
  },
  signed_out_all: {
    tone: 'info',
    text: 'Anda telah keluar dari semua perangkat yang memakai akun ini.',
  },
  oauth_cancelled: {
    tone: 'info',
    text: 'Login dengan Google dibatalkan. Silakan coba lagi saat siap.',
  },
  auth_failed: {
    tone: 'error',
    text: 'Login Google tidak bisa diselesaikan. Coba lagi.',
  },
};

function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get('next'));
  const notice = NOTICES[searchParams.get('reason') || searchParams.get('error') || ''];
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <AuthShell
      eyebrow="Masuk atau daftar"
      title="Masuk ke Pajangin dengan Google."
      subtitle="Tidak perlu kata sandi. Akun Pajangin dibuat otomatis saat pertama kali Anda masuk."
      footer={
        <p className="text-center text-xs leading-relaxed text-paper/50">
          Dengan melanjutkan, Anda menyetujui{' '}
          <Link href="/syarat" className="text-paper/75 underline-offset-2 hover:text-paper hover:underline">
            Syarat &amp; Ketentuan
          </Link>{' '}
          dan{' '}
          <Link href="/privasi" className="text-paper/75 underline-offset-2 hover:text-paper hover:underline">
            Kebijakan Privasi
          </Link>
          .
        </p>
      }
    >
      {notice && !errorMessage && <AuthAlert tone={notice.tone}>{notice.text}</AuthAlert>}
      {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}

      <GoogleButton next={next} label="Masuk dengan Google" onError={setErrorMessage} />

      <p className="text-center text-xs leading-relaxed text-paper/50">
        Nama dan email dari akun Google dipakai untuk membuat profil Pajangin Anda.
      </p>
    </AuthShell>
  );
}
