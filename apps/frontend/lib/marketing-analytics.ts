'use client';

import {
  ACQUISITION_COOKIE,
  ACQUISITION_MAX_AGE_DAYS,
  AUTH_EVENT_COOKIE,
  AUTH_EVENT_STORAGE_KEY,
  CONSENT_STORAGE_KEY,
  hasCampaign,
  parseAcquisition,
  serializeAcquisition,
  type Acquisition,
} from './acquisition';

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;
export type ConsentChoice = 'granted' | 'denied';

export const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '').trim();
export const CLARITY_PROJECT_ID = (process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '').trim();
const APP_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || '').hostname;
  } catch {
    return '';
  }
})();
const DEBUG = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === '1';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
    __pajanginGtagInitialized?: boolean;
    __pajanginClarityInitialized?: boolean;
  }
}

const TRACKED_EXACT = new Set(['/', '/pricing', '/contoh', '/privasi', '/syarat']);
const TRACKED_PREFIXES = ['/login', '/onboarding'];

export function isAnalyticsConfigured(): boolean {
  return Boolean(GA_MEASUREMENT_ID || CLARITY_PROJECT_ID);
}

export function isTrackedPath(pathname: string): boolean {
  return TRACKED_EXACT.has(pathname) || TRACKED_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

// Hanya production host yang diizinkan. Preview Vercel dan localhost tidak boleh
// mengotori data. Untuk QA lokal, set NEXT_PUBLIC_ANALYTICS_DEBUG=1.
export function isAllowedAnalyticsHost(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  if (DEBUG && (hostname === 'localhost' || hostname === '127.0.0.1')) return true;
  return Boolean(APP_HOST) && hostname === APP_HOST;
}

export function getConsent(): ConsentChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export function subscribeToConsent(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('pajangin:consent-changed', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('pajangin:consent-changed', callback);
    window.removeEventListener('storage', callback);
  };
}

export function storeConsent(choice: ConsentChoice): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Storage bisa diblokir; banner tetap boleh ditutup untuk sesi ini.
  }
  window.dispatchEvent(new CustomEvent<ConsentChoice>('pajangin:consent-changed', { detail: choice }));
}

export function openConsentSettings(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('pajangin:open-consent'));
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  for (const item of document.cookie.split(';')) {
    const cookie = item.trim();
    if (cookie.startsWith(prefix)) return cookie.slice(prefix.length);
  }
  return null;
}

function cookieSecurity(): string {
  return window.location.protocol === 'https:' ? '; Secure' : '';
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${cookieSecurity()}`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${cookieSecurity()}`;
}

function inferSource(referrer: string): Pick<Acquisition, 'source' | 'medium'> {
  const value = referrer.toLowerCase();
  if (!value) return {};
  if (value.includes('google.')) return { source: 'google', medium: 'organic' };
  if (value.includes('instagram.')) return { source: 'instagram', medium: 'social' };
  if (value.includes('tiktok.')) return { source: 'tiktok', medium: 'social' };
  if (value.includes('facebook.') || value.includes('fb.')) return { source: 'facebook', medium: 'social' };
  if (value.includes('whatsapp.') || value.includes('wa.me')) return { source: 'whatsapp', medium: 'social' };
  if (value.includes('linkedin.')) return { source: 'linkedin', medium: 'social' };
  return { source: 'referral', medium: 'referral' };
}

// Simpan atribusi first-touch di cookie first-party. Cookie ini bukan cookie
// iklan dan hanya dipakai untuk menghubungkan kunjungan ke pendaftaran.
export function captureAcquisition(): Acquisition | null {
  if (typeof window === 'undefined') return null;

  const existing = parseAcquisition(readCookie(ACQUISITION_COOKIE));
  if (existing) return existing;

  const params = new URLSearchParams(window.location.search);
  const externalReferrer =
    document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : '';
  const campaign: Acquisition = {
    source: params.get('utm_source')?.trim() || undefined,
    medium: params.get('utm_medium')?.trim() || undefined,
    campaign: params.get('utm_campaign')?.trim() || undefined,
    content: params.get('utm_content')?.trim() || undefined,
    term: params.get('utm_term')?.trim() || undefined,
    gclid: params.get('gclid')?.trim() || undefined,
    fbclid: params.get('fbclid')?.trim() || undefined,
    referrer: externalReferrer || undefined,
    landing_page: `${window.location.pathname}${window.location.search}`,
    captured_at: new Date().toISOString(),
  };

  if (!hasCampaign(campaign)) {
    const inferred = inferSource(externalReferrer);
    // Jangan menyimpan "direct" atau navigasi internal sebagai first-touch.
    // Kalau pengunjung datang dari kampanye lain setelahnya, kampanye itu yang
    // layak dicatat.
    if (!inferred.source) return null;
    campaign.source = inferred.source;
    campaign.medium = inferred.medium;
  }

  writeCookie(ACQUISITION_COOKIE, serializeAcquisition(campaign), ACQUISITION_MAX_AGE_DAYS * 24 * 60 * 60);
  return campaign;
}

export function getAcquisition(): Acquisition | null {
  if (typeof window === 'undefined') return null;
  return parseAcquisition(readCookie(ACQUISITION_COOKIE));
}

export function acquisitionEventParams(): AnalyticsParams {
  const acquisition = getAcquisition();
  return {
    acq_source: acquisition?.source,
    acq_medium: acquisition?.medium,
    acq_campaign: acquisition?.campaign,
    acq_content: acquisition?.content,
  };
}

export function acquisitionUserProperties(): AnalyticsParams {
  const acquisition = getAcquisition();
  return {
    acquisition_source: acquisition?.source || 'direct',
    acquisition_medium: acquisition?.medium || 'direct',
    acquisition_campaign: acquisition?.campaign,
    plan_type: 'free',
  };
}

export function initGa(): boolean {
  if (typeof window === 'undefined' || !GA_MEASUREMENT_ID || !isAllowedAnalyticsHost()) return false;
  if (window.__pajanginGtagInitialized) return true;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // Snippet resmi gtag memakai objek arguments, bukan array biasa.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });

  if (!document.getElementById('pajangin-ga4')) {
    const script = document.createElement('script');
    script.id = 'pajangin-ga4';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
  }

  window.__pajanginGtagInitialized = true;
  return true;
}

export function initClarity(): boolean {
  if (typeof window === 'undefined' || !CLARITY_PROJECT_ID || !isAllowedAnalyticsHost()) return false;
  if (window.__pajanginClarityInitialized) return true;

  // Snippet resmi Clarity, dimuat hanya setelah consent analitik diberikan.
  const inline = document.createElement('script');
  inline.text = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", ${JSON.stringify(CLARITY_PROJECT_ID)});`;
  document.head.appendChild(inline);
  window.__pajanginClarityInitialized = true;
  return true;
}

export function track(event: string, params?: AnalyticsParams): void {
  if (typeof window === 'undefined' || getConsent() !== 'granted' || !GA_MEASUREMENT_ID || !isAllowedAnalyticsHost()) return;
  initGa();
  window.gtag?.('event', event, params || {});
}

export function trackPageView(pathname: string): void {
  if (!isTrackedPath(pathname)) return;
  track('page_view', {
    page_path: pathname,
    page_location: typeof window !== 'undefined' ? window.location.href : undefined,
    page_title: typeof document !== 'undefined' ? document.title : undefined,
  });
}

export function setUserProperties(properties: AnalyticsParams): void {
  if (typeof window === 'undefined' || getConsent() !== 'granted' || !GA_MEASUREMENT_ID || !isAllowedAnalyticsHost()) return;
  initGa();
  window.gtag?.('set', 'user_properties', properties);
}

export function setUserId(userId: string): void {
  if (typeof window === 'undefined' || getConsent() !== 'granted' || !GA_MEASUREMENT_ID || !isAllowedAnalyticsHost()) return;
  initGa();
  window.gtag?.('config', GA_MEASUREMENT_ID, { user_id: userId, send_page_view: false });
}

export function consumeAuthEventCookie(): string | null {
  const value = readCookie(AUTH_EVENT_COOKIE);
  if (!value) return null;
  deleteCookie(AUTH_EVENT_COOKIE);
  return value === 'sign_up' || value === 'login' ? value : null;
}

export function storePendingAuthEvent(event: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(AUTH_EVENT_STORAGE_KEY, event);
  } catch {
    // Abaikan storage yang diblokir.
  }
}

export function clearPendingAuthEvent(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(AUTH_EVENT_STORAGE_KEY);
  } catch {
    // Abaikan storage yang diblokir.
  }
}

export function flushPendingAuthEvent(): void {
  if (typeof window === 'undefined' || getConsent() !== 'granted') return;
  let event: string | null = null;
  try {
    event = window.sessionStorage.getItem(AUTH_EVENT_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_EVENT_STORAGE_KEY);
  } catch {
    event = null;
  }
  if (event !== 'sign_up' && event !== 'login') return;
  track(event, { method: 'google', ...acquisitionEventParams() });
}

export function clearAnalyticsCookies(): void {
  if (typeof document === 'undefined') return;
  for (const item of document.cookie.split(';')) {
    const name = item.trim().split('=')[0];
    if (/^(_ga|_gid|_gat|_clck|_clsk|_clarity)/.test(name)) deleteCookie(name);
  }
}
