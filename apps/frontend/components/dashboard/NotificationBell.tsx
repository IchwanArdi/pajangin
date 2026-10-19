'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, CalendarCheck, ExternalLink, MessageCircle, Phone, Send, X } from 'lucide-react';
import { getNotifications, NotificationItem, testNotification } from '../../lib/api';
import { useBusiness } from './BusinessContext';
import { toWaNumber } from '../../lib/whatsapp';

function formatTimeAgo(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export function NotificationBell() {
  const { business } = useBusiness();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [testingWa, setTestingWa] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = useCallback(async () => {
    if (!business) return;
    try {
      const data = await getNotifications(business.id);
      setItems(data.items);
      setUnreadCount(data.unread_count);
    } catch {
      // ignore background polling error
    }
  }, [business]);

  useEffect(() => {
    if (!business) return;

    let ignore = false;

    const load = async () => {
      try {
        const data = await getNotifications(business.id);
        if (!ignore) {
          setItems(data.items);
          setUnreadCount(data.unread_count);
        }
      } catch {
        // ignore background polling error
      }
    };

    void load();

    // Real-time polling setiap 25 detik
    const timer = setInterval(() => {
      void fetchAlerts();
    }, 25000);
    return () => {
      ignore = true;
      clearInterval(timer);
    };
  }, [business, fetchAlerts]);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleTestWhatsApp = async () => {
    if (!business || testingWa) return;
    setTestingWa(true);
    setTestResult(null);
    try {
      const res = await testNotification(business.id);
      setTestResult(res);
      setTimeout(() => setTestResult(null), 6000);
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Gagal mengirim pesan uji coba WhatsApp.',
      });
      setTimeout(() => setTestResult(null), 6000);
    } finally {
      setTestingWa(false);
    }
  };

  const handleOpenWa = (phone: string, name: string) => {
    const clean = toWaNumber(phone);
    const text = `Halo ${name}, kami dari ${business?.name || 'layanan kami'}...`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifikasi real-time"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-rule bg-surface text-ink-2 transition hover:bg-paper-2 hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-rule bg-paper p-4 shadow-xl backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-ink">Aktivitas Real-time</span>
              {unreadCount > 0 && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">{unreadCount} baru</span>}
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-ink-2 hover:bg-paper-2 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* WhatsApp Gateway Status & Test Button */}
          <div className="mt-3 rounded-xl border border-rule bg-surface p-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-medium text-ink">
                <span className="h-2 w-2 rounded-full bg-ink-3" />
                <span>Notifikasi WhatsApp</span>
              </div>
              <button
                type="button"
                onClick={handleTestWhatsApp}
                disabled={testingWa}
                className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink border border-rule hover:border-ink disabled:opacity-50"
              >
                <Send className="h-3 w-3 text-accent" />
                {testingWa ? 'Mengirim...' : 'Tes WA'}
              </button>
            </div>
            {testResult && <div className={`mt-2 rounded-lg p-2 text-[11px] ${testResult.success ? 'bg-positive-soft text-positive' : 'bg-warning-soft text-warning'}`}>{testResult.message}</div>}
            <p className="mt-1.5 text-[10px] leading-relaxed text-ink-2">Otomatis maksimal 20 pesan per bisnis per hari. Notifikasi dashboard tetap tanpa batas.</p>
          </div>

          {/* Alerts List */}
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink-2">
                <Bell className="mx-auto mb-2 h-6 w-6 opacity-40" />
                Belum ada aktivitas baru. Notifikasi pesanan atau pertanyaan akan muncul otomatis di sini.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className={`rounded-xl border p-2.5 transition ${item.is_new ? 'border-accent/40 bg-accent-soft/20' : 'border-rule bg-surface'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {item.type === 'booking' ? <CalendarCheck className="h-3.5 w-3.5 text-accent" /> : <MessageCircle className="h-3.5 w-3.5 text-positive" />}
                      <span className="text-xs font-bold text-ink">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-ink-2 whitespace-nowrap">{formatTimeAgo(item.created_at)}</span>
                  </div>

                  <p className="mt-1 text-[11px] text-ink-2 line-clamp-2">{item.description}</p>

                  <div className="mt-2 flex items-center justify-between border-t border-rule/60 pt-2 text-[11px]">
                    <button type="button" onClick={() => handleOpenWa(item.customer_phone, item.customer_name)} className="inline-flex items-center gap-1 font-medium text-positive hover:underline">
                      <Phone className="h-3 w-3" />
                      Chat WhatsApp
                    </button>

                    {item.type === 'booking' && (
                      <Link href="/dashboard/booking" onClick={() => setOpen(false)} className="inline-flex items-center gap-0.5 text-ink-2 hover:text-ink font-medium">
                        Detail
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                    {item.type === 'lead' && (
                      <Link href="/dashboard/leads" onClick={() => setOpen(false)} className="inline-flex items-center gap-0.5 text-ink-2 hover:text-ink font-medium">
                        Detail
                        <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          {items.length > 0 && (
            <div className="mt-3 flex items-center justify-center gap-4 border-t border-rule pt-2">
              <Link href="/dashboard/leads" onClick={() => setOpen(false)} className="text-xs font-semibold text-accent hover:underline">
                Pesan →
              </Link>
              <Link href="/dashboard/booking" onClick={() => setOpen(false)} className="text-xs font-semibold text-accent hover:underline">
                Booking →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
