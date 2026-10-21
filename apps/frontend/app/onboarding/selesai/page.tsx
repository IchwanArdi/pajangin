'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  QrCode,
  RefreshCw,
  Share2,
  Sparkles,
} from 'lucide-react';
import {
  ApiError,
  getMyBusinesses,
  getPublicBusiness,
  type Business,
  type PublicBusinessResponse,
} from '../../../lib/api';
import { primaryButtonClass, secondaryButtonClass } from '../../../components/auth/AuthShell';
import OnboardingShell from '../../../components/onboarding/OnboardingShell';
import { toWaNumber } from '../../../lib/whatsapp';
import { useBrowserOrigin } from '../../../lib/useBrowserOrigin';

type LoadState = 'loading' | 'ready' | 'error';

export default function OnboardingSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('biz');

  const [state, setState] = useState<LoadState>('loading');
  const [retryKey, setRetryKey] = useState(0);
  const [business, setBusiness] = useState<Business | null>(null);
  const [publicBusiness, setPublicBusiness] = useState<PublicBusinessResponse | null>(null);
  const origin = useBrowserOrigin();
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (!businessId) {
      router.replace('/dashboard');
      return;
    }

    let cancelled = false;

    getMyBusinesses()
      .then(async (list) => {
        const found = list.find((item) => item.id === businessId);
        if (cancelled) return;

        if (!found) {
          // ID tidak dikenal / bukan milik akun ini: jangan tampilkan data bisnis lain.
          router.replace('/dashboard');
          return;
        }

        const publicData = await getPublicBusiness(found.slug, { fresh: true });
        if (cancelled) return;

        setBusiness(found);
        setPublicBusiness(publicData);
        setState('ready');
      })
      .catch((err: unknown) => {
        // 401 sudah ditangani helper API (sign out + redirect ke login).
        if (cancelled || (err instanceof ApiError && err.status === 401)) return;
        setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [businessId, router, retryKey]);

  const retryLoad = () => {
    setState('loading');
    setRetryKey((key) => key + 1);
  };

  if (state === 'error') {
    return (
      <OnboardingShell
        topRight={
          <Link href="/dashboard" className="text-sm font-semibold text-ink-2 hover:text-ink">
            ← Dashboard
          </Link>
        }
      >
        <div className="space-y-4 rounded-3xl border border-rule bg-white p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-negative-soft p-2 text-negative">
              <AlertCircle className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-[-0.02em]">Halaman belum bisa dimuat</h1>
              <p className="text-sm leading-relaxed text-ink-2">
                Halaman bisnis Anda tetap aktif. Coba muat ulang untuk melihat link dan statusnya.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={retryLoad} className={primaryButtonClass}>
              <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
              Coba lagi
            </button>
            <Link href="/dashboard" className={`${secondaryButtonClass} text-center`}>
              Buka dashboard
            </Link>
          </div>
        </div>
      </OnboardingShell>
    );
  }

  if (state !== 'ready' || !business) {
    return <SuccessLoading />;
  }

  const pageUrl = origin ? `${origin}/${business.slug}` : `/${business.slug}`;
  const dashboardHref = `/dashboard?biz=${encodeURIComponent(business.id)}`;
  const qrHref = `/dashboard/qr-bio?biz=${encodeURIComponent(business.id)}`;
  const servicesHref = `/dashboard/layanan?biz=${encodeURIComponent(business.id)}`;
  const profileHref = `/dashboard/profil?biz=${encodeURIComponent(business.id)}`;
  const galleryHref = `/dashboard/galeri?biz=${encodeURIComponent(business.id)}`;

  const shareHref = `https://wa.me/?text=${encodeURIComponent(`Cek halaman bisnis ${business.name}: ${pageUrl}`)}`;
  const testWhatsappHref = `https://wa.me/${toWaNumber(business.whatsapp)}?text=${encodeURIComponent(
    `Tes tombol WhatsApp untuk ${business.name}.`,
  )}`;

  const serviceCount = publicBusiness?.services.length ?? 0;
  const hasPhoto = Boolean(
    business.logo_url || business.hero_image_url || (publicBusiness?.images?.length ?? 0) > 0,
  );
  const statusAvailable = publicBusiness !== null;

  const requiredSteps = [
    ...(!business.description?.trim()
      ? [
          {
            key: 'description',
            label: 'Deskripsi bisnis',
            detail: 'Tambahkan deskripsi singkat agar pelanggan tahu bisnis Anda.',
            href: profileHref,
            cta: 'Isi deskripsi',
          },
        ]
      : []),
    ...(serviceCount < 3
      ? [
          {
            key: 'services',
            label: 'Minimal 3 layanan',
            detail: `Baru ${serviceCount} dari 3 layanan yang disarankan.`,
            href: servicesHref,
            cta: 'Tambah layanan',
          },
        ]
      : []),
    ...(!hasPhoto
      ? [
          {
            key: 'photo',
            label: 'Satu foto utama',
            detail: 'Tambahkan logo atau foto yang mewakili bisnis Anda.',
            href: galleryHref,
            cta: 'Tambah foto',
          },
        ]
      : []),
  ];

  // Jaring pengaman kalau penilaian backend berubah tetapi checklist lokal belum tahu item barunya.
  const missingItems =
    requiredSteps.length > 0
      ? requiredSteps
      : [
          {
            key: 'profile',
            label: 'Lengkapi profil bisnis',
            detail: 'Periksa kembali data bisnis agar halaman siap diindeks.',
            href: profileHref,
            cta: 'Lengkapi',
          },
        ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <OnboardingShell
      topRight={
        <Link href={dashboardHref} className="text-sm font-semibold text-ink-2 hover:text-ink">
          ← Dashboard
        </Link>
      }
    >
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Halaman aktif</p>
        <h1 className="text-2xl font-bold tracking-[-0.03em] sm:text-4xl">Halaman bisnis Anda sudah aktif</h1>
        <p className="text-sm leading-relaxed text-ink-2">
          Link ini bisa langsung dibagikan ke pelanggan, bio Instagram, atau status WhatsApp.
        </p>
      </div>

      <div className="space-y-5 rounded-3xl border border-rule bg-white p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-positive-soft p-2.5 text-positive">
            <CheckCircle2 className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-positive">Aktif</p>
            <h2 className="mt-1 break-words text-xl font-bold tracking-[-0.02em]">{business.name}</h2>
            <p className="mt-1 text-xs text-ink-2">
              {business.category} · {business.city}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-rule bg-paper p-4">
          <p className="text-xs font-medium text-ink-2">Link publik</p>
          <p className="mt-1 break-words font-mono text-sm font-semibold text-ink">{pageUrl}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent underline-offset-2 hover:underline"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              {copyState === 'copied' ? 'Tersalin' : copyState === 'failed' ? 'Gagal menyalin' : 'Salin link'}
            </button>
            <Link
              href={qrHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-2 underline-offset-2 hover:text-ink hover:underline"
            >
              <QrCode className="h-3.5 w-3.5" strokeWidth={1.75} />
              Buat QR
            </Link>
          </div>
          {copyState === 'failed' && (
            <p className="mt-2 text-xs leading-relaxed text-negative">
              Browser tidak mengizinkan salin otomatis. Salin link di atas secara manual.
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={shareHref}
            target="_blank"
            rel="noopener noreferrer"
            className={primaryButtonClass}
          >
            <Share2 className="h-4 w-4" strokeWidth={1.75} />
            Bagikan ke WhatsApp
          </a>
          <a
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${secondaryButtonClass} text-center`}
          >
            <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
            Lihat halaman
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4">
          <a
            href={testWhatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-2 underline-offset-2 hover:text-ink hover:underline"
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
            Tes tombol WhatsApp
          </a>
          <Link href={dashboardHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline">
            Buka dashboard
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      {!statusAvailable ? (
        <div className="space-y-3 rounded-3xl border border-rule bg-white p-6">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-paper-2 p-2 text-ink-2">
              <AlertCircle className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-[-0.015em]">Status Google belum bisa dimuat</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">
                Halaman tetap aktif dan bisa dibagikan. Muat ulang untuk melihat langkah agar siap diindeks.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={retryLoad}
            className={`${secondaryButtonClass} sm:w-auto`}
          >
            <RefreshCw className="h-4 w-4" strokeWidth={1.75} />
            Muat ulang status
          </button>
        </div>
      ) : publicBusiness?.complete ? (
        <div className="space-y-2 rounded-3xl border border-positive/25 bg-positive-soft p-6">
          <div className="flex items-center gap-2 text-positive">
            <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />
            <h2 className="text-lg font-bold tracking-[-0.015em]">Siap diindeks Google</h2>
          </div>
          <p className="text-sm leading-relaxed text-ink-2">
            Deskripsi, layanan, dan foto sudah lengkap. Google tetap butuh beberapa hari untuk menemukan dan
            menampilkan halaman ini di hasil pencarian.
          </p>
        </div>
      ) : (
        <div className="space-y-4 rounded-3xl border border-rule bg-white p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-paper-2 p-2 text-ink-2">
              <Sparkles className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-[-0.015em]">
                Tinggal {missingItems.length} langkah agar siap diindeks Google
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-ink-2">
                Halaman sudah aktif. Lengkapi bagian berikut agar Google bisa menemukan halaman Anda.
              </p>
            </div>
          </div>

          <ul className="space-y-2">
            {missingItems.map((item) => (
              <li
                key={item.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rule bg-paper p-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-2">{item.detail}</p>
                </div>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-accent underline-offset-2 hover:underline"
                >
                  {item.cta}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </OnboardingShell>
  );
}

function SuccessLoading() {
  return (
    <OnboardingShell>
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" strokeWidth={1.75} />
        <p className="text-sm font-semibold text-ink">Menyiapkan halaman…</p>
        <p className="max-w-xs text-xs leading-relaxed text-ink-2">
          Kami mengambil link dan status kesiapan halaman bisnis Anda.
        </p>
      </div>
    </OnboardingShell>
  );
}
