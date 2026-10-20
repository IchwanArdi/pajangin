'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  LayoutDashboard,
  LogOut,
  MessageSquarePlus,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

const NAV = [
  { href: '/admin', label: 'Ringkasan', icon: LayoutDashboard, exact: true },
  { href: '/admin/pengguna', label: 'Pengguna', icon: Users, exact: false },
  { href: '/admin/bisnis', label: 'Bisnis', icon: Building2, exact: false },
  { href: '/admin/masukan', label: 'Masukan', icon: MessageSquarePlus, exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await createClient().auth.signOut();
    router.replace('/login');
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-paper">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink text-paper lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-paper/10">
            <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold tracking-tight">
              Pajangin <span className="text-accent">Admin</span>
            </p>
            <p className="text-[11px] text-paper/55">Founder console</p>
          </div>
        </div>

        <nav aria-label="Navigasi admin" className="mt-4 flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-paper/10 text-paper'
                    : 'text-paper/60 hover:bg-paper/5 hover:text-paper'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-accent' : ''}`} strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-paper/10 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-paper/60 transition-colors hover:bg-paper/5 hover:text-paper"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            Kembali ke dashboard
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-paper/60 transition-colors hover:bg-paper/5 hover:text-paper"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Keluar
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-rule bg-paper/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2 text-sm font-extrabold tracking-tight text-ink">
            <ShieldCheck className="h-4 w-4 text-accent" strokeWidth={1.75} />
            Pajangin Admin
          </Link>
          <Link href="/dashboard" className="text-xs font-medium text-ink-2 hover:text-ink">
            Dashboard
          </Link>
        </div>
        <nav aria-label="Navigasi admin" className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? 'bg-ink text-paper' : 'bg-paper-2 text-ink-2 hover:text-ink'
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
