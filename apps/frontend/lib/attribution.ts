export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
}

const ATTRIBUTION_KEY = 'mos_attribution';
const SESSION_KEY = 'mos_sess_id';

function clean(value: string | null, max = 100): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
}

// Simpan atribusi pertama dalam sesi. Kalau pengunjung membuka link QR
// (?utm_source=qr_bio), semua event berikutnya memakai sumber yang sama.
export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};

  let stored: Attribution | null = null;
  try {
    stored = JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || 'null') as Attribution | null;
  } catch {
    stored = null;
  }

  const params = new URLSearchParams(window.location.search);
  const fromUrl: Attribution = {
    utm_source: clean(params.get('utm_source')),
    utm_medium: clean(params.get('utm_medium')),
    utm_campaign: clean(params.get('utm_campaign')),
  };
  const hasCampaign = Boolean(fromUrl.utm_source || fromUrl.utm_medium || fromUrl.utm_campaign);

  if (hasCampaign) {
    const merged: Attribution = {
      utm_source: fromUrl.utm_source || stored?.utm_source,
      utm_medium: fromUrl.utm_medium || stored?.utm_medium,
      utm_campaign: fromUrl.utm_campaign || stored?.utm_campaign,
      referrer: stored?.referrer || clean(document.referrer, 1000),
    };
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(merged));
    return merged;
  }

  if (stored) return stored;

  const initial: Attribution = { referrer: clean(document.referrer, 1000) };
  sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(initial));
  return initial;
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function getDevice(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth < 768 ? 'mobile' : 'desktop';
}
