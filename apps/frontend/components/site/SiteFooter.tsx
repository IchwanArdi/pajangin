import Link from 'next/link';
import { MapPin, MessageCircle, Phone } from 'lucide-react';
import type { Business } from '../../lib/api';

interface Props {
  business: Business;
  waLink: string;
  onWhatsAppClick: () => void;
  onPhoneClick: () => void;
}

export default function SiteFooter({ business, waLink, onWhatsAppClick, onPhoneClick }: Props) {
  return (
    <footer className="border-t border-rule bg-paper-2 py-12 text-sm text-ink-2">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-base font-bold text-ink">{business.name}</p>
          {business.tagline && <p className="mt-1.5 max-w-sm leading-relaxed">{business.tagline}</p>}
          <p className="mt-3 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              {business.address}, {business.city}
              {business.province ? `, ${business.province}` : ''}
            </span>
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Kontak</p>
          <ul className="mt-3 space-y-2">
            {business.phone && (
              <li>
                <a href={`tel:${business.phone}`} onClick={onPhoneClick} className="inline-flex items-center gap-2 hover:text-ink">
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
                  className="inline-flex items-center gap-2 hover:text-ink"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
            )}
            <li>{business.opening_hours || 'Jam operasional menyusul'}</li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-3">Tentang halaman ini</p>
          <p className="mt-3 leading-relaxed">
            Halaman bisnis {business.name}. Ditenagai oleh{' '}
            <Link href="/" className="font-semibold text-ink hover:text-accent">
              Pajangin
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-6xl px-5">
        <p className="border-t border-rule pt-6 text-xs">
          © {new Date().getFullYear()} {business.name}. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
