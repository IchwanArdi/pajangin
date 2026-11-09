'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, Business, getCurrentUser, getMyBusinesses, UserProfile } from '../../lib/api';

interface BusinessContextValue {
  business: Business | null;
  user: UserProfile | null;
  status: 'loading' | 'ready' | 'error';
  error: string;
  replaceBusiness: (biz: Business) => void;
  replaceUser: (user: UserProfile) => void;
  reload: () => void;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

// Sumber data bisnis untuk seluruh area /dashboard.
// Aturan produk: satu akun Google hanya mengelola satu bisnis.
export function BusinessProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMyBusinesses(), getCurrentUser().catch(() => null)])
      .then(([list, profile]) => {
        if (cancelled) return;
        // akun tanpa bisnis → onboarding, bukan dashboard kosong
        if (list.length === 0) {
          router.replace('/onboarding');
          return;
        }
        setBusiness(list[0]);
        setUser(profile);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled || (err instanceof ApiError && err.status === 401)) return; // 401 → sudah diarahkan ke /login
        setError(err instanceof Error ? err.message : 'Gagal memuat data bisnis.');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey, router]);

  const replaceBusiness = useCallback((biz: Business) => {
    setBusiness((current) => (current?.id === biz.id ? biz : current));
  }, []);

  const replaceUser = useCallback((next: UserProfile) => {
    setUser(next);
  }, []);

  const reload = useCallback(() => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  }, []);

  const value = useMemo<BusinessContextValue>(
    () => ({
      business,
      user,
      status,
      error,
      replaceBusiness,
      replaceUser,
      reload,
    }),
    [business, user, status, error, replaceBusiness, replaceUser, reload],
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness harus dipakai di dalam <BusinessProvider>');
  return ctx;
}
