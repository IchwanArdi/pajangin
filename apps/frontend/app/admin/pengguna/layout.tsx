import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Metadata per halaman; layout induk tetap menangani proteksi dan noindex.
export const metadata: Metadata = {
  title: 'Pengguna — Pajangin Admin',
};

export default function AdminUsersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
