import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Halaman akun berisi data pribadi; jangan diindeks.
export const metadata: Metadata = {
  title: 'Akun & keamanan — Pajangin',
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
