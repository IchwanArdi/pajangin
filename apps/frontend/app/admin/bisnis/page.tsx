'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Eye,
  MessageCircle,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  ApiError,
  type AdminBusinessesResponse,
  type AdminBusinessCompleteness,
  type AdminBusinessSort,
  getAdminBusinesses,
} from '../../../lib/api';
import { formatNumber, formatRelative, initials } from '../../../lib/format';
import { formatWaDisplay } from '../../../lib/whatsapp';
import { AdminAccessDenied } from '../../../components/admin/AdminAccessDenied';
import { AdminEmptyState } from '../../../components/admin/AdminEmptyState';
import { AdminKpi } from '../../../components/admin/AdminKpi';
import { AdminPagination } from '../../../components/admin/AdminPagination';
import { useDebouncedSearch } from '../../../components/admin/useDebouncedSearch';
import { Badge, Card, PageHeader, Skeleton, btn, field } from '../../../components/dashboard/ui';

type CompletenessFilter = 'semua' | AdminBusinessCompleteness;

const SORT_OPTIONS: Array<{ value: AdminBusinessSort; label: string }> = [
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
              <Skeleton className="h-4 w-48" />
              <Skeleton className="mt-1.5 h-3 w-60" />
            </div>
            <Skeleton className="hidden h-6 w-28 md:block" />
            <Skeleton className="hidden h-4 w-16 md:block" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function AdminBusinessesPage() {
  const { value: search, applied: appliedSearch, update: updateSearch, reset: resetSearch } =
    useDebouncedSearch();
  const [city, setCity] = useState('semua');
  const [category, setCategory] = useState('semua');
  const [completeness, setCompleteness] = useState<CompletenessFilter>('semua');
  const [sort, setSort] = useState<AdminBusinessSort>('newest');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ key: string; data: AdminBusinessesResponse } | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const requestKey = `${appliedSearch}|${city}|${category}|${completeness}|${sort}|${page}|${reloadKey}`;

  useEffect(() => {
    let cancelled = false;
    const key = `${appliedSearch}|${city}|${category}|${completeness}|${sort}|${page}|${reloadKey}`;

    // key mencegah respons lama menimpa hasil filter yang lebih baru.
    getAdminBusinesses({
      q: appliedSearch || undefined,
      city: city === 'semua' ? undefined : city,
      category: category === 'semua' ? undefined : category,
      completeness: completeness === 'semua' ? undefined : completeness,
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
            message: err instanceof Error ? err.message : 'Gagal memuat daftar bisnis.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [appliedSearch, city, category, completeness, sort, page, reloadKey]);

  const data = result?.key === requestKey ? result.data : null;
  // Ringkasan dan opsi filter tetap global agar tidak berkedip saat tabel difilter.
  const summary = result?.data.summary;
  const filterOptions = result?.data.filter_options;
  const errorMessage = error?.key === requestKey ? error.message : '';
  const loading = !data && !errorMessage;
  const filterActive =
    Boolean(search || appliedSearch) ||
    city !== 'semua' ||
    category !== 'semua' ||
    completeness !== 'semua' ||
    sort !== 'newest';

  function reload() {
    setForbidden(false);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  function resetFilters() {
    resetSearch();
    setCity('semua');
    setCategory('semua');
    setCompleteness('semua');
    setSort('newest');
    setPage(1);
    setError(null);
  }

  if (forbidden) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bisnis" description="Daftar bisnis khusus founder Pajangin." />
        <AdminAccessDenied />
      </div>
    );
  }

  const showSummary = Boolean(summary) || loading;
  const cities = filterOptions?.cities ?? [];
  const categories = filterOptions?.categories ?? [];

  return (
    <div className="space-y-6" aria-busy={loading}>
      <PageHeader
        title="Bisnis"
        description="Semua halaman bisnis, kelengkapan konten, dan traffic 30 hari terakhir."
        actions={
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className={btn.secondary}
            aria-label="Muat ulang daftar bisnis"
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
              label="Total bisnis"
              value={summary.total}
              icon={Building2}
              tone="accent"
              hint={`${formatNumber(summary.cities)} kota terdaftar`}
            />
            <AdminKpi
              label="Lengkap"
              value={summary.complete}
              icon={CheckCircle2}
              tone="positive"
              hint="Deskripsi, hero, dan layanan"
            />
            <AdminKpi
              label="Perlu dilengkapi"
              value={summary.incomplete}
              icon={CircleAlert}
              tone="warning"
              hint="Kandidat follow-up"
            />
          </div>
        ) : (
          <SummarySkeleton />
        ))}

      <div className="space-y-3">
        {/* Search ditunda 350ms; filter kota/kategori/kelengkapan langsung memicu fetch. */}
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="admin-business-search" className="sr-only">
              Cari bisnis
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2" />
            <input
              id="admin-business-search"
              type="search"
              value={search}
              onChange={(event) => {
                updateSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama bisnis, slug, kota, atau pemilik…"
              maxLength={120}
              className={`${field.input} pl-9`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
            <div>
              <label htmlFor="admin-business-city" className="sr-only">
                Filter kota
              </label>
              <select
                id="admin-business-city"
                value={city}
                onChange={(event) => {
                  setCity(event.target.value);
                  setPage(1);
                }}
                className={field.input}
              >
                <option value="semua">Semua kota</option>
                {cities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="admin-business-category" className="sr-only">
                Filter kategori
              </label>
              <select
                id="admin-business-category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                className={field.input}
              >
                <option value="semua">Semua kategori</option>
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="admin-business-completeness" className="sr-only">
                Filter kelengkapan
              </label>
              <select
                id="admin-business-completeness"
                value={completeness}
                onChange={(event) => {
                  setCompleteness(event.target.value as CompletenessFilter);
                  setPage(1);
                }}
                className={field.input}
              >
                <option value="semua">Semua kelengkapan</option>
                <option value="lengkap">Lengkap</option>
                <option value="perlu">Perlu dilengkapi</option>
              </select>
            </div>
            <div>
              <label htmlFor="admin-business-sort" className="sr-only">
                Urutkan bisnis
              </label>
              <select
                id="admin-business-sort"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as AdminBusinessSort);
                  setPage(1);
                }}
                className={field.input}
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
              ? `${formatNumber(data.total)} bisnis cocok dengan filter`
              : loading
                ? 'Memuat bisnis…'
                : 'Daftar bisnis'}
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
          <p className="text-sm font-medium text-ink">Daftar bisnis gagal dimuat.</p>
          <p className="mt-1 text-sm text-ink-2">{errorMessage}</p>
          <button type="button" onClick={reload} className={`${btn.secondary} mt-4`}>
            <RefreshCw className="h-4 w-4" /> Coba lagi
          </button>
        </Card>
      ) : loading ? (
        <ListSkeleton />
      ) : data && data.items.length > 0 ? (
        <Card>
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1.15fr)_minmax(0,1.05fr)_minmax(0,0.9fr)] gap-4 border-b border-rule px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-2 md:grid">
            <span>Bisnis</span>
            <span>Pemilik</span>
            <span>Kelengkapan</span>
            <span>Traffic 30 hari</span>
          </div>

          <div className="divide-y divide-rule">
            {data.items.map((business) => (
              <div
                key={business.id}
                className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.15fr)_minmax(0,1.05fr)_minmax(0,0.9fr)] md:items-center md:gap-4"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-paper-2 text-[11px] font-bold text-ink-2">
                    {initials(business.name)}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/${business.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-1 text-sm font-semibold text-ink hover:text-accent"
                    >
                      <span className="truncate">{business.name}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                    <p className="truncate text-xs text-ink-2">/{business.slug}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Badge>{business.city}</Badge>
                      <Badge>{business.category}</Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-ink-2">
                      Dibuat {formatRelative(business.created_at)}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-2 md:hidden">
                    Pemilik
                  </p>
                  <p className="truncate text-sm font-medium text-ink">
                    {business.owner.name || 'Tanpa nama'}
                  </p>
                  <p className="truncate text-xs text-ink-2">{business.owner.email}</p>
                  {business.owner.whatsapp && (
                    <p className="text-xs text-ink-2">
                      {formatWaDisplay(business.owner.whatsapp)}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-2 md:hidden">
                    Kelengkapan
                  </p>
                  <Badge tone={business.completeness === 'lengkap' ? 'positive' : 'warning'}>
                    {business.completeness === 'lengkap' ? 'Lengkap' : 'Perlu dilengkapi'}
                  </Badge>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <Badge tone={business.has_description ? 'positive' : 'warning'}>
                      Deskripsi
                    </Badge>
                    <Badge tone={business.has_hero ? 'positive' : 'warning'}>Hero</Badge>
                    <Badge tone={business.service_count > 0 ? 'positive' : 'warning'}>
                      {business.service_count} layanan
                    </Badge>
                    {business.booking_enabled && <Badge tone="accent">Booking</Badge>}
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-2 md:hidden">
                    Traffic 30 hari
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5 text-ink-2" />
                      {formatNumber(business.page_views_30d)} kunjungan
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5 text-ink-2" />
                      {formatNumber(business.whatsapp_clicks_30d)} klik WA
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink-2">
                    {business.lead_count} lead · {business.booking_count} booking total
                  </p>
                  <p className="text-[11px] text-ink-2">
                    {business.last_activity_at
                      ? `Aktivitas terakhir ${formatRelative(business.last_activity_at)}`
                      : 'Belum ada aktivitas'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <AdminEmptyState
          icon={Search}
          title="Bisnis tidak ditemukan."
          description="Coba kata kunci lain atau longgarkan filter kota, kategori, dan kelengkapan."
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
