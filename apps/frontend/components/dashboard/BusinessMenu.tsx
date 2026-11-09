'use client';

import Link from 'next/link';
import { ChevronsUpDown, ExternalLink, LogOut, Store, UserRound } from 'lucide-react';
import { useBusiness } from './BusinessContext';
import { Popover } from './Popover';
import { initials } from '../../lib/format';

export function BusinessAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg bg-ink font-semibold text-paper ${
        size === 'sm' ? 'h-7 w-7 text-[11px]' : 'h-8 w-8 text-xs'
      }`}
    >
      {initials(name)}
    </span>
  );
}

// Identitas bisnis + menu akun. Satu akun hanya mengelola satu bisnis.
export function BusinessMenu({ onLogout, compact = false }: { onLogout: () => void; compact?: boolean }) {
  const { business, user } = useBusiness();
  if (!business) return null;

  return (
    <Popover
      className={compact ? 'w-[min(20rem,calc(100vw-2rem))]' : 'w-64'}
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={id}
          aria-label="Menu bisnis dan akun"
          className={`flex w-full min-w-0 items-center gap-2.5 rounded-(--radius-input) text-left transition-colors hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
            compact ? 'p-1 pr-2' : 'p-2'
          }`}
        >
          <BusinessAvatar name={business.name} size={compact ? 'sm' : 'md'} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink">{business.name}</span>
            {!compact && <span className="block truncate text-xs text-ink-2">{business.city}</span>}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-2" strokeWidth={1.75} />
        </button>
      )}
    >
      {(close) => (
        <div role="menu" aria-label="Menu bisnis dan akun">
          <div className="px-2.5 pb-1.5 pt-1">
            <p className="text-xs font-medium text-ink-2">Bisnis Anda</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink">{business.name}</p>
            <p className="truncate text-xs text-ink-2">{business.city}</p>
          </div>
          <div className="my-1.5 h-px bg-rule" />
          <a
            href={`/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-rule text-ink-2">
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
            </span>
            Lihat halaman publik
          </a>
          <Link
            href="/dashboard/profil"
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-rule text-ink-2">
              <Store className="h-4 w-4" strokeWidth={1.75} />
            </span>
            Profil bisnis
          </Link>
          <Link
            href="/dashboard/akun"
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-rule text-ink-2">
              <UserRound className="h-4 w-4" strokeWidth={1.75} />
            </span>
            Akun &amp; keamanan
          </Link>
          <div className="my-1.5 h-px bg-rule" />
          {user && <p className="truncate px-2.5 py-1 text-xs text-ink-2">{user.email}</p>}
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none"
          >
            <LogOut className="h-4 w-4 text-ink-2" strokeWidth={1.75} />
            Keluar
          </button>
        </div>
      )}
    </Popover>
  );
}
