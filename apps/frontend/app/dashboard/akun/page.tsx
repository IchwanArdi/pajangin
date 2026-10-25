'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowUpRight,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Monitor,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
import { authErrorMessage } from '../../../lib/auth-errors';
import { updateCurrentUser, type UserProfile } from '../../../lib/api';
import { LEGAL_CONTACT_EMAIL } from '../../../lib/legal';
import { formatWaDisplay, isValidWhatsapp, toWaNumber } from '../../../lib/whatsapp';
import { useBusiness } from '../../../components/dashboard/BusinessContext';
import { DeleteAccountDialog } from '../../../components/dashboard/DeleteAccountDialog';
import {
  Card,
  CardHeader,
  PageHeader,
  Skeleton,
  btn,
  field,
} from '../../../components/dashboard/ui';
import { FormAlert } from '../../../components/auth/AuthShell';

const MIN_PASSWORD = 8;

type AuthInfo = {
  provider: string;
  hasPassword: boolean;
};

type Alert = { tone: 'error' | 'success'; message: string };

function AccountInfoSkeleton() {
  return (
    <Card>
      <CardHeader
        title="Informasi akun"
        description="Nama dan WhatsApp untuk dashboard. Email dipakai untuk masuk."
      />
      <div className="space-y-4 p-5" aria-hidden="true">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    </Card>
  );
}

// Form dipisah agar state lokal hanya diinisialisasi saat profil user sudah ada.
// Ini menghindari sinkronisasi state lewat effect dan tetap responsif setelah save.
function ProfileForm({
  user,
  authInfo,
  onUpdated,
}: {
  user: UserProfile;
  authInfo: AuthInfo | null;
  onUpdated: (user: UserProfile) => void;
}) {
  const [name, setName] = useState(user.name);
  const [whatsapp, setWhatsapp] = useState(
    user.whatsapp ? formatWaDisplay(user.whatsapp) : '',
  );
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);

  const normalizedWhatsapp = whatsapp.trim() ? toWaNumber(whatsapp) : '';
  const dirty =
    name.trim() !== user.name || normalizedWhatsapp !== (user.whatsapp ?? '');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAlert(null);

    const cleanName = name.trim();
    const rawWhatsapp = whatsapp.trim();

    if (!cleanName) {
      setAlert({ tone: 'error', message: 'Nama wajib diisi.' });
      return;
    }
    if (rawWhatsapp && !isValidWhatsapp(rawWhatsapp)) {
      setAlert({
        tone: 'error',
        message: 'Nomor WhatsApp tidak valid. Contoh: 081234567890.',
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateCurrentUser({
        name: cleanName,
        whatsapp: rawWhatsapp || null,
      });
      onUpdated(updated);
      setName(updated.name);
      setWhatsapp(updated.whatsapp ? formatWaDisplay(updated.whatsapp) : '');
      setAlert({ tone: 'success', message: 'Informasi akun diperbarui.' });
    } catch (err) {
      setAlert({
        tone: 'error',
        message: err instanceof Error ? err.message : 'Gagal menyimpan informasi akun.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Informasi akun"
        description="Nama dan WhatsApp untuk dashboard. Email dipakai untuk masuk."
      />
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {alert && <FormAlert tone={alert.tone}>{alert.message}</FormAlert>}

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper-2 text-sm font-semibold text-ink">
            {(name || user.email || '?').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{name || 'Pemilik usaha'}</p>
            <p className="truncate text-xs text-ink-2">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="account-name" className={field.label}>
              Nama
            </label>
            <input
              id="account-name"
              type="text"
              required
              maxLength={120}
              autoComplete="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setAlert(null);
              }}
              className={field.input}
            />
          </div>
          <div>
            <label htmlFor="account-whatsapp" className={field.label}>
              WhatsApp
            </label>
            <input
              id="account-whatsapp"
              type="tel"
              autoComplete="tel"
              value={whatsapp}
              onChange={(event) => {
                setWhatsapp(event.target.value);
                setAlert(null);
              }}
              placeholder="081234567890"
              className={field.input}
            />
            <p className={field.hint}>Opsional. Format 08… atau +62…</p>
          </div>
        </div>

        <dl className="space-y-3 border-t border-rule pt-4 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-ink-2">Email</dt>
            <dd className="min-w-0 break-all text-right font-medium text-ink">{user.email}</dd>
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

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xs text-xs leading-relaxed text-ink-2">
            Ingin mengganti email? Kirim permintaan ke{' '}
            <a
              href={`mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent('Perubahan email akun Pajangin')}`}
              className="font-medium text-ink underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
            >
              {LEGAL_CONTACT_EMAIL}
            </a>
            .
          </p>
          <button
            type="submit"
            disabled={saving || !dirty}
            aria-busy={saving}
            className={btn.primary}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />}
            {saving ? 'Menyimpan…' : dirty ? 'Simpan perubahan' : 'Tersimpan'}
          </button>
        </div>
      </form>
    </Card>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user, replaceUser } = useBusiness();

  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityAlert, setSecurityAlert] = useState<Alert | null>(null);
  const [sessionBusy, setSessionBusy] = useState<'local' | 'global' | null>(null);
  const [sessionAlert, setSessionAlert] = useState<Alert | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
    setSecurityAlert(null);

    if (!user) {
      setSecurityAlert({ tone: 'error', message: 'Data akun belum siap. Muat ulang halaman ini.' });
      return;
    }
    if (newPassword.length < MIN_PASSWORD) {
      setSecurityAlert({
        tone: 'error',
        message: `Kata sandi baru minimal ${MIN_PASSWORD} karakter.`,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityAlert({ tone: 'error', message: 'Konfirmasi kata sandi baru tidak sama.' });
      return;
    }

    setSecuritySaving(true);
    const supabase = createClient();

    // Verifikasi kata sandi lama sebelum mengganti, agar sesi yang tertinggal
    // di perangkat lain tidak bisa langsung mengambil alih akun.
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) {
      setSecuritySaving(false);
      setSecurityAlert({ tone: 'error', message: 'Kata sandi saat ini tidak sesuai.' });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setSecuritySaving(false);
      setSecurityAlert({ tone: 'error', message: authErrorMessage(updateError) });
      return;
    }

    // Sesi ini tetap aktif; sesi di perangkat lain dikeluarkan.
    await supabase.auth.signOut({ scope: 'others' });
    setSecuritySaving(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSecurityAlert({
      tone: 'success',
      message: 'Kata sandi diperbarui. Sesi di perangkat lain sudah dikeluarkan.',
    });
  };

  // Logout biasa hanya membersihkan sesi di browser ini. Tombol "semua perangkat"
  // memakai scope global untuk mencabut refresh token di perangkat lain.
  const handleLogout = async () => {
    setSessionBusy('local');
    setSessionAlert(null);
    const { error } = await createClient().auth.signOut({ scope: 'local' });
    if (error) {
      setSessionBusy(null);
      setSessionAlert({ tone: 'error', message: 'Gagal keluar. Coba lagi.' });
      return;
    }
    router.replace('/login');
    router.refresh();
  };

  const handleLogoutAll = async () => {
    if (
      !window.confirm(
        'Keluar dari semua perangkat? Anda perlu masuk lagi di setiap perangkat yang memakai akun ini.',
      )
    ) {
      return;
    }

    setSessionBusy('global');
    setSessionAlert(null);
    const { error } = await createClient().auth.signOut({ scope: 'global' });
    if (error) {
      setSessionBusy(null);
      setSessionAlert({ tone: 'error', message: 'Gagal keluar dari semua perangkat. Coba lagi.' });
      return;
    }
    router.replace('/login?reason=signed_out_all');
    router.refresh();
  };

  const dataRequestHref = `mailto:${LEGAL_CONTACT_EMAIL}?subject=${encodeURIComponent(
    'Permintaan salinan data Pajangin',
  )}&body=${encodeURIComponent(
    `Halo, saya ingin meminta salinan data akun Pajangin saya.\n\nEmail akun: ${user?.email ?? ''}\n\nTerima kasih.`,
  )}`;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Akun & keamanan"
        helpKey="akun"
        description="Kelola profil pemilik, keamanan, dan data akun Pajangin Anda."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {user ? (
          <ProfileForm
            key={user.id}
            user={user}
            authInfo={authInfo}
            onUpdated={replaceUser}
          />
        ) : (
          <AccountInfoSkeleton />
        )}

        <Card>
          <CardHeader
            title="Keamanan"
            description="Ganti kata sandi secara berkala dan keluarkan sesi yang tidak dikenal."
            action={<ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.75} />}
          />
          <div className="p-5">
            {securityAlert && (
              <div className="mb-4">
                <FormAlert tone={securityAlert.tone}>{securityAlert.message}</FormAlert>
              </div>
            )}

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
                <button
                  type="submit"
                  disabled={securitySaving}
                  aria-busy={securitySaving}
                  className={btn.primary}
                >
                  {securitySaving && (
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  )}
                  {securitySaving ? 'Menyimpan…' : 'Simpan kata sandi'}
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
          <CardHeader
            title="Data & privasi"
            description="Baca kebijakan dan ajukan permintaan data Anda."
          />
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
              href={dataRequestHref}
              className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-ink transition hover:bg-paper-2"
            >
              Minta salinan data
              <Mail className="h-4 w-4 text-ink-2" strokeWidth={1.75} />
            </a>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Sesi"
            description="Keluar dari perangkat ini, atau dari semua perangkat yang masih login."
          />
          <div className="space-y-4 p-5">
            {sessionAlert && <FormAlert tone={sessionAlert.tone}>{sessionAlert.message}</FormAlert>}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleLogout}
                disabled={sessionBusy !== null}
                className={`${btn.secondary} w-full sm:w-auto`}
              >
                {sessionBusy === 'local' ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                ) : (
                  <LogOut className="h-4 w-4" strokeWidth={1.75} />
                )}
                {sessionBusy === 'local' ? 'Keluar…' : 'Keluar dari perangkat ini'}
              </button>
              <button
                type="button"
                onClick={handleLogoutAll}
                disabled={sessionBusy !== null}
                className={`${btn.ghost} w-full border border-rule sm:w-auto`}
              >
                {sessionBusy === 'global' ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                ) : (
                  <Monitor className="h-4 w-4" strokeWidth={1.75} />
                )}
                {sessionBusy === 'global' ? 'Keluar…' : 'Keluar dari semua perangkat'}
              </button>
            </div>

            <p className="text-xs leading-relaxed text-ink-2">
              “Keluar dari semua perangkat” juga mencabut sesi di ponsel atau komputer lain yang
              masih memakai akun ini.
            </p>
          </div>
        </Card>
      </div>

      <Card className="border-negative/25">
        <CardHeader
          title="Hapus akun"
          description="Hapus akun, halaman bisnis, dan seluruh data terkait secara permanen."
          action={<Trash2 className="h-4 w-4 text-negative" strokeWidth={1.75} />}
        />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-ink-2">
            Halaman bisnis, layanan, foto, pesan masuk, booking, dan statistik akan dihapus. Masukan
            produk yang pernah Anda kirim disimpan tanpa identitas.
          </p>
          {user?.is_admin ? (
            <p className="text-xs font-medium text-ink-2">
              Akun admin tidak dapat dihapus dari dashboard.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              disabled={!user || authInfo === null}
              className={btn.danger}
            >
              <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
              Hapus akun permanen
            </button>
          )}
        </div>
      </Card>

      {user && deleteOpen && (
        <DeleteAccountDialog
          onClose={() => setDeleteOpen(false)}
          userId={user.id}
          userEmail={user.email}
          hasPassword={authInfo?.hasPassword ?? false}
        />
      )}
    </div>
  );
}
