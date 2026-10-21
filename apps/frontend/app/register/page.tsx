'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import { authErrorMessage } from '../../lib/auth-errors';
import AuthShell, {
  AuthAlert,
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
} from '../../components/auth/AuthShell';
import PasswordInput from '../../components/auth/PasswordInput';
import GoogleButton, { OrDivider } from '../../components/auth/GoogleButton';

const MIN_PASSWORD = 8;

// Setelah verifikasi email / login Google, user baru langsung masuk ke onboarding bisnis
const AFTER_SIGNUP = '/onboarding';

function passwordHint(pw: string): string | null {
  if (!pw) return null;
  if (pw.length < MIN_PASSWORD) return `Minimal ${MIN_PASSWORD} karakter (${pw.length}/${MIN_PASSWORD}).`;
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return 'Saran: kombinasikan huruf dan angka agar lebih aman.';
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const emailRedirectTo = () => `${window.location.origin}/auth/callback?next=${AFTER_SIGNUP}`;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < MIN_PASSWORD) {
      setErrorMessage(`Kata sandi minimal ${MIN_PASSWORD} karakter.`);
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await createClient().auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: emailRedirectTo(),
      },
    });
    setLoading(false);

    if (error) {
      setErrorMessage(authErrorMessage(error));
      return;
    }

    // Supabase tidak mengembalikan error untuk email yang sudah terdaftar (anti-enumerasi),
    // tapi identities-nya kosong.
    if (data.user && data.user.identities?.length === 0) {
      setErrorMessage('Email ini sudah terdaftar. Silakan masuk atau gunakan "Lupa kata sandi".');
      return;
    }

    // Verifikasi email dimatikan di Supabase → sesi langsung aktif
    if (data.session) {
      router.replace(AFTER_SIGNUP);
      router.refresh();
      return;
    }

    setSentTo(cleanEmail);
  };

  const handleResend = async () => {
    if (!sentTo) return;
    setResendState('sending');
    const { error } = await createClient().auth.resend({
      type: 'signup',
      email: sentTo,
      options: { emailRedirectTo: emailRedirectTo() },
    });
    if (error) {
      setErrorMessage(authErrorMessage(error));
      setResendState('idle');
      return;
    }
    setResendState('sent');
  };

  // ===== Layar "cek email" =====
  if (sentTo) {
    return (
      <AuthShell
        title="Cek email Anda"
        subtitle={
          <>
            Kami mengirim link verifikasi ke <strong className="text-paper">{sentTo}</strong>. Klik link tersebut untuk mengaktifkan akun dan membuat halaman bisnis Anda.
          </>
        }
        footer={
          <p>
            Sudah verifikasi?{' '}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Masuk
            </Link>
          </p>
        }
      >
        {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}
        <ul className="space-y-2 text-sm leading-relaxed text-paper/70">
          <li>• Tidak menemukan email? Cek folder <strong>Spam</strong> atau <strong>Promosi</strong>.</li>
          <li>• Buka link di browser yang sama dengan tempat Anda mendaftar.</li>
        </ul>
        <button type="button" onClick={handleResend} disabled={resendState !== 'idle'} className={authSecondaryButtonClass}>
          {resendState === 'sent' ? 'Link verifikasi terkirim ulang ✓' : resendState === 'sending' ? 'Mengirim…' : 'Kirim ulang link verifikasi'}
        </button>
        <button
          type="button"
          onClick={() => {
            setSentTo(null);
            setResendState('idle');
            setErrorMessage('');
          }}
          className="w-full text-sm font-semibold text-paper/65 transition-colors hover:text-paper"
        >
          Salah email? Ubah alamat email
        </button>
      </AuthShell>
    );
  }

  // ===== Form daftar =====
  const hint = passwordHint(password);

  return (
    <AuthShell
      title="Buat akun Pajangin"
      subtitle="Gratis. Setelah akun aktif, Anda langsung membuat halaman bisnis dalam 2 menit."
      footer={
        <p>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Masuk
          </Link>
        </p>
      }
    >
      {errorMessage && <AuthAlert>{errorMessage}</AuthAlert>}

      <GoogleButton next={AFTER_SIGNUP} label="Daftar dengan Google" onError={setErrorMessage} />
      <OrDivider />

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label htmlFor="name" className={authLabelClass}>Nama Anda</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Budi Santoso"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={authInputClass}
          />
        </div>

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
          <label htmlFor="password" className={authLabelClass}>Kata sandi</label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder={`Minimal ${MIN_PASSWORD} karakter`}
            minLength={MIN_PASSWORD}
          />
          {hint && <p className="mt-1.5 text-xs text-paper/60">{hint}</p>}
        </div>

        <button type="submit" disabled={loading} aria-busy={loading} className={authPrimaryButtonClass}>
          {loading ? 'Membuat akun…' : 'Buat akun'}
        </button>
      </form>

      <p className="text-center text-xs leading-relaxed text-paper/50">
        Dengan membuat akun, Anda menyetujui{' '}
        <Link href="/syarat" className="text-paper/75 underline-offset-2 hover:text-paper hover:underline">
          Syarat &amp; Ketentuan
        </Link>{' '}
        dan{' '}
        <Link href="/privasi" className="text-paper/75 underline-offset-2 hover:text-paper hover:underline">
          Kebijakan Privasi
        </Link>
        .
      </p>
    </AuthShell>
  );
}
