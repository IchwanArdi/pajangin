'use client';

import { useEffect, useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import {
  deleteCurrentAccount,
  getAccountDeletionImpact,
  type AccountDeletionImpact,
} from '../../lib/api';
import { btn, field } from './ui';

function clearLocalAccountData(userId: string) {
  try {
    window.localStorage.removeItem('mos_selected_business');
    // Draft onboarding disimpan per akun. Setelah akun hilang, draft itu tidak
    // boleh muncul lagi kalau seseorang membuat akun baru di browser yang sama.
    for (let index = window.localStorage.length - 1; index >= 0; index--) {
      const key = window.localStorage.key(index);
      if (key?.startsWith(`pajangin.onboarding.v1:${userId}:`)) {
        window.localStorage.removeItem(key);
      }
    }
  } catch {
    // localStorage bisa diblokir di mode privat; redirect tetap harus berjalan.
  }
}

function ImpactItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-rule bg-paper-2 px-3 py-2.5">
      <p className="text-lg font-semibold tabular-nums text-ink">{value}</p>
      <p className="text-[11px] leading-tight text-ink-2">{label}</p>
    </div>
  );
}

export function DeleteAccountDialog({
  onClose,
  userId,
  userEmail,
}: {
  onClose: () => void;
  userId: string;
  userEmail: string;
}) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();
  const [impact, setImpact] = useState<AccountDeletionImpact | null>(null);
  const [impactError, setImpactError] = useState('');
  const [loadingImpact, setLoadingImpact] = useState(true);
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getAccountDeletionImpact()
      .then((data) => {
        if (active) setImpact(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setImpactError(
            err instanceof Error ? err.message : 'Gagal memuat data yang akan dihapus.',
          );
        }
      })
      .finally(() => {
        if (active) setLoadingImpact(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleting) onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [deleting, onClose]);

  const handleDelete = async () => {
    if (confirmation.trim().toUpperCase() !== 'HAPUS') {
      setError('Ketik HAPUS untuk mengonfirmasi.');
      return;
    }

    setDeleting(true);
    setError('');
    const supabase = createClient();

    try {
      await deleteCurrentAccount('HAPUS');
      clearLocalAccountData(userId);
      await supabase.auth.signOut({ scope: 'local' });
      router.replace('/login?reason=account_deleted');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus akun. Coba lagi.');
      setDeleting(false);
    }
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-(--radius-card) border border-rule bg-surface shadow-pop sm:max-h-[44rem]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-rule px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-negative-soft text-negative">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 id={titleId} className="text-base font-semibold text-ink">
                Hapus akun permanen?
              </h2>
              <p id={descriptionId} className="mt-0.5 text-sm text-ink-2">
                Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Tutup"
            className={btn.icon}
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
          <p className="text-sm leading-relaxed text-ink-2">
            Akun <span className="font-medium text-ink">{userEmail}</span> dan seluruh data
            bisnis di dalamnya akan dihapus dari Pajangin.
          </p>

          {loadingImpact ? (
            <div className="grid grid-cols-3 gap-2" aria-label="Memuat dampak penghapusan">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-paper-2 motion-reduce:animate-none" />
              ))}
            </div>
          ) : impactError ? (
            <div className="rounded-xl border border-negative/25 bg-negative-soft px-3.5 py-3 text-sm text-ink">
              <p>{impactError}</p>
              <button
                type="button"
                onClick={() => {
                  setImpactError('');
                  setLoadingImpact(true);
                  getAccountDeletionImpact()
                    .then(setImpact)
                    .catch((err: unknown) =>
                      setImpactError(
                        err instanceof Error ? err.message : 'Gagal memuat data yang akan dihapus.',
                      ),
                    )
                    .finally(() => setLoadingImpact(false));
                }}
                className="mt-2 font-semibold underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
              >
                Coba lagi
              </button>
            </div>
          ) : impact ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <ImpactItem label="Halaman bisnis" value={impact.totals.businesses} />
                <ImpactItem label="Layanan" value={impact.totals.services} />
                <ImpactItem label="Foto" value={impact.totals.images} />
                <ImpactItem label="Pesan masuk" value={impact.totals.leads} />
                <ImpactItem label="Booking" value={impact.totals.bookings} />
                <ImpactItem label="Masukan produk" value={impact.totals.feedback} />
              </div>
              <div className="rounded-xl border border-rule bg-paper-2 px-3.5 py-3 text-xs leading-relaxed text-ink-2">
                Masukan produk yang pernah Anda kirim tetap disimpan sebagai arsip tanpa nama,
                email, nomor WhatsApp, atau nama bisnis. Data bisnis, lead, booking, dan statistik
                akan dihapus permanen.
              </div>
            </>
          ) : null}

          <div>
            <label htmlFor="delete-account-confirmation" className={field.label}>
              Ketik <span className="font-mono font-semibold text-negative">HAPUS</span> untuk melanjutkan
            </label>
            <input
              id="delete-account-confirmation"
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={deleting}
              placeholder="HAPUS"
              className={field.input}
              autoFocus
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-negative-soft px-3.5 py-3 text-sm text-negative">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-rule px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className={btn.secondary}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={deleting || loadingImpact || !impact || confirmation.trim().toUpperCase() !== 'HAPUS'}
            aria-busy={deleting}
            className={btn.danger}
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
            ) : (
              <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
            )}
            {deleting ? 'Menghapus…' : 'Hapus akun permanen'}
          </button>
        </div>
      </div>
    </div>
  );
}
