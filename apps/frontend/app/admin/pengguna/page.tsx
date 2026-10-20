'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ExternalLink,
  MessageSquarePlus,
  RefreshCw,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  ApiError,
  type AdminUsersResponse,
  type AdminUserSort,
  getAdminUsers,
} from '../../../lib/api';
import { formatNumber, formatRelative, initials } from '../../../lib/format';
import { formatWaDisplay } from '../../../lib/whatsapp';
import { AdminAccessDenied } from '../../../components/admin/AdminAccessDenied';
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState';
import { AdminKpi } from '../../../components/admin/AdminKpi';
import { AdminPagination } from '../../../components/admin/AdminPagination';
import { useDebouncedSearch } from '../../../components/admin/useDebouncedSearch';
import { Badge, Card, PageHeader, Skeleton, btn, field } from '../../../components/dashboard/ui';

type BusinessFilter = 'semua' | 'ya' | 'tidak';

const SORT_OPTIONS: Array<{ value: AdminUserSort; label: string }> = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
  { value: 'name', label: 'Nama A–Z' },
];

function SummarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-2 h-4 w-32" />
        </Card>
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <Card className="p-5">
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="mt-1.5 h-3 w-56" />
            </div>
            <Skeleton className="hidden h-6 w-28 md:block" />
            <Skeleton className="hidden h-4 w-16 md:block" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AdminUsersPage() {
  const { value: search, applied: appliedSearch, update: updateSearch, reset: resetSearch } =
    useDebouncedSearch();
  const [businessFilter, setBusinessFilter] = useState<BusinessFilter>('semua');
  const [sort, setSort] = useState<AdminUserSort>('newest');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ key: string; data: AdminUsersResponse } | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const requestKey = `${appliedSearch}|${businessFilter}|${sort}|${page}|${reloadKey}`;

  useEffect(() => {
    let cancelled = false;
    const key = `${appliedSearch}|${businessFilter}|${sort}|${page}|${reloadKey}`;

    // key dipakai untuk membuang respons lama yang datang setelah filter berubah.
    getAdminUsers({
      q: appliedSearch || undefined,
      has_business: businessFilter === 'semua' ? undefined : businessFilter,
      sort,
      page,
      limit: 20,
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
            message: err instanceof Error ? err.message : 'Gagal memuat daftar pengguna.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [appliedSearch, businessFilter, sort, page, reloadKey]);

  const data = result?.key === requestKey ? result.data : null;
  // Ringkasan tetap global supaya angka tidak berubah saat founder memfilter daftar.
  const summary = result?.data.summary;
  const errorMessage = error?.key === requestKey ? error.message : '';
  const loading = !data && !errorMessage;
  const filterActive =
    Boolean(search || appliedSearch) || businessFilter !== 'semua' || sort !== 'newest';

  function reload() {
    setForbidden(false);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  function resetFilters() {
    resetSearch();
    setBusinessFilter('semua');
    setSort('newest');
    setPage(1);
    setError(null);
  }

  if (forbidden) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pengguna" description="Daftar akun khusus founder Pajangin." />
        <AdminAccessDenied />
      </div>
    );
  }

  const showSummary = Boolean(summary) || loading;

  return (
    <div className="space-y-6" aria-busy={loading}>
      <PageHeader
        title="Pengguna"
        description="Semua akun Pajangin, bisnis yang terhubung, dan masukan yang pernah dikirim."
        actions={
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className={btn.secondary}
            aria-label="Muat ulang daftar pengguna"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Muat ulang</span>
          </button>
        }
      />

      {showSummary &&
        (summary ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminKpi
              label="Total akun"
              value={summary.total}
              icon={Users}
              tone="accent"
              hint="Semua profil terdaftar"
            />
            <AdminKpi
              label="Punya bisnis"
              value={summary.with_business}
              icon={Building2}
              tone="positive"
              hint="Minimal satu bisnis"
            />
            <AdminKpi
              label="Akun baru"
              value={summary.new_30d}
              icon={UserPlus}
              tone="neutral"
              hint="30 hari terakhir"
            />
          </div>
        ) : (
          <SummarySkeleton />
        ))}

      <div className="space-y-3">
        {/* Pencarian ditunda oleh useDebouncedSearch; filter select langsung memicu fetch. */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="admin-user-search" className="sr-only">
              Cari pengguna
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" />
            <input
              id="admin-user-search"
              type="search"
              value={search}
              onChange={(event) => {
                updateSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, email, atau WhatsApp…"
              maxLength={120}
              className={`${field.input} pl-9`}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div>
              <label htmlFor="admin-user-business" className="sr-only">
                Filter kepemilikan bisnis
              </label>
              <select
                id="admin-user-business"
                value={businessFilter}
                onChange={(event) => {
                  setBusinessFilter(event.target.value as BusinessFilter);
                  setPage(1);
                }}
                className={`${field.input} sm:w-auto`}
              >
                <option value="semua">Semua akun</option>
                <option value="ya">Punya bisnis</option>
                <option value="tidak">Belum punya bisnis</option>
              </select>
            </div>
            <div>
              <label htmlFor="admin-user-sort" className="sr-only">
                Urutkan pengguna
              </label>
              <select
                id="admin-user-sort"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as AdminUserSort);
                  setPage(1);
                }}
                className={`${field.input} sm:w-auto`}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink-2">
            {data
              ? `${formatNumber(data.total)} akun cocok dengan filter`
              : loading
                ? 'Memuat akun…'
                : 'Daftar akun'}
          </p>
          {filterActive && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-accent hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {errorMessage ? (
        <Card className="p-5">
          <p className="text-sm font-medium text-ink">Daftar pengguna gagal dimuat.</p>
          <p className="mt-1 text-sm text-ink-2">{errorMessage}</p>
          <button type="button" onClick={reload} className={`${btn.secondary} mt-4`}>
            <RefreshCw className="h-4 w-4" /> Coba lagi
          </button>
        </Card>
      ) : loading ? (
        <ListSkeleton />
      ) : data && data.items.length > 0 ? (
        <Card>
          <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_7rem_6rem] gap-4 border-b border-rule px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-2 md:grid">
            <span>Pengguna</span>
            <span>Bisnis</span>
            <span>Masukan</span>
            <span className="text-right">Terdaftar</span>
          </div>

          <div className="divide-y divide-rule">
            {data.items.map((user) => (
              <div
                key={user.id}
                className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_7rem_6rem] md:items-center md:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper-2 text-[11px] font-bold text-ink-2">
                    {initials(user.name || user.email)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-ink">
                        {user.name || 'Tanpa nama'}
                      </p>
                      {user.is_admin && <Badge tone="accent">Admin</Badge>}
                    </div>
                    <p className="truncate text-xs text-ink-2">{user.email}</p>
                    {user.whatsapp && (
                      <p className="text-xs text-ink-2">{formatWaDisplay(user.whatsapp)}</p>
                    )}
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-2 md:hidden">
                    Bisnis
                  </p>
                  {user.business_count === 0 ? (
                    <Badge tone="warning">Belum punya bisnis</Badge>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {user.businesses.slice(0, 2).map((business) => (
                        <Link
                          key={business.id}
                          href={`/${business.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-full items-center gap-1 rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-medium text-ink-2 transition-colors hover:text-ink"
                        >
                          <span className="truncate">{business.name}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </Link>
                      ))}
                      {user.businesses.length > 2 && (
                        <span className="text-[11px] text-ink-2">
                          +{user.businesses.length - 2} lainnya
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-2 md:hidden">
                    Masukan
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                    <MessageSquarePlus className="h-3.5 w-3.5 text-ink-2" />
                    {user.feedback_count > 0 ? formatNumber(user.feedback_count) : '—'}
                  </p>
                  {user.last_feedback_at && (
                    <p className="text-[11px] text-ink-2">
                      terakhir {formatRelative(user.last_feedback_at)}
                    </p>
                  )}
                </div>

                <div className="md:text-right">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-2 md:hidden">
                    Terdaftar
                  </p>
                  <p
                    className="text-xs text-ink-2"
                    title={new Date(user.created_at).toLocaleString('id-ID')}
                  >
                    {formatRelative(user.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <AdminEmptyState
          icon={Search}
          title="Akun tidak ditemukan."
          description="Coba kata kunci lain atau ubah filter kepemilikan bisnis."
          action={
            filterActive ? (
              <button type="button" onClick={resetFilters} className={btn.secondary}>
                Reset filter
              </button>
            ) : undefined
          }
        />
      )}

      {data && data.items.length > 0 && (
        <AdminPagination
          page={data.page}
          totalPages={data.total_pages}
          total={data.total}
          limit={data.limit}
          onPage={setPage}
        />
      )}
    </div>
  );
}
