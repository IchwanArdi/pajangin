'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ApiError, Business, getCurrentUser, getMyBusinesses, UserProfile } from '../../lib/api';

const STORAGE_KEY = 'mos_selected_business';

interface BusinessContextValue {
  businesses: Business[];
  business: Business | null;
  user: UserProfile | null;
  status: 'loading' | 'ready' | 'error';
  error: string;
  selectBusiness: (id: string) => void;
  replaceBusiness: (biz: Business) => void;
  reload: () => void;
}

const BusinessContext = createContext<BusinessContextValue | null>(null);

// Sumber data bisnis untuk seluruh area /dashboard (sidebar, ringkasan, layanan, profil)
export function BusinessProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryBizId = searchParams.get('biz');

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
        const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        const initial =
          list.find((b) => b.id === queryBizId) ?? list.find((b) => b.id === stored) ?? list[0];
        setBusinesses(list);
        setSelectedId(initial.id);
        localStorage.setItem(STORAGE_KEY, initial.id);
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
  }, [queryBizId, reloadKey, router]);

  const selectBusiness = useCallback((id: string) => {
    setSelectedId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const replaceBusiness = useCallback((biz: Business) => {
    setBusinesses((prev) => prev.map((b) => (b.id === biz.id ? biz : b)));
  }, []);

  const reload = useCallback(() => {
    setStatus('loading');
    setReloadKey((k) => k + 1);
  }, []);

  const value = useMemo<BusinessContextValue>(
    () => ({
      businesses,
      business: businesses.find((b) => b.id === selectedId) ?? null,
      user,
      status,
      error,
      selectBusiness,
      replaceBusiness,
      reload,
    }),
    [businesses, selectedId, user, status, error, selectBusiness, replaceBusiness, reload],
  );

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness harus dipakai di dalam <BusinessProvider>');
  return ctx;
}
