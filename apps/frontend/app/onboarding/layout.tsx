import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Area akun: jangan diindeks, tetapi link publik tetap boleh diikuti.
export const metadata: Metadata = {
  title: 'Siapkan halaman bisnis — Pajangin',
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
