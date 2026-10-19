'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Eye, MessageCircle, MousePointerClick, Phone, Send, Smartphone, Monitor, type LucideIcon } from 'lucide-react';
import { ActivityItem, ApiError, getActivity } from '../../../lib/api';
import { formatRelative, sourceMeta } from '../../../lib/format';
import { Skeleton } from '../ui';

const POLL_MS = 30_000;

const EVENT: Record<ActivityItem['type'], { icon: LucideIcon; text: (t: string | null) => string; tone: string }> = {
  page_view: { icon: Eye, text: () => 'Membuka halaman Anda', tone: 'bg-paper-2 text-ink-2' },
  service_view: { icon: MousePointerClick, text: (t) => (t ? `Mengklik layanan ${t}` : 'Mengklik kartu layanan'), tone: 'bg-paper-2 text-ink-2' },
  whatsapp_click: {
    icon: MessageCircle,
    text: (t) => (t && t !== 'CTA Utama' ? `Chat WhatsApp tentang ${t}` : 'Chat WhatsApp'),
    tone: 'bg-accent-soft text-accent',
  },
  phone_click: { icon: Phone, text: () => 'Menelepon Anda', tone: 'bg-accent-soft text-accent' },
  lead_submit: { icon: Send, text: (t) => (t ? `Mengirim pesan: ${t}` : 'Mengirim pesan'), tone: 'bg-accent-soft text-accent' },
};

/* Feed live: memberi rasa "bisnis saya hidup". Polling 30 dtk, berhenti saat tab tidak aktif.
 * Satu-satunya gerak: item baru masuk dengan fade+slide (motivasi: ada data baru). */
export function ActivityFeed({ businessId }: { businessId: string }) {
  const reduce = useReducedMotion();
  const [items, setItems] = useState<ActivityItem[] | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState('');
  const seen = useRef<Set<string>>(new Set());
  const [fresh, setFresh] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    seen.current = new Set();

    const load = async (initial: boolean) => {
      try {
        const list = await getActivity(businessId, 10);
        if (cancelled) return;
        const newIds = initial ? new Set<string>() : new Set(list.filter((i) => !seen.current.has(i.id)).map((i) => i.id));
        list.forEach((i) => seen.current.add(i.id));
        setItems(list);
        setFresh(newIds);
        setNow(Date.now());
        setError('');
      } catch (err) {
        if (!cancelled && !(err instanceof ApiError && err.status === 401)) {
          setError('Aktivitas gagal dimuat.');
        }
      }
    };

    load(true);
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load(false);
    }, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && load(false);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [businessId]);

  if (items === null) {
    return (
      <div className="space-y-3 px-5 pb-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  if (error && items.length === 0) return <p className="px-5 pb-5 text-sm text-ink-2">{error}</p>;

  if (items.length === 0) {
    return (
      <p className="px-5 pb-5 text-sm text-ink-2">
        Belum ada aktivitas. Setiap kunjungan dan klik WhatsApp akan muncul di sini secara langsung.
      </p>
    );
  }

  return (
    <ul className="px-3 pb-3" aria-live="polite">
      <AnimatePresence initial={false}>
        {items.map((item) => {
          const ev = EVENT[item.type] ?? EVENT.page_view;
          const Icon = ev.icon;
          const DeviceIcon = item.device === 'desktop' ? Monitor : Smartphone;
          return (
            <motion.li
              key={item.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-1000 ${
                fresh.has(item.id) ? 'bg-accent-soft/60' : ''
              }`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ev.tone}`} aria-hidden="true">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{ev.text(item.targetName)}</p>
                <p className="flex items-center gap-1.5 text-xs text-ink-2">
                  dari {sourceMeta(item.source).label}
                  <DeviceIcon className="h-3 w-3" strokeWidth={1.75} aria-label={item.device} />
                </p>
              </div>
              <time dateTime={item.createdAt} className="shrink-0 text-xs tabular-nums text-ink-2">
                {formatRelative(item.createdAt, now)}
              </time>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
