import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Metadata per halaman; layout induk tetap menangani proteksi dan noindex.
export const metadata: Metadata = {
  title: 'Bisnis — Pajangin Admin',
};

export default function AdminBusinessesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
