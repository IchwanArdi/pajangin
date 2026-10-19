'use client';

import { useEffect } from 'react';
import { sendAnalyticsEvent } from '../lib/api';
import { getAttribution, getDevice, getSessionId } from '../lib/attribution';

export function useSessionId(): string {
  return getSessionId();
}

export function trackBusinessEvent(
  businessId: string,
  eventType: 'service_view' | 'whatsapp_click' | 'phone_click' | 'lead_submit',
  targetId?: string,
  targetName?: string,
) {
  const attribution = getAttribution();

  sendAnalyticsEvent({
    business_id: businessId,
    event_type: eventType,
    target_id: targetId,
    target_name: targetName,
    ...attribution,
    device: getDevice(),
    session_id: getSessionId(),
  });
}

export default function Tracker({ businessId, slug }: { businessId: string; slug: string }) {
  useEffect(() => {
    sendAnalyticsEvent({
      business_id: businessId,
      event_type: 'page_view',
      target_id: slug,
      target_name: 'Beranda ' + slug,
      ...getAttribution(),
      device: getDevice(),
      session_id: getSessionId(),
    });
  }, [businessId, slug]);

  return null;
}
