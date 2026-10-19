import { Suspense, type ReactNode } from 'react';
import type { Metadata } from 'next';
import { BusinessProvider } from '../../components/dashboard/BusinessContext';
import { AppShell } from '../../components/dashboard/AppShell';

export const metadata: Metadata = {
  title: 'Dashboard — Pajangin',
  robots: { index: false },
};

// Area pemilik bisnis: akses dijaga proxy.ts (wajib login)
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <BusinessProvider>
        <AppShell>{children}</AppShell>
      </BusinessProvider>
    </Suspense>
  );
}
