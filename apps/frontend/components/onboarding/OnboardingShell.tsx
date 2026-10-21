import Link from 'next/link';
import type { ReactNode } from 'react';

/* Kerangka terang untuk onboarding dan layar sukses.
 * Auth tetap memakai kanvas gelap; area ini sengaja lebih ringan karena berisi formulir data bisnis. */
export default function OnboardingShell({
  children,
  topRight,
}: {
  children: ReactNode;
  topRight?: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-lg font-extrabold tracking-tight" aria-label="Pajangin — beranda">
            Pajang<span className="text-accent">in</span>
          </Link>
          {topRight}
        </div>
      </header>
      <main className="mx-auto max-w-xl space-y-6 px-5 py-10">{children}</main>
    </div>
  );
}
