'use client';

/* Hallmark · page: Ringkasan · genre: modern-minimal · theme: Coral (design.md) · macrostructure: Workbench (app)
 * Menjawab 3 pertanyaan dalam 3 detik: berapa yang menghubungi? naik/turun? apa yang harus dilakukan?
 * Motion (3 primitif, semua bermotivasi): grafik transisi saat periode berubah · skeleton→konten · item aktivitas baru. */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ApiError, DashboardOverview, getDashboardOverview, getMarketingInsights, getTimeseries, MarketingInsight, TimeseriesPoint } from '../../lib/api';
import { useBusiness } from '../../components/dashboard/BusinessContext';
import { ShareMenu } from '../../components/dashboard/ShareMenu';
import { Card, CardHeader, InfoNote, PageHeader, Skeleton } from '../../components/dashboard/ui';
import { KpiHero } from '../../components/dashboard/overview/KpiHero';
import { PERIODS, PeriodDays, PeriodTabs } from '../../components/dashboard/overview/PeriodTabs';
import { TrendChart } from '../../components/dashboard/overview/TrendChart';
import { Funnel } from '../../components/dashboard/overview/Funnel';
import { Recommendations } from '../../components/dashboard/overview/Recommendations';
import { SourceList } from '../../components/dashboard/overview/SourceList';
import { ServiceRanking } from '../../components/dashboard/overview/ServiceRanking';
import { ActivityFeed } from '../../components/dashboard/overview/ActivityFeed';
import { getSetupSteps, SetupChecklist } from '../../components/dashboard/overview/SetupChecklist';

const PERIOD_KEY = 'mos_period';

interface OverviewData {
  key: string; // `${businessId}:${period}:${reloadKey}` — data milik permintaan yang mana
  businessId: string;
  overview: DashboardOverview;
  points: TimeseriesPoint[];
  insights: MarketingInsight[];
}

// periode terakhir yang dipilih (aman: halaman baru dirender setelah data bisnis dimuat di client)
function readSavedPeriod(): PeriodDays {
  if (typeof window === 'undefined') return 30;
  const saved = Number(localStorage.getItem(PERIOD_KEY));
  return (PERIODS.find((p) => p.days === saved)?.days ?? 30) as PeriodDays;
}

export default function RingkasanPage() {
  const { business } = useBusiness();
  const [period, setPeriod] = useState<PeriodDays>(readSavedPeriod);
  const [result, setResult] = useState<OverviewData | null>(null);
  const [error, setError] = useState<{ key: string; message: string } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [shareNotice, setShareNotice] = useState(false);

  const changePeriod = (p: PeriodDays) => {
    setPeriod(p);
    localStorage.setItem(PERIOD_KEY, String(p));
  };

  const businessId = business?.id;
  const requestKey = `${businessId}:${period}:${reloadKey}`;

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    Promise.all([getDashboardOverview(businessId, period), getTimeseries(businessId, period), getMarketingInsights(businessId, period)])
      .then(([overview, ts, insights]) => {
        if (!cancelled) setResult({ key: requestKey, businessId, overview, points: ts.points, insights });
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof ApiError && err.status === 401)) return;
        setError({ key: requestKey, message: err instanceof Error ? err.message : 'Gagal memuat data.' });
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, period, requestKey]);

  // data bisnis lain tidak pernah ditampilkan; data periode sebelumnya tetap tampil (redup) selama memuat
  const data = result && result.businessId === businessId ? result : null;
  const loading = !data || data.key !== requestKey;
  const errorMessage = error?.key === requestKey ? error.message : '';

  const copyLink = useCallback(async () => {
    if (!business) return;
    await navigator.clipboard.writeText(`${window.location.origin}/${business.slug}`);
    setShareNotice(true);
    setTimeout(() => setShareNotice(false), 2200);
  }, [business]);

  if (!business) return <OverviewSkeleton />;

  const periodLabel = PERIODS.find((p) => p.days === period)!.label;
  const isEmpty = data !== null && data.overview.overview.visitors === 0;
  const steps = data ? getSetupSteps(business, data.overview.topServices.length, !isEmpty) : [];
  const setupIncomplete = steps.some((s) => !s.done);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ringkasan"
        helpKey="ringkasan"
        description={
          <>
            {business.name} · {periodLabel} terakhir
            <span role="status" aria-live="polite" className={`ml-2 font-medium text-positive transition-opacity ${shareNotice ? 'opacity-100' : 'opacity-0'}`}>
              {shareNotice ? 'Link tersalin' : ''}
            </span>
          </>
        }
        actions={
          <>
            <PeriodTabs value={period} onChange={changePeriod} />
            <div className="hidden lg:block">
              <ShareMenu slug={business.slug} name={business.name} />
            </div>
          </>
        }
      />

      {isEmpty && (
        <InfoNote>
          <strong>Halaman Anda sudah aktif.</strong> Angka di Ringkasan akan terisi setelah link dibagikan. Mulai dari langkah berikutnya di
          bawah, atau buka tombol bantuan (?) di samping judul.
        </InfoNote>
      )}

      {errorMessage && (
        <Card className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink">{errorMessage}</p>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="text-sm font-semibold text-accent hover:underline">
            Coba lagi
          </button>
        </Card>
      )}

      {!data ? (
        !errorMessage && <OverviewSkeleton inner />
      ) : (
        <div className={`space-y-6 transition-opacity duration-200 ${loading && !errorMessage ? 'opacity-60' : 'opacity-100'}`} aria-busy={loading}>
          <KpiHero data={data.overview} periodLabel={periodLabel} />

          <Card>
            <CardHeader title="Yang perlu Anda lakukan" description={data.insights.length > 0 ? `${data.insights.length} rekomendasi dari data ${periodLabel} terakhir` : undefined} className="pb-4" />
            <Recommendations insights={data.insights} businessId={business.id} onShare={copyLink} onChanged={() => setReloadKey((k) => k + 1)} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <div className="space-y-6 lg:col-span-2">
              {isEmpty ? (
                <Card>
                  <CardHeader
                    title="Langkah berikutnya"
                    description="Semakin lengkap halaman, semakin siap dibagikan ke calon pelanggan."
                    className="pb-4"
                  />
                  <SetupChecklist steps={steps} onShare={copyLink} />
                </Card>
              ) : (
                <>
                  <Card className="pb-3">
                    <CardHeader title="Tren harian" description="Pengunjung dan kontak per hari" className="pb-4" />
                    <TrendChart points={data.points} />
                  </Card>

                  <Card>
                    <CardHeader title="Perjalanan pengunjung" description="Dari membuka halaman sampai menghubungi Anda" className="pb-4" />
                    <Funnel funnel={data.overview.funnel} />
                  </Card>
                </>
              )}

              <Card>
                <CardHeader
                  title="Layanan paling dilirik"
                  description={`Buka layanan dan klik WhatsApp, ${periodLabel} terakhir`}
                  action={
                    <Link href="/dashboard/layanan" className="text-sm font-semibold text-accent hover:underline">
                      Kelola
                    </Link>
                  }
                  className="pb-4"
                />
                <ServiceRanking services={data.overview.topServices} />
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Aktivitas terbaru"
                  description="Diperbarui otomatis"
                  action={
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-positive">
                      <span className="h-1.5 w-1.5 rounded-full bg-positive" aria-hidden="true" /> Langsung
                    </span>
                  }
                  className="pb-3"
                />
                <ActivityFeed businessId={business.id} />
              </Card>

              <Card>
                <CardHeader title="Sumber pengunjung" description="Dari mana orang menemukan Anda" className="pb-3" />
                <SourceList sources={data.overview.trafficSources} />
              </Card>

              {!isEmpty && setupIncomplete && (
                <Card>
                  <CardHeader title="Lengkapi halaman Anda" description="Halaman yang lengkap lebih sering di-chat" className="pb-4" />
                  <SetupChecklist steps={steps} onShare={copyLink} />
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton mengikuti bentuk layout akhir (bukan spinner)
function OverviewSkeleton({ inner = false }: { inner?: boolean }) {
  return (
    <div className="space-y-6" aria-hidden="true">
      {!inner && (
        <div className="flex items-end justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-56 rounded-full" />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-end">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-14 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-24 w-full rounded-(--radius-card)" />
      </div>
      <Skeleton className="h-36 w-full rounded-(--radius-card)" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 w-full rounded-(--radius-card) lg:col-span-2" />
        <Skeleton className="h-80 w-full rounded-(--radius-card)" />
      </div>
    </div>
  );
}
