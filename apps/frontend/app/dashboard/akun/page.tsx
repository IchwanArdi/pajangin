'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Monitor,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';
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

type Alert = { tone: 'error' | 'success'; message: string };

function AccountInfoSkeleton() {
  return (
    <Card>
      <CardHeader
        title="Informasi akun"
        description="Nama dan WhatsApp untuk dashboard. Email mengikuti akun Google."
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
  onUpdated,
}: {
  user: UserProfile;
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
        description="Nama dan WhatsApp untuk dashboard. Email mengikuti akun Google."
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
            <dd className="text-right font-medium text-ink">Google</dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xs text-xs leading-relaxed text-ink-2">
            Email mengikuti akun Google Anda. Jika email di Google berubah, Pajangin akan
            menyinkronkannya saat Anda masuk kembali.
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

  const [sessionBusy, setSessionBusy] = useState<'local' | 'global' | null>(null);
  const [sessionAlert, setSessionAlert] = useState<Alert | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
        description="Kelola profil pemilik, metode masuk, dan data akun Pajangin Anda."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {user ? (
          <ProfileForm key={user.id} user={user} onUpdated={replaceUser} />
        ) : (
          <AccountInfoSkeleton />
        )}

        <Card>
          <CardHeader
            title="Metode masuk"
            description="Pajangin memakai Google. Tidak ada kata sandi yang disimpan di sini."
            action={<ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.75} />}
          />
          <div className="p-5">
            <div className="rounded-xl border border-rule bg-paper-2 p-4 text-sm leading-relaxed text-ink-2">
              <LogIn className="mb-2 h-4 w-4 text-ink-2" strokeWidth={1.75} />
              <p className="font-medium text-ink">Masuk dengan Google</p>
              <p className="mt-1">
                Kata sandi, verifikasi dua langkah, dan pemulihan akun dikelola langsung oleh Google.
              </p>
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 font-semibold text-ink underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
              >
                Kelola keamanan akun Google
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </a>
            </div>
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
              disabled={!user}
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
        />
      )}
    </div>
  );
}
