import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Halaman auth tidak perlu diindeks; title-nya juga jangan mewarisi homepage.
export const metadata: Metadata = {
  title: 'Atur ulang kata sandi — Pajangin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
