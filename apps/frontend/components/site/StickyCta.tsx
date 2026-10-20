'use client';

import { MessageCircle, Phone } from 'lucide-react';

interface Props {
  label: string;
  waLink: string;
  phone?: string | null;
  onWhatsAppClick: () => void;
  onPhoneClick: () => void;
}

export default function StickyCta({ label, waLink, phone, onWhatsAppClick, onPhoneClick }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-[backdrop-filter]:bg-paper/85 md:hidden">
      <div className="mx-auto flex max-w-md gap-3">
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onWhatsAppClick()}
          className="press flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-center text-sm font-bold text-accent-ink shadow-sm hover:opacity-95"
        >
          <MessageCircle className="h-4 w-4" />
          {label}
        </a>
        {phone && (
          <a
            href={`tel:${phone}`}
            onClick={onPhoneClick}
            className="press flex items-center justify-center gap-2 rounded-full border border-rule bg-paper px-5 py-3 text-center text-sm font-bold text-ink"
          >
            <Phone className="h-4 w-4" />
            Telepon
          </a>
        )}
      </div>
    </div>
  );
}
