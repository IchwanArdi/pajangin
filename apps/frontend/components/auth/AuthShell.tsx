import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertCircle, ArrowLeft, ArrowUpRight, BarChart3, CheckCircle2, Globe, Info, MessageCircle } from 'lucide-react';

const PROOF_POINTS = [
  { icon: Globe, label: 'Halaman publik' },
  { icon: MessageCircle, label: 'Chat WA' },
  { icon: BarChart3, label: 'Analitik' },
] as const;

/* Kerangka halaman auth: satu kanvas gelap penuh dengan form sebagai fokus.
 * Panel kanan lama sengaja dihapus agar halaman tidak terbaca sebagai dua layar. */
export default function AuthShell({
  eyebrow = 'Pajangin untuk UMKM',
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="auth-panel relative min-h-dvh overflow-hidden text-paper">
      <div aria-hidden className="auth-panel-grid" />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10 xl:px-14">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-paper" aria-label="Pajangin — beranda">
            Pajang<span className="text-accent">in</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-paper/60 transition-colors hover:text-paper focus-visible:outline-none focus-visible:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
            Beranda
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-6 sm:px-8 sm:py-8 lg:py-5">
          <div className="w-full max-w-[27rem]">
            <div className="space-y-2.5">
              <p className="flex items-center gap-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-accent">
                <span aria-hidden className="h-px w-5 bg-accent" />
                {eyebrow}
              </p>
              <h1 className="text-[1.9rem] font-semibold leading-[1.12] tracking-[-0.03em] text-balance text-paper sm:text-[2rem]">
                {title}
              </h1>
              {subtitle && <p className="text-sm leading-relaxed text-paper/60">{subtitle}</p>}
            </div>

            <div className="auth-surface mt-6 space-y-4 rounded-[1.75rem] border border-paper/10 p-5 sm:p-6">
              {children}
            </div>

            {footer && <div className="mt-5 text-sm text-paper/60">{footer}</div>}

            <div className="auth-proof mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
              {PROOF_POINTS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-paper/10 bg-paper/5 px-2.5 py-1 text-[10px] font-medium text-paper/60"
                >
                  <Icon className="h-3 w-3 text-accent" strokeWidth={1.75} />
                  {label}
                </span>
              ))}
              <Link
                href="/contoh"
                className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-paper/65 transition-colors hover:text-paper focus-visible:outline-none focus-visible:underline sm:ml-auto"
              >
                Lihat contoh halaman
                <ArrowUpRight className="h-3 w-3" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </main>

        <footer className="px-5 pb-4 text-center text-[11px] text-paper/55 sm:px-8 lg:px-10">
          <p>Gratis 100% · Tanpa kartu kredit · Dibuat untuk UMKM lokal</p>
          <nav aria-label="Legal" className="mt-2 flex items-center justify-center gap-4">
            <Link
              href="/syarat"
              className="transition-colors hover:text-paper focus-visible:outline-none focus-visible:underline"
            >
              Syarat &amp; Ketentuan
            </Link>
            <Link
              href="/privasi"
              className="transition-colors hover:text-paper focus-visible:outline-none focus-visible:underline"
            >
              Kebijakan Privasi
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}

/* Alert terang tetap dipakai onboarding; halaman auth memakai AuthAlert di bawah. */
const ALERT_STYLES = {
  error: {
    icon: AlertCircle,
    className: 'border-negative/30 bg-negative-soft text-ink',
    iconClass: 'text-negative',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-positive/30 bg-positive-soft text-ink',
    iconClass: 'text-positive',
  },
  info: {
    icon: Info,
    className: 'border-rule bg-paper-2 text-ink',
    iconClass: 'text-ink-2',
  },
} as const;

export function FormAlert({ tone = 'error', children }: { tone?: 'error' | 'success' | 'info'; children: ReactNode }) {
  const style = ALERT_STYLES[tone];
  const Icon = style.icon;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-sm leading-relaxed ${style.className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconClass}`} strokeWidth={1.75} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const AUTH_ALERT_STYLES = {
  error: {
    icon: AlertCircle,
    className: 'border-negative/40 bg-negative/15 text-paper',
    iconClass: 'text-accent',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-positive/35 bg-positive/10 text-paper',
    iconClass: 'text-positive',
  },
  info: {
    icon: Info,
    className: 'border-paper/15 bg-paper/5 text-paper',
    iconClass: 'text-paper/55',
  },
} as const;

export function AuthAlert({ tone = 'error', children }: { tone?: 'error' | 'success' | 'info'; children: ReactNode }) {
  const style = AUTH_ALERT_STYLES[tone];
  const Icon = style.icon;

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-2xl border p-3.5 text-sm leading-relaxed ${style.className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.iconClass}`} strokeWidth={1.75} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export const authPrimaryButtonClass =
  'group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-ink transition hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50';

/* Style terang di bawah sengaja dipertahankan untuk onboarding. */
export const inputClass =
  'w-full rounded-xl border border-rule bg-paper px-4 py-3 text-sm text-ink placeholder:text-ink-2/60 transition hover:border-ink-3/40 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 aria-invalid:border-negative aria-invalid:ring-negative/10 disabled:cursor-not-allowed disabled:opacity-60';

export const labelClass = 'mb-1.5 block text-[13px] font-semibold text-ink';

export const primaryButtonClass =
  'group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-ink transition hover:opacity-90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export const secondaryButtonClass =
  'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-rule bg-surface px-6 py-3.5 text-sm font-semibold text-ink transition hover:border-ink-3/30 hover:bg-paper-2 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-50';
