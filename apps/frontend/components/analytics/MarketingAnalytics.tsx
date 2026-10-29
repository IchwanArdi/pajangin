'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';
import {
  CLARITY_PROJECT_ID,
  GA_MEASUREMENT_ID,
  acquisitionUserProperties,
  captureAcquisition,
  clearAnalyticsCookies,
  clearPendingAuthEvent,
  consumeAuthEventCookie,
  flushPendingAuthEvent,
  getConsent,
  initClarity,
  initGa,
  isAllowedAnalyticsHost,
  isAnalyticsConfigured,
  isTrackedPath,
  setUserId,
  setUserProperties,
  storeConsent,
  storePendingAuthEvent,
  subscribeToConsent,
  trackPageView,
  type ConsentChoice,
} from '../../lib/marketing-analytics';

const emptySubscribe = () => () => {};

export default function MarketingAnalytics() {
  const pathname = usePathname();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const consent = useSyncExternalStore(subscribeToConsent, getConsent, () => null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    captureAcquisition();

    const authEvent = consumeAuthEventCookie();
    if (authEvent) storePendingAuthEvent(authEvent);

    const openSettings = () => setSettingsOpen(true);
    window.addEventListener('pajangin:open-consent', openSettings);
    return () => window.removeEventListener('pajangin:open-consent', openSettings);
  }, []);

  // Inisialisasi script setelah consent diberikan. Efek ini sengaja diletakkan
  // sebelum page view agar config GA4 masuk antrean lebih dulu.
  useEffect(() => {
    if (!mounted || consent !== 'granted' || !isAllowedAnalyticsHost()) return;
    if (GA_MEASUREMENT_ID) initGa();
    if (CLARITY_PROJECT_ID) initClarity();
    flushPendingAuthEvent();
  }, [mounted, consent]);

  useEffect(() => {
    if (!mounted || consent !== 'granted') return;
    trackPageView(pathname);
  }, [mounted, consent, pathname]);

  // Kirim ID pseudonim dan atribusi first-touch sebagai user property GA4.
  // Jangan pernah mengirim email, nama, atau nomor WhatsApp.
  useEffect(() => {
    if (!mounted || consent !== 'granted' || !GA_MEASUREMENT_ID) return;

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      return;
    }
    let active = true;
    const applyUser = (user: { id: string } | null | undefined) => {
      if (!active || !user) return;
      setUserId(user.id);
      setUserProperties(acquisitionUserProperties());
    };

    supabase.auth
      .getSession()
      .then(({ data }) => applyUser(data.session?.user))
      .catch(() => undefined);
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [mounted, consent]);

  const choose = (choice: ConsentChoice) => {
    const previous = getConsent();
    storeConsent(choice);
    setSettingsOpen(false);

    if (choice === 'denied') {
      clearAnalyticsCookies();
      clearPendingAuthEvent();
      // Kalau sebelumnya sudah menerima, reload untuk menghentikan script yang
      // sudah terlanjur dimuat.
      if (previous === 'granted') window.location.reload();
    }
  };

  const bannerOpen = mounted && isTrackedPath(pathname) && (settingsOpen || consent === null);
  const analyticsActive = consent === 'granted';
  const analyticsDenied = consent === 'denied';

  if (!bannerOpen || !isAnalyticsConfigured() || !isAllowedAnalyticsHost()) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5" role="region" aria-label="Preferensi analitik">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-rule bg-surface p-4 shadow-window sm:flex-row sm:items-start sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-ink-3">Privasi</p>
          <p className="mt-1 text-sm font-semibold text-ink">
            {analyticsActive ? 'Analitik sedang aktif' : analyticsDenied ? 'Analitik nonaktif' : 'Boleh kami pakai analitik?'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-2">
            {analyticsActive
              ? 'Google Analytics dan Microsoft Clarity aktif. Kami tidak mengirim nama, email, atau nomor WhatsApp. Anda bisa mematikannya kapan saja.'
              : analyticsDenied
                ? 'Kami tidak memuat Google Analytics atau Microsoft Clarity. Anda bisa mengaktifkannya kapan saja tanpa kehilangan fitur.'
                : 'Kami memakai Google Analytics dan Microsoft Clarity untuk memahami halaman mana yang membantu pemilik usaha. Tidak ada nama, email, atau nomor WhatsApp yang dikirim.'}{' '}
            <Link href="/privasi#cookie" className="font-medium text-ink underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
              Pelajari
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={analyticsDenied ? () => setSettingsOpen(false) : () => choose('denied')}
            className="press inline-flex items-center justify-center rounded-full border border-rule bg-surface px-4 py-2 text-xs font-semibold text-ink transition hover:bg-paper-2"
          >
            {analyticsActive ? 'Matikan analitik' : analyticsDenied ? 'Tutup' : 'Tolak'}
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="press inline-flex items-center justify-center rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-ink-3"
          >
            {analyticsActive ? 'Tetap aktif' : analyticsDenied ? 'Aktifkan analitik' : 'Terima analitik'}
          </button>
        </div>
      </div>
    </div>
  );
}
