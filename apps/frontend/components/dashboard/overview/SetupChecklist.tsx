'use client';

import Link from 'next/link';
import { Check, ChevronRight } from 'lucide-react';
import type { Business } from '../../../lib/api';

/* Empty state sebagai onboarding (pola Mercury/Supabase): akun baru melihat langkah berikutnya, bukan deretan nol. */
export function getSetupSteps(business: Business, serviceCount: number, hasVisitors: boolean) {
  return [
    { id: 'live', label: 'Halaman bisnis aktif', done: true, href: undefined as string | undefined },
    { id: 'services', label: 'Tambahkan minimal 3 layanan', done: serviceCount >= 3, href: '/dashboard/layanan' },
    {
      id: 'profile',
      label: 'Isi deskripsi dan jam buka',
      done: Boolean(business.description && business.opening_hours),
      href: '/dashboard/profil',
    },
    {
      id: 'links',
      label: 'Tambahkan link Google Maps atau Instagram',
      done: Boolean(business.google_maps_url || business.instagram_url),
      href: '/dashboard/profil',
    },
    {
      id: 'photos',
      label: 'Tambahkan logo dan foto utama',
      done: Boolean(business.logo_url || business.hero_image_url),
      href: '/dashboard/profil',
    },
    { id: 'share', label: 'Bagikan link ke pelanggan', done: hasVisitors, href: undefined },
  ];
}

export function SetupChecklist({ steps, onShare }: { steps: ReturnType<typeof getSetupSteps>; onShare: () => void }) {
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="px-5 pb-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-3" aria-hidden="true">
          <div className="h-full w-full origin-left rounded-full bg-accent transition-transform duration-500" style={{ transform: `scaleX(${doneCount / steps.length})`, transitionTimingFunction: 'var(--ease-out)' }} />
        </div>
        <span className="text-xs font-medium tabular-nums text-ink-2">
          {doneCount}/{steps.length} selesai
        </span>
      </div>

      <ol className="space-y-1">
        {steps.map((s) => {
          const content = (
            <>
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${s.done ? 'border-positive bg-positive text-accent-ink' : 'border-rule bg-surface'}`} aria-hidden="true">
                {s.done && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className={`flex-1 text-sm ${s.done ? 'text-ink-2 line-through decoration-ink-2/40' : 'font-medium text-ink'}`}>
                {s.label}
                <span className="sr-only">{s.done ? ' (selesai)' : ' (belum)'}</span>
              </span>
              {!s.done && <ChevronRight className="h-4 w-4 text-ink-2" strokeWidth={1.75} />}
            </>
          );
          const cls = 'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left';
          if (s.done)
            return (
              <li key={s.id} className={cls}>
                {content}
              </li>
            );
          return (
            <li key={s.id}>
              {s.href ? (
                <Link href={s.href} className={`${cls} hover:bg-paper-2`}>
                  {content}
                </Link>
              ) : (
                <button type="button" onClick={onShare} className={`${cls} hover:bg-paper-2`}>
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
