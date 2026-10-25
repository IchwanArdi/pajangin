'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MessageCircle, MessageSquare, RefreshCw, Search } from 'lucide-react';
import { getLeads, type LeadItem } from '../../../lib/api';
import { toWaNumber } from '../../../lib/whatsapp';
import { useBusiness } from '../../../components/dashboard/BusinessContext';
import { Badge, Card, InfoNote, PageHeader, Skeleton, btn, field } from '../../../components/dashboard/ui';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

function jakartaDay(value: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
}

export default function LeadsPage() {
  const { business } = useBusiness();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = useCallback(
    async (showSkeleton = true) => {
      if (!business) return;
      if (showSkeleton) setLoading(true);
      else setRefreshing(true);
      setError('');
      try {
        setLeads(await getLeads(business.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat pesan masuk.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [business],
  );

  useEffect(() => {
    if (!business) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getLeads(business.id);
        if (!cancelled) setLeads(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Gagal memuat pesan masuk.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [business]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(q) ||
        lead.phone.includes(q) ||
        (lead.message || '').toLowerCase().includes(q) ||
        (lead.service_name || '').toLowerCase().includes(q),
    );
  }, [leads, query]);

  const today = jakartaDay(new Date());
  const todayCount = leads.filter((lead) => jakartaDay(new Date(lead.created_at)) === today).length;

  if (!business) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pesan masuk"
        helpKey="pesan"
        description="Semua orang yang mengisi form kontak di halaman publik Anda."
        actions={
          <button type="button" onClick={() => load(false)} disabled={refreshing} className={btn.secondary}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            Muat ulang
          </button>
        }
      />

      <InfoNote>
        Halaman ini hanya mencatat pesan dari <strong>form kontak</strong> di halaman publik. Chat WhatsApp yang langsung masuk ke HP Anda
        tidak otomatis muncul di sini.
      </InfoNote>

      {error && (
        <p role="alert" className="rounded-(--radius-input) bg-negative-soft px-4 py-3 text-sm text-negative">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-medium text-ink-2">Total pesan</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{leads.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-ink-2">Hari ini (WIB)</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-accent">{todayCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-ink-2">Pesan dengan detail</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-positive">
            {leads.filter((lead) => Boolean(lead.message)).length}
          </p>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-2" strokeWidth={1.75} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama, nomor, atau kebutuhan..."
          className={`${field.input} pl-9`}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-(--radius-card)" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-paper-2 text-ink-2">
            <MessageSquare className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-ink">
            {leads.length === 0 ? 'Belum ada pesan masuk' : 'Tidak ada pesan yang cocok'}
          </h2>
          <p className="mt-1 max-w-md text-sm text-ink-2">
            {leads.length === 0
              ? 'Bagikan halaman publik Anda. Setiap form kontak yang dikirim akan muncul di sini, lengkap dengan nomor WhatsApp.'
              : 'Coba kata kunci lain atau hapus filter pencarian.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const wa = `https://wa.me/${toWaNumber(lead.phone)}?text=${encodeURIComponent(
              `Halo ${lead.name}, terima kasih sudah menghubungi ${business.name}.`,
            )}`;
            return (
              <Card key={lead.id} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-ink">{lead.name}</h2>
                      {lead.service_name && <Badge tone="accent">{lead.service_name}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-ink-2">{formatDate(lead.created_at)} WIB</p>
                    <p className="mt-3 text-sm text-ink">
                      <span className="text-ink-2">WhatsApp:</span> {lead.phone}
                    </p>
                    {lead.message && <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{lead.message}</p>}
                  </div>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${btn.primary} shrink-0`}
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                    Balas via WhatsApp
                  </a>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
