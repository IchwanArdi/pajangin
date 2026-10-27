import Link from 'next/link';
import { FOOTER_GROUPS } from '../../lib/marketing-content';
import { Container } from './primitives';

export function Footer() {
  return (
    <footer className="border-t border-rule bg-surface">
      <Container className="py-14 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Link href="/" className="text-lg font-extrabold tracking-tight text-ink">
              Pajang<span className="text-accent">in</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              Platform halaman publik, SEO lokal, dan analitik marketing untuk usaha lokal Indonesia — WhatsApp-first, dalam Rupiah.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/login"
                className="press inline-flex whitespace-nowrap rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:opacity-90"
              >
                Mulai gratis
              </Link>
              <Link
                href="/pricing"
                className="press inline-flex whitespace-nowrap rounded-full border border-rule bg-surface px-4 py-2 text-xs font-semibold text-ink transition hover:bg-paper"
              >
                Lihat harga
              </Link>
            </div>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">{group.title}</p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="whitespace-nowrap text-sm text-ink-2 transition hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-rule pt-6 text-xs text-ink-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Pajangin. Dibuat untuk usaha lokal Indonesia.</span>
          <nav aria-label="Legal" className="flex items-center gap-4">
            <Link href="/syarat" className="transition hover:text-ink">
              Syarat &amp; Ketentuan
            </Link>
            <Link href="/privasi" className="transition hover:text-ink">
              Kebijakan Privasi
            </Link>
          </nav>
          <span className="font-mono uppercase tracking-[0.12em]">Halaman publik · SEO lokal · Analitik</span>
        </div>
      </Container>
    </footer>
  );
}
