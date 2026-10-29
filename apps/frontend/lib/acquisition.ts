// Atribusi first-touch untuk kampanye marketing.
// Cookie ini sengaja hanya berisi parameter kampanye, bukan data pribadi.

export interface Acquisition {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landing_page?: string;
  captured_at?: string;
}

export const ACQUISITION_COOKIE = 'pajangin_acquisition';
export const AUTH_EVENT_COOKIE = 'pajangin_auth_event';
export const AUTH_EVENT_STORAGE_KEY = 'pajangin_pending_auth_event';
export const CONSENT_STORAGE_KEY = 'pajangin_consent_v1';
export const ACQUISITION_MAX_AGE_DAYS = 90;

function clean(value: string | null | undefined, max = 300): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

export function parseAcquisition(value: string | null | undefined): Acquisition | null {
  if (!value) return null;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Biarkan JSON mentah jika nilai cookie tidak pernah di-encode.
  }

  try {
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;

    const acquisition: Acquisition = {
      source: clean(typeof parsed.source === 'string' ? parsed.source : undefined, 120),
      medium: clean(typeof parsed.medium === 'string' ? parsed.medium : undefined, 120),
      campaign: clean(typeof parsed.campaign === 'string' ? parsed.campaign : undefined, 160),
      content: clean(typeof parsed.content === 'string' ? parsed.content : undefined, 160),
      term: clean(typeof parsed.term === 'string' ? parsed.term : undefined, 160),
      gclid: clean(typeof parsed.gclid === 'string' ? parsed.gclid : undefined, 300),
      fbclid: clean(typeof parsed.fbclid === 'string' ? parsed.fbclid : undefined, 300),
      referrer: clean(typeof parsed.referrer === 'string' ? parsed.referrer : undefined, 1000),
      landing_page: clean(typeof parsed.landing_page === 'string' ? parsed.landing_page : undefined, 500),
      captured_at: clean(typeof parsed.captured_at === 'string' ? parsed.captured_at : undefined, 40),
    };

    return Object.values(acquisition).some(Boolean) ? acquisition : null;
  } catch {
    return null;
  }
}

export function serializeAcquisition(acquisition: Acquisition): string {
  return encodeURIComponent(JSON.stringify(acquisition));
}

export function hasCampaign(acquisition: Acquisition): boolean {
  return Boolean(
    acquisition.source ||
      acquisition.medium ||
      acquisition.campaign ||
      acquisition.content ||
      acquisition.term ||
      acquisition.gclid ||
      acquisition.fbclid,
  );
}
