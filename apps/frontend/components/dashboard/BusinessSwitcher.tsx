'use client';

import Link from 'next/link';
import { Check, ChevronsUpDown, LogOut, Plus } from 'lucide-react';
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

// Pemilih bisnis (multi-tenant) + akses tambah bisnis & keluar
export function BusinessSwitcher({ onLogout, compact = false }: { onLogout: () => void; compact?: boolean }) {
  const { businesses, business, selectBusiness, user } = useBusiness();
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
        <div role="menu" aria-label="Pilih bisnis">
          <p className="px-2.5 pb-1 pt-1.5 text-xs font-medium text-ink-2">Bisnis Anda</p>
          {businesses.map((b) => (
            <button
              key={b.id}
              type="button"
              role="menuitemradio"
              aria-checked={b.id === business.id}
              onClick={() => {
                selectBusiness(b.id);
                close();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none"
            >
              <BusinessAvatar name={b.name} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">{b.name}</span>
                <span className="block truncate text-xs text-ink-2">{b.city}</span>
              </span>
              {b.id === business.id && <Check className="h-4 w-4 text-accent" strokeWidth={2} />}
            </button>
          ))}
          <div className="my-1.5 h-px bg-rule" />
          <Link
            href="/onboarding"
            role="menuitem"
            onClick={close}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-paper-2 focus-visible:bg-paper-2 focus-visible:outline-none"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed border-rule text-ink-2">
              <Plus className="h-4 w-4" strokeWidth={1.75} />
            </span>
            Tambah bisnis
          </Link>
          {compact && (
            <>
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
            </>
          )}
        </div>
      )}
    </Popover>
  );
}
