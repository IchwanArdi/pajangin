'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Building2,
  ExternalLink,
  Eye,
  MessageSquarePlus,
  RefreshCw,
  Star,
  Users,
} from 'lucide-react';
import { AdminOverview, ApiError, getAdminOverview } from '../../lib/api';
import { formatNumber, formatRelative, initials } from '../../lib/format';
import { AdminAccessDenied } from '../../components/admin/AdminAccessDenied';
import { AdminKpi } from '../../components/admin/AdminKpi';
import { AdminTrendChart } from '../../components/admin/AdminTrendChart';
import { Badge, Card, CardHeader, PageHeader, Skeleton, btn } from '../../components/dashboard/ui';
import { Delta } from '../../components/dashboard/overview/Delta';
import { PERIODS, PeriodTabs, type PeriodDays } from '../../components/dashboard/overview/PeriodTabs';
import type { FeedbackCategory } from '../../lib/api';

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

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-44" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-9 w-20" />
            <Skeleton className="mt-2 h-4 w-32" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,1fr)]">
        <Card className="p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-64 w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-5 h-40 w-full" />
        </Card>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: FeedbackCategory }) {
  return <Badge tone={CATEGORY_TONES[category]}>{CATEGORY_LABELS[category]}</Badge>;
}

export default function AdminOverviewPage() {
  const [period, setPeriod] = useState<PeriodDays>(30);
  const [result, setResult] = useState<{ key: string; data: AdminOverview } | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${period}:${reloadKey}`;

  useEffect(() => {
    let cancelled = false;
    const key = `${period}:${reloadKey}`;

    getAdminOverview(period)
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
            message: err instanceof Error ? err.message : 'Gagal memuat ringkasan admin.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period, reloadKey]);

  const data = result?.key === requestKey ? result.data : null;
  const errorMessage = error?.key === requestKey ? error.message : '';
  const loading = !data && !errorMessage;
  const periodLabel = PERIODS.find((item) => item.days === period)?.label ?? '30 hari';

  function reload() {
    setForbidden(false);
    setError(null);
    setReloadKey((key) => key + 1);
  }

  if (forbidden) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Pajangin" description="Khusus founder platform." />
        <AdminAccessDenied />
      </div>
    );
  }

  if (loading) return <OverviewSkeleton />;

  if (errorMessage) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ringkasan Pajangin" description="Khusus founder platform." />
        <Card className="p-6">
          <p className="text-sm font-medium text-ink">Data admin gagal dimuat.</p>
          <p className="mt-1 text-sm text-ink-2">{errorMessage}</p>
          <button type="button" onClick={reload} className={`${btn.secondary} mt-4`}>
            <RefreshCw className="h-4 w-4" /> Coba lagi
          </button>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const hasBusinesses = data.businesses.total > 0;
  const activation = [
    { label: 'Sudah punya layanan', value: data.businesses.with_services },
    { label: 'Sudah punya foto hero', value: data.businesses.with_hero },
    { label: 'Booking aktif', value: data.businesses.booking_enabled },
    { label: `Punya traffic ${periodLabel.toLowerCase()}`, value: data.businesses.with_traffic },
  ];
  const cityMax = Math.max(...data.top_cities.map((item) => item.count), 1);
  const categoryMax = Math.max(...data.top_categories.map((item) => item.count), 1);

  return (
    <div className="space-y-6" aria-busy={loading}>
      <PageHeader
        title="Ringkasan Pajangin"
        description={
          <>
            Kondisi platform {periodLabel.toLowerCase()} terakhir
            <span className="mx-1.5 text-rule">·</span>
            <span className="text-ink-2">{formatNumber(data.users.total)} akun, {formatNumber(data.businesses.total)} bisnis</span>
          </>
        }
        actions={
          <>
            <PeriodTabs value={period} onChange={setPeriod} />
            <button
              type="button"
              onClick={reload}
              className={btn.secondary}
              aria-label="Muat ulang ringkasan"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Muat ulang</span>
            </button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpi
          label="Akun terdaftar"
          value={data.users.total}
          icon={Users}
          tone="accent"
          delta={data.users.delta}
          hint={`${formatNumber(data.users.new)} baru · ${formatNumber(data.users.with_business)} punya bisnis`}
        />
        <AdminKpi
          label="Bisnis"
          value={data.businesses.total}
          icon={Building2}
          tone="positive"
          delta={data.businesses.delta}
          hint={`${formatNumber(data.businesses.new)} baru · ${formatNumber(data.businesses.with_services)} punya layanan`}
        />
        <AdminKpi
          label="Masukan baru"
          value={data.feedback.unread}
          icon={MessageSquarePlus}
          tone="warning"
          hint={
            <span>
              {formatNumber(data.feedback.total)} total
              {data.feedback.average_rating !== null && (
                <span className="inline-flex items-center gap-1">
                  <span className="mx-0.5 text-rule">·</span>
                  <Star className="h-3 w-3 fill-current text-warning" />
                  {data.feedback.average_rating.toLocaleString('id-ID', { maximumFractionDigits: 1 })}
                </span>
              )}
            </span>
          }
        />
        <AdminKpi
          label={`Kunjungan ${periodLabel.toLowerCase()}`}
          value={data.activity.page_views}
          icon={Eye}
          delta={data.activity.page_views_delta}
          hint={`${formatNumber(data.activity.whatsapp_clicks)} klik WhatsApp`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,1fr)]">
        <Card>
          <CardHeader
            title="Pertumbuhan pengguna"
            description={`Akun dan bisnis baru per hari, ${periodLabel.toLowerCase()} terakhir.`}
            action={
              <Link href="/admin/masukan" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                Lihat masukan <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          <AdminTrendChart points={data.series} />
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Aktivitas platform" description={`Total ${periodLabel.toLowerCase()} terakhir.`} />
            <div className="px-5 pb-3 pt-2">
              {[
                { label: 'Kunjungan halaman', value: data.activity.page_views, delta: data.activity.page_views_delta },
                { label: 'Klik WhatsApp', value: data.activity.whatsapp_clicks, delta: data.activity.whatsapp_clicks_delta },
                { label: 'Pesan form', value: data.activity.leads, delta: data.activity.leads_delta },
                { label: 'Reservasi', value: data.activity.bookings, delta: data.activity.bookings_delta },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3 border-t border-rule py-3 first:border-t-0">
                  <span className="text-sm text-ink-2">{row.label}</span>
                  <div className="text-right">
                    <p className="text-base font-semibold tabular-nums text-ink">{formatNumber(row.value)}</p>
                    {row.delta !== null && <Delta value={row.delta} />}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Aktivasi bisnis" description={hasBusinesses ? `Dari ${formatNumber(data.businesses.total)} bisnis terdaftar.` : 'Belum ada bisnis.'} />
            <div className="space-y-4 px-5 pb-5 pt-4">
              {activation.map((item) => {
                const pct = hasBusinesses ? Math.round((item.value / data.businesses.total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-ink-2">{item.label}</span>
                      <span className="font-semibold tabular-nums text-ink">
                        {formatNumber(item.value)}
                        <span className="ml-1 font-normal text-ink-2">({pct}%)</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-3">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,1fr)]">
        <Card>
          <CardHeader
            title="Masukan terbaru"
            description="Ide, kritik, dan laporan bug dari pemilik usaha."
            action={
              <Link href="/admin/masukan" className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                Buka inbox <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {data.recent_feedback.length === 0 ? (
            <div className="px-5 pb-6 pt-5 text-sm text-ink-2">
              Belum ada masukan. Form masukan ada di dashboard pemilik usaha.
            </div>
          ) : (
            <div className="divide-y divide-rule px-5 pb-2 pt-1">
              {data.recent_feedback.map((item) => (
                <div key={item.id} className="py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <CategoryBadge category={item.category} />
                    <span className="text-xs text-ink-2">
                      {item.user_name || item.user_email || 'Pengguna'} · {formatRelative(item.created_at)}
                    </span>
                    {item.rating !== null && (
                      <span className="inline-flex items-center gap-0.5 text-xs text-warning">
                        <Star className="h-3 w-3 fill-current" /> {item.rating}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Sebaran bisnis" description="Kota dan kategori terbanyak." />
          <div className="space-y-5 px-5 pb-5 pt-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-2">Kota</p>
              {data.top_cities.length === 0 ? (
                <p className="text-sm text-ink-2">Belum ada data.</p>
              ) : (
                <div className="space-y-2.5">
                  {data.top_cities.map((item) => (
                    <div key={item.city}>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate text-ink-2">{item.city}</span>
                        <span className="font-semibold tabular-nums text-ink">{item.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-3">
                        <div className="h-full rounded-full bg-ink-2/50" style={{ width: `${(item.count / cityMax) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-2">Kategori</p>
              {data.top_categories.length === 0 ? (
                <p className="text-sm text-ink-2">Belum ada data.</p>
              ) : (
                <div className="space-y-2.5">
                  {data.top_categories.map((item) => (
                    <div key={item.category}>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate text-ink-2">{item.category}</span>
                        <span className="font-semibold tabular-nums text-ink">{item.count}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper-3">
                        <div className="h-full rounded-full bg-accent/60" style={{ width: `${(item.count / categoryMax) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader
            title="Akun terbaru"
            description="Profil yang baru dibuat."
            action={
              <Link
                href="/admin/pengguna"
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-2 hover:text-ink"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {data.recent_users.length === 0 ? (
            <p className="px-5 pb-6 pt-5 text-sm text-ink-2">Belum ada akun.</p>
          ) : (
            <div className="divide-y divide-rule px-5 pb-2 pt-1">
              {data.recent_users.map((user) => (
                <div key={user.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper-2 text-[11px] font-bold text-ink-2">
                    {initials(user.name || user.email)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{user.name || 'Tanpa nama'}</p>
                    <p className="truncate text-xs text-ink-2">{user.email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-ink-2">{user.business_count} bisnis</p>
                    <p className="text-[11px] text-ink-2">{formatRelative(user.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Bisnis terbaru"
            description="Halaman publik yang baru dibuat."
            action={
              <Link
                href="/admin/bisnis"
                className="inline-flex items-center gap-1 text-xs font-medium text-ink-2 hover:text-ink"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {data.recent_businesses.length === 0 ? (
            <p className="px-5 pb-6 pt-5 text-sm text-ink-2">Belum ada bisnis.</p>
          ) : (
            <div className="divide-y divide-rule px-5 pb-2 pt-1">
              {data.recent_businesses.map((business) => (
                <div key={business.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-[11px] font-bold text-accent">
                    {initials(business.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/${business.slug}`}
                      target="_blank"
                      className="inline-flex max-w-full items-center gap-1 text-sm font-medium text-ink hover:text-accent"
                    >
                      <span className="truncate">{business.name}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </Link>
                    <p className="truncate text-xs text-ink-2">
                      {business.city} · {business.category}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="max-w-28 truncate text-xs text-ink-2">{business.owner_name}</p>
                    <p className="text-[11px] text-ink-2">{formatRelative(business.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-ink-2">
        <Activity className="h-3.5 w-3.5" />
        Metrik dihitung dari data first-party Pajangin. Tidak ada revenue karena produk 100% gratis.
      </p>
    </div>
  );
}
