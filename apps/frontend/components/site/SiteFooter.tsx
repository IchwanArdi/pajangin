import Link from 'next/link';
import { AtSign, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Business } from '../../lib/api';

interface Props {
  business: Business;
  waLink: string;
  onWhatsAppClick: () => void;
  onPhoneClick: () => void;
}

export default function SiteFooter({ business, waLink, onWhatsAppClick, onPhoneClick }: Props) {
  return (
    <footer className="bg-ink text-paper/70">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <p className="font-display text-2xl font-semibold tracking-[-0.02em] text-paper">{business.name}</p>
            {business.tagline && <p className="mt-2 max-w-sm text-sm leading-relaxed">{business.tagline}</p>}
            <p className="mt-4 flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>
                {business.address}, {business.city}
                {business.province ? `, ${business.province}` : ''}
              </span>
            </p>
          </div>

          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-paper/40">Kontak</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {business.phone && (
                <li>
                  <a
                    href={`tel:${business.phone}`}
                    onClick={onPhoneClick}
                    className="inline-flex items-center gap-2 text-paper/80 transition hover:text-paper"
                  >
                    <Phone className="h-4 w-4" />
                    {business.phone}
                  </a>
                </li>
              )}
              {business.whatsapp && (
                <li>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onWhatsAppClick}
                    className="inline-flex items-center gap-2 text-paper/80 transition hover:text-paper"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </li>
              )}
              {business.instagram_url && (
                <li>
                  <a
                    href={business.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-paper/80 transition hover:text-paper"
                  >
                    <AtSign className="h-4 w-4" />
                    Instagram
                  </a>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                {business.opening_hours || 'Jam operasional menyusul'}
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-paper/40">Halaman ini</p>
            <p className="mt-4 text-sm leading-relaxed">
              Halaman resmi {business.name}. Dibuat gratis dengan{' '}
              <Link
                href="/"
                className="font-semibold text-paper underline decoration-paper/30 underline-offset-4 transition hover:decoration-paper"
              >
                Pajangin
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-paper/10 pt-6 text-xs text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {business.name}. Semua hak dilindungi.
          </p>
          <p>Dibuat dengan Pajangin</p>
        </div>
      </div>
    </footer>
  );
}
