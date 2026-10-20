'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  CheckCheck,
  Inbox,
  Mail,
  MessageCircle,
  RefreshCw,
  Star,
} from 'lucide-react';
import {
  ApiError,
  type AdminFeedbackListResponse,
  type FeedbackCategory,
  type FeedbackItem,
  type FeedbackStatus,
  getAdminFeedback,
  updateFeedbackStatus,
} from '../../../lib/api';
import { formatNumber, formatRelative } from '../../../lib/format';
import { formatWaDisplay, toWaNumber } from '../../../lib/whatsapp';
import { AdminAccessDenied } from '../../../components/admin/AdminAccessDenied';
import { Badge, Card, PageHeader, Skeleton, btn, field } from '../../../components/dashboard/ui';

type StatusFilter = FeedbackStatus | 'semua';
type CategoryFilter = FeedbackCategory | 'semua';

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  masukan: 'Ide & masukan',
  kritik: 'Kritik',
  bug: 'Bug',
  lainnya: 'Lainnya',
};

const CATEGORY_TONES: Record<FeedbackCategory, 'accent' | 'warning' | 'negative' | 'neutral'> = {
  masukan: 'accent',
  kritik: 'warning',
  bug: 'negative',
  lainnya: 'neutral',
};

const STATUS_TONES: Record<FeedbackStatus, 'accent' | 'neutral' | 'positive'> = {
  baru: 'accent',
  dibaca: 'neutral',
  selesai: 'positive',
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  baru: 'Baru',
  dibaca: 'Dibaca',
  selesai: 'Selesai',
};

function waReplyUrl(item: FeedbackItem): string | null {
  if (!item.user_whatsapp) return null;
  const firstName = item.user_name?.trim().split(/\s+/)[0] || 'kak';
  const text = `Halo ${firstName}, terima kasih sudah mengirim masukan untuk Pajangin. Saya sudah membacanya dan akan menindaklanjuti.`;
  return `https://wa.me/${toWaNumber(item.user_whatsapp)}?text=${encodeURIComponent(text)}`;
}

function FeedbackSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-5">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
          <Skeleton className="mt-4 h-4 w-56" />
        </Card>
      ))}
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [status, setStatus] = useState<StatusFilter>('semua');
  const [category, setCategory] = useState<CategoryFilter>('semua');
  const [result, setResult] = useState<{ key: string; data: AdminFeedbackListResponse } | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);
  const [actionError, setActionError] = useState('');
  const [forbidden, setForbidden] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${status}:${category}:${reloadKey}`;

  useEffect(() => {
    let cancelled = false;
    const key = `${status}:${category}:${reloadKey}`;

    getAdminFeedback({
      status: status === 'semua' ? undefined : status,
      category: category === 'semua' ? undefined : category,
      page: 1,
      limit: 100,
    })
      .then((data) => {
        if (!cancelled) setResult({ key, data });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 403) {
          setForbidden(true);
        } else {
          setError({
            key,
            message: err instanceof Error ? err.message : 'Gagal memuat masukan.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status, category, reloadKey]);

  const data = result?.key === requestKey ? result.data : null;
  const errorMessage = error?.key === requestKey ? error.message : '';
  const loading = !data && !errorMessage;
  // Jumlah dan rating bersifat global, jadi aman tetap tampil saat filter berubah.
  const counts = result?.data.counts;
  const averageRating = result?.data.average_rating ?? null;

  async function changeStatus(item: FeedbackItem, next: FeedbackStatus) {
    setUpdatingId(item.id);
    setActionError('');
    try {
      const updated = await updateFeedbackStatus(item.id, next);
      setResult((prev) => {
        if (!prev) return prev;
        const nextCounts = { ...prev.data.counts };
        if (item.status !== next) {
          nextCounts[item.status] = Math.max(0, nextCounts[item.status] - 1);
          nextCounts[next] += 1;
        }
        const stillMatches = status === 'semua' || status === next;
        const items = prev.data.items
          .map((row) => (row.id === item.id ? updated : row))
          .filter((row) => stillMatches || row.id !== item.id);

        return {
          ...prev,
          data: {
            ...prev.data,
            items,
            total: stillMatches ? prev.data.total : Math.max(0, prev.data.total - 1),
            counts: nextCounts,
          },
        };
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal memperbarui status masukan.');
    } finally {
      setUpdatingId(null);
    }
  }

  function reload() {
    setForbidden(false);
    setError(null);
    setActionError('');
    setReloadKey((key) => key + 1);
  }

  const tabs: Array<{ value: StatusFilter; label: string; count: number }> = [
    { value: 'semua', label: 'Semua', count: counts?.semua ?? 0 },
    { value: 'baru', label: 'Baru', count: counts?.baru ?? 0 },
    { value: 'dibaca', label: 'Dibaca', count: counts?.dibaca ?? 0 },
    { value: 'selesai', label: 'Selesai', count: counts?.selesai ?? 0 },
  ];

  const filterActive = status !== 'semua' || category !== 'semua';

  if (forbidden) {
    return (
      <div className="space-y-6">
        <PageHeader title="Masukan pengguna" description="Inbox khusus founder Pajangin." />
        <AdminAccessDenied />
      </div>
    );
  }

  return (
    <div className="space-y-6" aria-busy={loading}>
      <PageHeader
        title="Masukan pengguna"
        description="Ide, kritik, dan laporan bug dari pemilik usaha. Hanya terlihat oleh admin."
        actions={
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className={btn.secondary}
            aria-label="Muat ulang masukan"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Muat ulang</span>
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-ink-2">Total masukan</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {counts ? formatNumber(counts.semua) : '—'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-ink-2">Belum dibaca</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-accent">
            {counts ? formatNumber(counts.baru) : '—'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-ink-2">Rata-rata rating</p>
          <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold tabular-nums text-ink">
            {averageRating === null
              ? '—'
              : averageRating.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
            <Star className="h-4 w-4 fill-current text-warning" />
          </p>
        </Card>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter status">
          {tabs.map((tab) => {
            const active = status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(tab.value)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-ink bg-ink text-paper'
                    : 'border-rule bg-surface text-ink-2 hover:border-ink-2/40 hover:text-ink'
                }`}
              >
                {tab.label}
                <span className={`tabular-nums ${active ? 'text-paper/65' : 'text-ink-2'}`}>{tab.count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="feedback-category" className="sr-only">
            Filter kategori
          </label>
          <select
            id="feedback-category"
            value={category}
            onChange={(event) => setCategory(event.target.value as CategoryFilter)}
            className={`${field.input} h-9 w-auto min-w-44 text-xs`}
          >
            <option value="semua">Semua kategori</option>
            {(Object.keys(CATEGORY_LABELS) as FeedbackCategory[]).map((key) => (
              <option key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionError && (
        <div role="alert" className="rounded-(--radius-input) border border-negative/30 bg-negative-soft px-4 py-3 text-sm text-negative">
          {actionError}
        </div>
      )}

      {errorMessage ? (
        <Card className="p-5">
          <p className="text-sm font-medium text-ink">Masukan gagal dimuat.</p>
          <p className="mt-1 text-sm text-ink-2">{errorMessage}</p>
          <button type="button" onClick={reload} className={`${btn.secondary} mt-4`}>
            <RefreshCw className="h-4 w-4" /> Coba lagi
          </button>
        </Card>
      ) : loading ? (
        <FeedbackSkeleton />
      ) : data && data.items.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.items.map((item) => {
              const waUrl = waReplyUrl(item);
              const mailUrl = item.user_email
                ? `mailto:${item.user_email}?subject=${encodeURIComponent('Tanggapan atas masukan Anda untuk Pajangin')}`
                : null;
              const busy = updatingId === item.id;

              return (
                <Card key={item.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={CATEGORY_TONES[item.category]}>{CATEGORY_LABELS[item.category]}</Badge>
                      <Badge tone={STATUS_TONES[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                      {item.rating !== null && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-warning" aria-label={`Rating ${item.rating} dari 5`}>
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-3.5 w-3.5 ${index < item.rating! ? 'fill-current' : 'text-rule'}`}
                            />
                          ))}
                          <span className="ml-1 font-medium text-ink-2">{item.rating}/5</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink-2">{formatRelative(item.created_at)}</span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{item.message}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
                    <span className="font-medium text-ink">{item.user_name || 'Pengguna'}</span>
                    {item.user_email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{item.user_email}</span>}
                    {item.user_whatsapp && <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{formatWaDisplay(item.user_whatsapp)}</span>}
                    <span>{item.business_name ? `Bisnis: ${item.business_name}` : 'Konteks: umum'}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-rule pt-3">
                    {item.status === 'baru' && (
                      <button
                        type="button"
                        onClick={() => void changeStatus(item, 'dibaca')}
                        disabled={busy}
                        className={`${btn.secondary} h-8 px-3 text-xs`}
                      >
                        <Check className="h-3.5 w-3.5" /> Tandai dibaca
                      </button>
                    )}
                    {item.status !== 'selesai' && (
                      <button
                        type="button"
                        onClick={() => void changeStatus(item, 'selesai')}
                        disabled={busy}
                        className={`${btn.secondary} h-8 px-3 text-xs`}
                      >
                        <CheckCheck className="h-3.5 w-3.5" /> Selesai
                      </button>
                    )}
                    {waUrl && (
                      <a href={waUrl} target="_blank" rel="noreferrer" className={`${btn.ghost} h-8 px-3 text-xs`}>
                        <MessageCircle className="h-3.5 w-3.5" /> Balas via WA
                      </a>
                    )}
                    {mailUrl && (
                      <a href={mailUrl} className={`${btn.ghost} h-8 px-3 text-xs`}>
                        <Mail className="h-3.5 w-3.5" /> Balas email
                      </a>
                    )}
                    {busy && <span className="text-xs text-ink-2">Menyimpan…</span>}
                  </div>
                </Card>
              );
            })}
          </div>
          {data.total > data.items.length && (
            <p className="text-xs text-ink-2">
              Menampilkan {formatNumber(data.items.length)} dari {formatNumber(data.total)} masukan. Persempit filter untuk melihat sisanya.
            </p>
          )}
        </>
      ) : (
        <Card className="p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-paper-2 text-ink-2">
            <Inbox className="h-6 w-6" strokeWidth={1.5} />
          </div>
          <h2 className="mt-3 text-sm font-semibold text-ink">
            {filterActive ? 'Tidak ada masukan di filter ini.' : 'Belum ada masukan.'}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-ink-2">
            {filterActive
              ? 'Coba ubah status atau kategori untuk melihat masukan lain.'
              : 'Masukan dari pemilik usaha akan muncul di sini setelah mereka mengirim lewat dashboard.'}
          </p>
          {filterActive && (
            <button
              type="button"
              onClick={() => {
                setStatus('semua');
                setCategory('semua');
              }}
              className={`${btn.secondary} mt-4`}
            >
              Tampilkan semua
            </button>
          )}
          <div className="mt-4">
            <Link href="/admin" className="text-xs font-medium text-accent hover:underline">
              Kembali ke ringkasan
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
