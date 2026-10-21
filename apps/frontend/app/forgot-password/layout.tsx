import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Halaman auth tidak perlu diindeks; title-nya juga jangan mewarisi homepage.
export const metadata: Metadata = {
  title: 'Lupa kata sandi — Pajangin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
