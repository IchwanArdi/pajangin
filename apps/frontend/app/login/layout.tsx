import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Halaman auth tidak perlu diindeks; title-nya juga jangan mewarisi homepage.
export const metadata: Metadata = {
  title: 'Masuk dengan Google — Pajangin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
