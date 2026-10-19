'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, Share2 } from 'lucide-react';
import { Popover } from './Popover';
import { btn } from './ui';

// Bagikan halaman publik: salin link, buka, atau kirim lewat WhatsApp
export function ShareMenu({ slug, name, iconOnly = false }: { slug: string; name: string; iconOnly?: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `/${slug}`;
  const waText = encodeURIComponent(`Kunjungi ${name}: ${url}`);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Popover
      align="end"
      className="w-[min(20rem,calc(100vw-2rem))]"
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={id}
          aria-label="Bagikan halaman"
          className={iconOnly ? btn.icon : btn.secondary}
        >
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
          {!iconOnly && 'Bagikan'}
        </button>
      )}
    >
      {() => (
        <div className="space-y-3 p-2">
          <div>
            <p className="text-sm font-semibold text-ink">Link halaman bisnis</p>
            <p className="text-xs text-ink-2">Tempel di bio Instagram, status WhatsApp, atau Google Maps.</p>
          </div>
          <div className="flex items-center gap-2 rounded-(--radius-input) border border-rule bg-paper px-3 py-2">
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink">{url.replace(/^https?:\/\//, '')}</span>
            <button type="button" onClick={copy} className="shrink-0 text-xs font-semibold text-accent hover:underline">
              {copied ? (
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Tersalin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Copy className="h-3.5 w-3.5" /> Salin
                </span>
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" className={`${btn.secondary} ${btn.sm}`}>
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} /> Buka
            </a>
            <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer" className={`${btn.secondary} ${btn.sm}`}>
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.75} /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </Popover>
  );
}
