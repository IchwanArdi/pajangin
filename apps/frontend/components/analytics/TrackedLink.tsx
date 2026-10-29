'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import { track, type AnalyticsParams } from '../../lib/marketing-analytics';

type TrackedLinkProps = ComponentProps<typeof Link> & {
  event?: string;
  eventParams?: AnalyticsParams;
};

// Link biasa yang mencatat klik CTA sebelum navigasi. Dipakai di halaman
// marketing yang berupa Server Component.
export default function TrackedLink({
  event = 'cta_clicked',
  eventParams,
  onClick,
  ...props
}: TrackedLinkProps) {
  const handleClick = (clickEvent: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(clickEvent);
    if (!clickEvent.defaultPrevented) track(event, eventParams);
  };

  return <Link {...props} onClick={handleClick} />;
}
