import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Layar sukses punya judul tab sendiri, tetap noindex karena berisi data akun.
export const metadata: Metadata = {
  title: 'Halaman bisnis aktif — Pajangin',
  robots: { index: false, follow: false },
};

export default function OnboardingSuccessLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
