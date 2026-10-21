'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, KeyRound, LogOut, Mail, ShieldCheck } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { authErrorMessage } from '../../../lib/auth-errors';
import { LEGAL_CONTACT_EMAIL } from '../../../lib/legal';
import { useBusiness } from '../../../components/dashboard/BusinessContext';
import { Card, CardHeader, PageHeader, btn, field } from '../../../components/dashboard/ui';
import { FormAlert } from '../../../components/auth/AuthShell';

const MIN_PASSWORD = 8;

type AuthInfo = {
  provider: string;
  hasPassword: boolean;
};

export default function AccountPage() {
  const router = useRouter();
  const { user } = useBusiness();

  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);

  // Password hanya relevan untuk akun dengan identitas email. Akun Google-only
  // tetap bisa memakai halaman ini untuk keluar dan mengelola data.
  useEffect(() => {
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!active) return;
        const identities = data.user?.identities ?? [];
        const hasPassword =
          identities.length === 0 || identities.some((identity) => identity.provider === 'email');
        setAuthInfo({
          provider: data.user?.app_metadata.provider ?? 'email',
          hasPassword,
        });
      })
      .catch(() => {
        if (active) setAuthInfo({ provider: 'email', hasPassword: true });
      });
    return () => {
      active = false;
    };
  }, []);

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setAlert(null);

    if (!user) {
      setAlert({ tone: 'error', message: 'Data akun belum siap. Muat ulang halaman ini.' });
      return;
    }
    if (newPassword.length < MIN_PASSWORD) {
      setAlert({ tone: 'error', message: `Kata sandi baru minimal ${MIN_PASSWORD} karakter.` });
      return;
    }
    if (newPassword !== confirmPassword) {
      setAlert({ tone: 'error', message: 'Konfirmasi kata sandi baru tidak sama.' });
      return;
    }

    setSaving(true);
    const supabase = createClient();

    // Verifikasi kata sandi lama sebelum mengganti, agar sesi yang tertinggal
    // di perangkat lain tidak bisa langsung mengambil alih akun.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) {
      setSaving(false);
      setAlert({ tone: 'error', message: 'Kata sandi saat ini tidak sesuai.' });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setSaving(false);
      setAlert({ tone: 'error', message: authErrorMessage(updateError) });
      return;
    }

    // Sesi ini tetap aktif; sesi di perangkat lain dikeluarkan.
    await supabase.auth.signOut({ scope: 'others' });
    setSaving(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setAlert({ tone: 'success', message: 'Kata sandi diperbarui. Sesi di perangkat lain sudah dikeluarkan.' });
  };

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  };

  const deletionHref = `mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent(
    'Permintaan penghapusan akun Pajangin',
  )}&body=${encodeURIComponent(
    `Halo, saya ingin menghapus akun Pajangin saya.\n\nEmail akun: ${user?.email ?? ''}\n\nTerima kasih.`,
  )}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Akun & keamanan"
        description="Kelola akses akun, kata sandi, dan data pribadi Anda di Pajangin."
      />

      {alert && <FormAlert tone={alert.tone}>{alert.message}</FormAlert>}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader
            title="Informasi akun"
            description="Email dan metode masuk yang dipakai untuk mengakses dashboard."
          />
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-2 text-sm font-semibold text-ink">
                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{user?.name || 'Pemilik usaha'}</p>
                {user?.whatsapp && <p className="mt-0.5 text-xs text-ink-2">WhatsApp: {user.whatsapp}</p>}
              </div>
            </div>

            <dl className="space-y-3 border-t border-rule pt-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-2">Email</dt>
                <dd className="min-w-0 break-all text-right font-medium text-ink">{user?.email ?? '—'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-2">Metode masuk</dt>
                <dd className="text-right font-medium text-ink">
                  {authInfo === null
                    ? 'Memeriksa…'
                    : authInfo.provider === 'google'
                      ? 'Google'
                      : 'Email & kata sandi'}
                </dd>
              </div>
            </dl>

            <p className="text-xs leading-relaxed text-ink-2">
              Ingin mengubah nama atau nomor WhatsApp? Kirim permintaan ke{' '}
              <a
                href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent('Perubahan data akun Pajangin')}`}
                className="font-medium text-ink underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                {LEGAL_CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Keamanan"
            description="Ganti kata sandi secara berkala dan keluarkan sesi yang tidak dikenal."
            action={<ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.75} />}
          />
          <div className="p-5">
            {authInfo === null ? (
              <p className="text-sm text-ink-2">Memeriksa metode masuk…</p>
            ) : authInfo.hasPassword ? (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="current-password" className={field.label}>
                    Kata sandi saat ini
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className={field.input}
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className={field.label}>
                    Kata sandi baru
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    minLength={MIN_PASSWORD}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className={field.input}
                  />
                  <p className={field.hint}>Minimal {MIN_PASSWORD} karakter.</p>
                </div>
                <div>
                  <label htmlFor="confirm-password" className={field.label}>
                    Ulangi kata sandi baru
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    minLength={MIN_PASSWORD}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={field.input}
                  />
                </div>
                <button type="submit" disabled={saving} aria-busy={saving} className={btn.primary}>
                  {saving ? 'Menyimpan…' : 'Simpan kata sandi'}
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-rule bg-paper-2 p-4 text-sm leading-relaxed text-ink-2">
                <KeyRound className="mb-2 h-4 w-4 text-ink-2" strokeWidth={1.75} />
                <p>
                  Akun ini masuk dengan Google. Kata sandi dikelola oleh akun Google Anda, bukan oleh
                  Pajangin.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Data & privasi" description="Baca kebijakan dan ajukan permintaan data Anda." />
          <div className="space-y-1 p-3">
            <Link
              href="/privasi"
              className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-ink transition hover:bg-paper-2"
            >
              Kebijakan Privasi
              <ArrowUpRight className="h-4 w-4 text-ink-2" strokeWidth={1.75} />
            </Link>
            <Link
              href="/syarat"
              className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-ink transition hover:bg-paper-2"
            >
              Syarat &amp; Ketentuan
              <ArrowUpRight className="h-4 w-4 text-ink-2" strokeWidth={1.75} />
            </Link>
            <a
              href={deletionHref}
              className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-ink transition hover:bg-paper-2"
            >
              Minta penghapusan akun
              <Mail className="h-4 w-4 text-ink-2" strokeWidth={1.75} />
            </a>
          </div>
        </Card>

        <Card>
          <CardHeader title="Sesi" description="Keluar dari perangkat ini setelah selesai memakai dashboard." />
          <div className="p-5">
            <button type="button" onClick={handleLogout} className={btn.secondary}>
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Keluar dari akun
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
