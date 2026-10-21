'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CalendarCheck, ExternalLink, Image as ImageIcon, LayoutDashboard, LogOut, MessageSquare, MessageSquarePlus, Package, QrCode, ShieldCheck, Sparkles, Store, type LucideIcon } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';
import { useBusiness } from './BusinessContext';
import { BusinessSwitcher } from './BusinessSwitcher';
import { ShareMenu } from './ShareMenu';
import { NotificationBell } from './NotificationBell';
import { Skeleton, btn } from './ui';

/* Hallmark · app shell · nav: N3 side-rail (desktop) + bottom tab bar (mobile)
 * Kenapa: pemilik UMKM mayoritas membuka dari HP → navigasi di jangkauan jempol. */

const NAV: Array<{ href: string; label: string; icon: LucideIcon; exact?: boolean }> = [
  { href: '/dashboard', label: 'Ringkasan', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/leads', label: 'Pesan', icon: MessageSquare },
  { href: '/dashboard/layanan', label: 'Layanan', icon: Package },
  { href: '/dashboard/galeri', label: 'Galeri', icon: ImageIcon },
  { href: '/dashboard/booking', label: 'Booking', icon: CalendarCheck },
  { href: '/dashboard/ai', label: 'AI Konten', icon: Sparkles },
  { href: '/dashboard/qr-bio', label: 'QR & Bio', icon: QrCode },
  { href: '/dashboard/profil', label: 'Profil bisnis', icon: Store },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { business, user, status, error, reload } = useBusiness();

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  const logout = async () => {
    await createClient().auth.signOut({ scope: 'local' });
    router.replace('/login');
    router.refresh();
  };

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="max-w-sm space-y-4 text-center">
          <h1 className="text-lg font-semibold text-ink">Dashboard gagal dimuat</h1>
          <p className="text-sm text-ink-2">{error}</p>
          <button type="button" onClick={reload} className={btn.primary}>
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ===== Sidebar (desktop) ===== */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-rule bg-paper lg:flex">
        <div className="flex h-14 items-center justify-between px-5">
          <Link href="/" className="text-[15px] font-extrabold tracking-tight text-ink">
            Pajang<span className="text-accent">in</span>
          </Link>
          <NotificationBell />
        </div>

        <div className="px-3">{status === 'ready' ? <BusinessSwitcher onLogout={logout} /> : <Skeleton className="h-12 w-full" />}</div>

        <nav aria-label="Navigasi dashboard" className="mt-4 flex-1 space-y-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                  active ? 'bg-paper-2 text-ink' : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-accent' : ''}`} strokeWidth={1.75} />
                {label}
              </Link>
            );
          })}
          {business && (
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
              Halaman publik
            </a>
          )}
        </nav>

        <div className="border-t border-rule p-3">
          {user?.is_admin && (
            <Link
              href="/admin"
              className="mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              Admin console
            </Link>
          )}
          <Link
            href="/dashboard/masukan"
            aria-current={isActive('/dashboard/masukan') ? 'page' : undefined}
            className={`mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
              isActive('/dashboard/masukan') ? 'bg-paper-2 text-ink' : 'text-ink-2 hover:bg-paper-2 hover:text-ink'
            }`}
          >
            <MessageSquarePlus className={`h-4 w-4 ${isActive('/dashboard/masukan') ? 'text-accent' : ''}`} strokeWidth={1.75} />
            Bantuan & Masukan
          </Link>
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <Link
              href="/dashboard/akun"
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg transition-colors hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              title="Akun & keamanan"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-3 text-xs font-semibold text-ink">
                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{user?.name ?? '—'}</span>
                <span className="block truncate text-xs text-ink-2">{user?.email ?? ''}</span>
              </span>
            </Link>
            <button type="button" onClick={logout} aria-label="Keluar" title="Keluar" className={btn.icon}>
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== Top bar (mobile) ===== */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-rule bg-paper/90 px-3 backdrop-blur lg:hidden">
        <div className="min-w-0 flex-1">
          {status === 'ready' ? <BusinessSwitcher onLogout={logout} compact /> : <Skeleton className="h-9 w-44" />}
        </div>
        <div className="flex items-center gap-1.5">
          {user?.is_admin && (
            <Link href="/admin" aria-label="Admin console" title="Admin console" className={btn.icon}>
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
            </Link>
          )}
          <Link href="/dashboard/masukan" aria-label="Bantuan & Masukan" title="Bantuan & Masukan" className={btn.icon}>
            <MessageSquarePlus className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <NotificationBell />
          {business && <ShareMenu slug={business.slug} name={business.name} iconOnly />}
        </div>
      </header>

      {/* ===== Konten ===== */}
      <main className="pb-24 lg:pb-0 lg:pl-60">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      {/* ===== Tab bar (mobile) ===== */}
      <nav
        aria-label="Navigasi dashboard"
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between overflow-x-auto border-t border-rule bg-paper/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-w-[56px] flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors ${
                active ? 'text-ink' : 'text-ink-2'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${active ? 'text-accent' : ''}`} strokeWidth={1.75} />
              <span className="truncate">{label.split(' ')[0]}</span>
            </Link>
          );
        })}
        {business ? (
          <a
            href={`/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-ink-2"
          >
            <ExternalLink className="h-5 w-5" strokeWidth={1.75} />
            Halaman
          </a>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
