'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Info, Lightbulb, Sparkles, TriangleAlert, type LucideIcon } from 'lucide-react';
import { MarketingInsight, updateService } from '../../../lib/api';
import { btn } from '../ui';

/* Pola Attio 2026: rekomendasi bukan cuma menjelaskan — tiap kartu punya SATU aksi yang bisa langsung dilakukan.
 * Warna = makna: kuning perlu perhatian, hijau bagus, coral peluang. */

const TONE: Record<MarketingInsight['type'], { icon: LucideIcon; iconClass: string; label: string }> = {
  warning: { icon: TriangleAlert, iconClass: 'bg-warning-soft text-warning', label: 'Perlu perhatian' },
  success: { icon: Sparkles, iconClass: 'bg-positive-soft text-positive', label: 'Berjalan baik' },
  opportunity: { icon: Lightbulb, iconClass: 'bg-accent-soft text-accent', label: 'Peluang' },
  info: { icon: Info, iconClass: 'bg-paper-2 text-ink-2', label: 'Info' },
};

export function Recommendations({
  insights,
  businessId,
  onShare,
  onChanged,
}: {
  insights: MarketingInsight[];
  businessId: string;
  onShare: () => void;
  onChanged: () => void;
}) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (insights.length === 0) {
    return <p className="px-5 pb-5 text-sm text-ink-2">Tidak ada rekomendasi untuk periode ini. Semua terlihat baik.</p>;
  }

  const markFeatured = async (insight: MarketingInsight) => {
    if (!insight.targetId) return;
    setBusy(insight.id);
    setError('');
    try {
      await updateService(businessId, insight.targetId, { is_featured: true });
      setDone((d) => ({ ...d, [insight.id]: true }));
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.');
    } finally {
      setBusy(null);
    }
  };

  const action = (insight: MarketingInsight) => {
    if (done[insight.id]) {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-positive">
          <Check className="h-4 w-4" strokeWidth={2} /> Sudah dijadikan andalan
        </span>
      );
    }
    const cls = `${btn.secondary} ${btn.sm}`;
    switch (insight.id) {
      case 'friction_detected':
        return (
          <Link href={`/dashboard/layanan?edit=${insight.targetId ?? ''}`} className={cls}>
            Perbaiki layanan
          </Link>
        );
      case 'star_performer':
        return (
          <button type="button" onClick={() => markFeatured(insight)} disabled={busy === insight.id} className={cls}>
            {busy === insight.id ? 'Menyimpan…' : 'Jadikan andalan'}
          </button>
        );
      case 'seo_opportunity':
      case 'strong_seo':
        return (
          <Link href="/dashboard/profil" className={cls}>
            Lengkapi profil
          </Link>
        );
      case 'no_contacts':
        return (
          <Link href="/dashboard/layanan" className={cls}>
            Periksa layanan
          </Link>
        );
      case 'no_data_yet':
        return (
          <button type="button" onClick={onShare} className={cls}>
            Salin link halaman
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {error && <p className="mx-5 mb-3 rounded-(--radius-input) bg-negative-soft px-3 py-2 text-sm text-negative">{error}</p>}
      <ul className="divide-y divide-rule border-t border-rule">
        {insights.map((insight) => {
          const tone = TONE[insight.type];
          const Icon = tone.icon;
          return (
            <li key={insight.id} className="flex gap-3.5 px-5 py-4">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone.iconClass}`} aria-hidden="true">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="sr-only">{tone.label}</p>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <h3 className="text-sm font-semibold text-ink">{insight.title}</h3>
                  {insight.metric && <span className="font-mono text-xs text-ink-2">{insight.metric}</span>}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">
                  {insight.description} {insight.recommendation}
                </p>
                <div className="mt-3">{action(insight)}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
