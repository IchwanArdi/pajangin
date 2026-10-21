'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/* Origin browser tidak tersedia saat SSR. Hook ini memakai server snapshot kosong,
 * lalu membaca origin asli di client tanpa memicu hydration mismatch. */
export function useBrowserOrigin(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => '',
  );
}
