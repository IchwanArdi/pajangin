'use client';

import type { ReactNode } from 'react';
import { openConsentSettings } from '../../lib/marketing-analytics';

export default function CookieSettingsLink({
  className = '',
  children = 'Pengaturan cookie',
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <button type="button" onClick={openConsentSettings} className={className}>
      {children}
    </button>
  );
}
